// hooks/useInterpretasiAI.ts

import { useState, useEffect, useCallback, useRef } from 'react'
import supabaseAnonKey from '@/libs/supabase/anon_key'
import type { AnalysisInterpretasiAI, HasilInterpretasi } from '@/types/analysis'
import type { User } from '@/types/Users'

const TABLE = 'analysis_interpretasi_ai'
const PAGE_SIZE = 10

export type StatusAncaman = 'Aman' | 'Mencurigakan' | 'Berbahaya'

export type TeknikKey = `${string}:${string}`

export type TeknikStatusMap = Record<TeknikKey, StatusAncaman>

export interface InterpretasiSummary {
    perTeknik: TeknikStatusMap
    counts: Record<StatusAncaman, number>
    worstStatus: StatusAncaman
}

export interface InterpretasiInsert {
    analysis_id: string
    analysis_forcedecode_id: string
    hasil: HasilInterpretasi[]
    waktu_proses?: string
}

const SEVERITY: Record<StatusAncaman, number> = { Aman: 0, Mencurigakan: 1, Berbahaya: 2 }

export function makeTeknikKey(channel: string, arah: string): TeknikKey {
    return `${channel}:${arah}` as TeknikKey
}

export function buildTeknikStatusMap(hasil: HasilInterpretasi[]): TeknikStatusMap {
    const map: TeknikStatusMap = {} as TeknikStatusMap
    for (const h of hasil) {
        const key = makeTeknikKey(h.channel, h.arah)
        const cur = map[key]
        const next = h.status_ancaman as StatusAncaman
        if (!cur || SEVERITY[next] > SEVERITY[cur]) map[key] = next
    }
    return map
}

export function summarizeInterpretasi(record: AnalysisInterpretasiAI): InterpretasiSummary {
    const hasil = record.hasil ?? []
    const perTeknik = buildTeknikStatusMap(hasil)
    const counts: Record<StatusAncaman, number> = { Aman: 0, Mencurigakan: 0, Berbahaya: 0 }
    for (const s of Object.values(perTeknik)) counts[s] = (counts[s] ?? 0) + 1
    const worstStatus: StatusAncaman =
        counts.Berbahaya > 0 ? 'Berbahaya' :
            counts.Mencurigakan > 0 ? 'Mencurigakan' : 'Aman'
    return { perTeknik, counts, worstStatus }
}

// ── Tipe enriched ─────────────────────────────────────────────

export type InterpretasiUser = Pick<User, 'id' | 'username' | 'email' | 'photo'>

export interface InterpretasiAIWithUser extends AnalysisInterpretasiAI {
    user?: InterpretasiUser
}

// ── Helper: enrich items dengan data user ─────────────────────
// Relasi: analysis_interpretasi_ai.analysis_id → analysis.user_id → users

async function enrichWithUsers(
    items: AnalysisInterpretasiAI[]
): Promise<InterpretasiAIWithUser[]> {
    if (items.length === 0) return []

    const analysisIds = [
        ...new Set(items.map(i => i.analysis_id).filter((id): id is string => !!id))
    ]
    if (analysisIds.length === 0) return items

    // 1. Ambil user_id dari tabel analysis
    const { data: analysisRows, error: aErr } = await supabaseAnonKey
        .from('analysis')
        .select('id, user_id')
        .in('id', analysisIds)
    if (aErr) throw new Error(aErr.message)

    // Map: analysis_id → user_id
    const analysisToUserId = new Map<string, string>()
    for (const row of analysisRows ?? []) {
        if (row.user_id) analysisToUserId.set(row.id, row.user_id)
    }

    // 2. Ambil data user
    const userIds = [...new Set([...analysisToUserId.values()])]
    if (userIds.length === 0) return items

    const { data: userRows, error: uErr } = await supabaseAnonKey
        .from('users')
        .select('id, username, email, photo')
        .in('id', userIds)
    if (uErr) throw new Error(uErr.message)

    // Map: user_id → user data
    const userMap = new Map<string, InterpretasiUser>()
    for (const u of userRows ?? []) {
        userMap.set(u.id, { id: u.id, username: u.username, email: u.email, photo: u.photo })
    }

    // 3. Attach ke setiap item
    return items.map(item => {
        const userId = item.analysis_id ? analysisToUserId.get(item.analysis_id) : undefined
        const user = userId ? userMap.get(userId) : undefined
        return { ...item, user }
    })
}

// ── State & Return types ──────────────────────────────────────

interface UseInterpretasiAIState {
    items: InterpretasiAIWithUser[]
    total: number
    isLoading: boolean
    isLoadingMore: boolean
    hasMore: boolean
    error: string | null
}

export interface UseInterpretasiAIReturn extends UseInterpretasiAIState {
    loadMore: () => Promise<void>
    refresh: () => Promise<void>
    getById: (id: string) => Promise<InterpretasiAIWithUser | null>
    /** Semua record untuk satu forcedecode (tidak paginated) */
    getByForceDecodeId: (fdId: string) => Promise<InterpretasiAIWithUser[]>
    create: (payload: InterpretasiInsert) => Promise<AnalysisInterpretasiAI>
    update: (id: string, payload: Partial<InterpretasiInsert>) => Promise<AnalysisInterpretasiAI>
    softDelete: (id: string) => Promise<void>
    restore: (id: string) => Promise<void>
    hardDelete: (id: string) => Promise<void>
    /** Ringkasan per-teknik dari satu record */
    summarize: (record: AnalysisInterpretasiAI) => InterpretasiSummary
    /** Build map teknik→status dari array hasil (tanpa record penuh) */
    buildTeknikMap: (hasil: HasilInterpretasi[]) => TeknikStatusMap
}

interface Options {
    /** Filter by analysis_forcedecode_id — paling spesifik */
    forceDecodeId?: string
    /** Filter by analysis_id — jika forceDecodeId tidak diisi */
    analysisId?: string
    includeDeleted?: boolean
}

export function useInterpretasiAI(options: Options = {}): UseInterpretasiAIReturn {
    const { forceDecodeId, analysisId, includeDeleted = false } = options

    const [state, setState] = useState<UseInterpretasiAIState>({
        items: [], total: 0, isLoading: true,
        isLoadingMore: false, hasMore: false, error: null,
    })
    const pageRef = useRef(0)

    const baseQuery = useCallback(() => {
        let q = supabaseAnonKey.from(TABLE).select('*')
        if (forceDecodeId) q = q.eq('analysis_forcedecode_id', forceDecodeId)
        else if (analysisId) q = q.eq('analysis_id', analysisId)
        if (!includeDeleted) q = q.is('deleted_at', null)
        return q
    }, [forceDecodeId, analysisId, includeDeleted])

    // ── Fetch initial ────────────────────────────────────────

    const fetchInitial = useCallback(async () => {
        setState(s => ({ ...s, isLoading: true, error: null }))
        pageRef.current = 0
        try {
            let countQ = supabaseAnonKey.from(TABLE).select('*', { count: 'exact', head: true })
            if (forceDecodeId) countQ = countQ.eq('analysis_forcedecode_id', forceDecodeId)
            else if (analysisId) countQ = countQ.eq('analysis_id', analysisId)
            if (!includeDeleted) countQ = countQ.is('deleted_at', null)
            const { count, error: cErr } = await countQ
            if (cErr) throw cErr

            const { data, error } = await baseQuery()
                .order('created_at', { ascending: false })
                .range(0, PAGE_SIZE - 1)
            if (error) throw error

            const raw = (data ?? []) as AnalysisInterpretasiAI[]
            const items = await enrichWithUsers(raw)
            pageRef.current = 1
            setState(s => ({
                ...s,
                items,
                total: count ?? 0,
                hasMore: items.length < (count ?? 0),
                isLoading: false,
            }))
        } catch (err: any) {
            setState(s => ({ ...s, error: err.message, isLoading: false }))
        }
    }, [baseQuery, forceDecodeId, analysisId, includeDeleted])

    // ── Load more ────────────────────────────────────────────

    const loadMore = useCallback(async () => {
        if (state.isLoadingMore || !state.hasMore) return
        setState(s => ({ ...s, isLoadingMore: true }))
        try {
            const from = pageRef.current * PAGE_SIZE
            const { data, error } = await baseQuery()
                .order('created_at', { ascending: false })
                .range(from, from + PAGE_SIZE - 1)
            if (error) throw error
            const raw = (data ?? []) as AnalysisInterpretasiAI[]
            const newItems = await enrichWithUsers(raw)
            pageRef.current += 1
            setState(s => ({
                ...s,
                items: [...s.items, ...newItems],
                hasMore: s.items.length + newItems.length < s.total,
                isLoadingMore: false,
            }))
        } catch (err: any) {
            setState(s => ({ ...s, error: err.message, isLoadingMore: false }))
        }
    }, [baseQuery, state.isLoadingMore, state.hasMore])

    // ── Read ─────────────────────────────────────────────────

    const getById = useCallback(async (id: string): Promise<InterpretasiAIWithUser | null> => {
        const { data, error } = await supabaseAnonKey
            .from(TABLE).select('*').eq('id', id).single()
        if (error) throw new Error(error.message)
        if (!data) return null
        const [enriched] = await enrichWithUsers([data as AnalysisInterpretasiAI])
        return enriched ?? null
    }, [])

    const getByForceDecodeId = useCallback(async (fdId: string): Promise<InterpretasiAIWithUser[]> => {
        const { data, error } = await supabaseAnonKey
            .from(TABLE).select('*')
            .eq('analysis_forcedecode_id', fdId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
        if (error) throw new Error(error.message)
        return enrichWithUsers((data ?? []) as AnalysisInterpretasiAI[])
    }, [])

    // ── Write ────────────────────────────────────────────────

    const create = useCallback(async (payload: InterpretasiInsert): Promise<AnalysisInterpretasiAI> => {
        const { data, error } = await supabaseAnonKey.from(TABLE)
            .insert({ ...payload, created_at: new Date().toISOString() }).select().single()
        if (error) throw new Error(error.message)
        return data as AnalysisInterpretasiAI
    }, [])

    const update = useCallback(async (
        id: string,
        payload: Partial<InterpretasiInsert>
    ): Promise<AnalysisInterpretasiAI> => {
        const { data, error } = await supabaseAnonKey.from(TABLE)
            .update({ ...payload, updated_at: new Date().toISOString() })
            .eq('id', id).select().single()
        if (error) throw new Error(error.message)
        const updated = data as AnalysisInterpretasiAI
        setState(s => ({
            ...s,
            items: s.items.map(i => i.id === id ? { ...i, ...updated } : i),
        }))
        return updated
    }, [])

    // ── Delete ───────────────────────────────────────────────

    const softDelete = useCallback(async (id: string): Promise<void> => {
        const now = new Date().toISOString()
        const { error } = await supabaseAnonKey.from(TABLE)
            .update({ deleted_at: now, updated_at: now }).eq('id', id)
        if (error) throw new Error(error.message)
        setState(s => ({
            ...s,
            items: includeDeleted
                ? s.items.map(i => i.id === id ? { ...i, deleted_at: now } : i)
                : s.items.filter(i => i.id !== id),
            total: includeDeleted ? s.total : Math.max(0, s.total - 1),
        }))
    }, [includeDeleted])

    const restore = useCallback(async (id: string): Promise<void> => {
        const { error } = await supabaseAnonKey.from(TABLE)
            .update({ deleted_at: null, updated_at: new Date().toISOString() }).eq('id', id)
        if (error) throw new Error(error.message)
        setState(s => ({
            ...s,
            items: s.items.map(i => i.id === id ? { ...i, deleted_at: undefined } : i),
        }))
    }, [])

    const hardDelete = useCallback(async (id: string): Promise<void> => {
        const { error } = await supabaseAnonKey.from(TABLE).delete().eq('id', id)
        if (error) throw new Error(error.message)
        setState(s => ({
            ...s,
            items: s.items.filter(i => i.id !== id),
            total: Math.max(0, s.total - 1),
        }))
    }, [])

    // ── Realtime ─────────────────────────────────────────────

    useEffect(() => {
        const rtFilter = forceDecodeId
            ? `analysis_forcedecode_id=eq.${forceDecodeId}`
            : analysisId ? `analysis_id=eq.${analysisId}` : undefined

        const ch = supabaseAnonKey
            .channel(`rt-${TABLE}-${forceDecodeId ?? analysisId ?? 'all'}`)
            .on('postgres_changes', {
                event: 'INSERT', schema: 'public', table: TABLE,
                ...(rtFilter ? { filter: rtFilter } : {}),
            }, async (p) => {
                const row = p.new as AnalysisInterpretasiAI
                if (!includeDeleted && row.deleted_at) return
                const [enriched] = await enrichWithUsers([row])
                setState(s => ({ ...s, items: [enriched, ...s.items], total: s.total + 1 }))
            })
            .on('postgres_changes', {
                event: 'UPDATE', schema: 'public', table: TABLE,
                ...(rtFilter ? { filter: rtFilter } : {}),
            }, async (p) => {
                const row = p.new as AnalysisInterpretasiAI
                // Pertahankan user yang sudah di-enrich, re-enrich hanya jika analysis_id berubah
                setState(s => {
                    const existing = s.items.find(i => i.id === row.id)
                    const merged: InterpretasiAIWithUser = { ...row, user: existing?.user }
                    return {
                        ...s,
                        items: includeDeleted
                            ? s.items.map(i => i.id === row.id ? merged : i)
                            : row.deleted_at
                                ? s.items.filter(i => i.id !== row.id)
                                : s.items.map(i => i.id === row.id ? merged : i),
                    }
                })
            })
            .on('postgres_changes', {
                event: 'DELETE', schema: 'public', table: TABLE,
                ...(rtFilter ? { filter: rtFilter } : {}),
            }, (p) => {
                setState(s => ({
                    ...s,
                    items: s.items.filter(i => i.id !== p.old.id),
                    total: Math.max(0, s.total - 1),
                }))
            })
            .subscribe()
        return () => { supabaseAnonKey.removeChannel(ch) }
    }, [forceDecodeId, analysisId, includeDeleted])

    useEffect(() => { fetchInitial() }, [fetchInitial])

    return {
        ...state,
        loadMore, refresh: fetchInitial,
        getById, getByForceDecodeId,
        create, update,
        softDelete, restore, hardDelete,
        summarize: (r) => summarizeInterpretasi(r),
        buildTeknikMap: (h) => buildTeknikStatusMap(h),
    }
}
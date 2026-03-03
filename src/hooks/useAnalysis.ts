// hooks/useAnalysis.ts
import { useState, useEffect, useCallback, useRef } from 'react'
import supabaseAnonKey from '@/libs/supabase/anon_key'
import type {
    Analysis,
    AnalysisForceDecode,
    AnalysisInterpretasiAI,
    AnalysisInsert,
    AnalysisUpdate,
    AnalysisResult,
} from '@/types/analysis'

const PAGE_SIZE = 10

// ── Kolom ringan untuk list (TANPA decoded_raw & decoded_bit) ──
// decoded_raw dan decoded_bit bisa puluhan MB per record
// → hanya dibutuhkan di detail page, bukan list
const FD_LIST_COLUMNS = [
    'id',
    'analysis_id',
    'waktu_proses',
    'created_at',
    'updated_at',
    'deleted_at',
].join(', ')

// Kolom AI yang dibutuhkan di list (hasil interpretasi untuk status badge)
// 'hasil' berisi array JSON tapi ukurannya jauh lebih kecil dari decoded_raw
const AI_LIST_COLUMNS = [
    'id',
    'analysis_forcedecode_id',
    'analysis_id',
    'hasil',
    'waktu_proses',
    'created_at',
    'updated_at',
    'deleted_at',
].join(', ')

export interface AnalysisListItem extends Analysis {
    /** force_decode terbaru (tanpa decoded_raw & decoded_bit), null jika belum dijalankan */
    force_decode: AnalysisForceDecode | null
    /** interpretasi AI dari force_decode terbaru, undefined jika belum ada */
    ai_interpretasi: AnalysisInterpretasiAI | undefined
}

interface UseAnalysisState {
    items: AnalysisListItem[]
    total: number
    isLoading: boolean
    isLoadingMore: boolean
    hasMore: boolean
    error: string | null
}

export interface UseAnalysisReturn extends UseAnalysisState {
    loadMore: () => Promise<void>
    refresh: () => Promise<void>
    /** Ambil satu record LENGKAP termasuk decoded_raw & decoded_bit */
    getById: (id: string) => Promise<AnalysisResult | null>
    create: (payload: AnalysisInsert) => Promise<Analysis>
    update: (id: string, payload: AnalysisUpdate) => Promise<Analysis>
    softDelete: (id: string) => Promise<void>
    restore: (id: string) => Promise<void>
    hardDelete: (id: string) => Promise<void>
}

// ── Fetch force_decode ringan (tanpa decoded_raw/bit) ─────────

async function fetchLatestForceDecodes(
    analysisIds: string[]
): Promise<Map<string, AnalysisForceDecode>> {
    if (analysisIds.length === 0) return new Map()

    const { data, error } = await supabaseAnonKey
        .from('analysis_forcedecode')
        .select(FD_LIST_COLUMNS)          // ← hanya kolom ringan
        .in('analysis_id', analysisIds)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    const map = new Map<string, AnalysisForceDecode>()
    for (const row of (data ?? []) as unknown as AnalysisForceDecode[]) {
        if (!map.has(row.analysis_id)) {
            map.set(row.analysis_id, row)
        }
    }
    return map
}

// ── Fetch AI interpretasi untuk list ─────────────────────────

async function fetchLatestInterpretasi(
    forceDecodeIds: string[]
): Promise<Map<string, AnalysisInterpretasiAI>> {
    if (forceDecodeIds.length === 0) return new Map()

    const { data, error } = await supabaseAnonKey
        .from('analysis_interpretasi_ai')
        .select(AI_LIST_COLUMNS)          // ← tanpa kolom besar yang tidak dibutuhkan list
        .in('analysis_forcedecode_id', forceDecodeIds)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    const map = new Map<string, AnalysisInterpretasiAI>()
    for (const row of (data ?? []) as unknown as AnalysisInterpretasiAI[]) {
        if (!map.has(row.analysis_forcedecode_id)) {
            map.set(row.analysis_forcedecode_id, row)
        }
    }
    return map
}

// ── Enrich rows (hanya untuk list, tanpa data besar) ─────────

async function enrichAnalysisRows(rows: Analysis[]): Promise<AnalysisListItem[]> {
    if (rows.length === 0) return []

    const analysisIds = rows.map(r => r.id)
    const fdMap = await fetchLatestForceDecodes(analysisIds)

    const forceDecodeIds = [...fdMap.values()].map(fd => fd.id)
    const aiMap = await fetchLatestInterpretasi(forceDecodeIds)

    return rows.map(analysis => {
        const forceDecode = fdMap.get(analysis.id) ?? null
        const aiInterpretasi = forceDecode
            ? aiMap.get(forceDecode.id)
            : undefined
        return { ...analysis, force_decode: forceDecode, ai_interpretasi: aiInterpretasi }
    })
}

// ── Hook ──────────────────────────────────────────────────────

export function useAnalysis(
    userId?: string,
    includeDeleted = false
): UseAnalysisReturn {
    const [state, setState] = useState<UseAnalysisState>({
        items: [],
        total: 0,
        isLoading: true,
        isLoadingMore: false,
        hasMore: false,
        error: null,
    })
    const pageRef = useRef(0)

    const baseQuery = useCallback(() => {
        let q = supabaseAnonKey.from('analysis').select('*')
        if (userId) q = q.eq('user_id', userId)
        if (!includeDeleted) q = q.is('deleted_at', null)
        return q
    }, [userId, includeDeleted])

    // ── Initial fetch ────────────────────────────────────────

    const fetchInitial = useCallback(async () => {
        setState(s => ({ ...s, isLoading: true, error: null }))
        pageRef.current = 0
        try {
            let countQ = supabaseAnonKey
                .from('analysis')
                .select('*', { count: 'exact', head: true })
            if (userId) countQ = countQ.eq('user_id', userId)
            if (!includeDeleted) countQ = countQ.is('deleted_at', null)
            const { count, error: countError } = await countQ
            if (countError) throw countError

            const { data: analysisRows, error: analysisError } = await baseQuery()
                .order('created_at', { ascending: false })
                .range(0, PAGE_SIZE - 1)
            if (analysisError) throw analysisError

            const items = await enrichAnalysisRows((analysisRows ?? []) as Analysis[])
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
    }, [baseQuery, userId, includeDeleted])

    // ── Load more ────────────────────────────────────────────

    const loadMore = useCallback(async () => {
        if (state.isLoadingMore || !state.hasMore) return
        setState(s => ({ ...s, isLoadingMore: true }))
        try {
            const from = pageRef.current * PAGE_SIZE
            const { data: analysisRows, error: analysisError } = await baseQuery()
                .order('created_at', { ascending: false })
                .range(from, from + PAGE_SIZE - 1)
            if (analysisError) throw analysisError

            const newItems = await enrichAnalysisRows((analysisRows ?? []) as Analysis[])
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

    // ── getById — fetch LENGKAP termasuk decoded_raw & decoded_bit ──
    // Ini hanya dipanggil di detail page, bukan list, jadi select(*) aman

    const getById = useCallback(async (id: string): Promise<AnalysisResult | null> => {
        // 1. Analysis
        const { data: analysis, error: analysisError } = await supabaseAnonKey
            .from('analysis')
            .select('*')
            .eq('id', id)
            .single()
        if (analysisError) throw new Error(analysisError.message)
        if (!analysis) return null

        // 2. Force decode terbaru — SELECT * diperlukan untuk decoded_raw & decoded_bit
        const { data: forceDecode, error: forceError } = await supabaseAnonKey
            .from('analysis_forcedecode')
            .select('*')                   // full fetch untuk detail page
            .eq('analysis_id', id)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()
        if (forceError) throw new Error(forceError.message)

        // 3. AI interpretasi
        let aiInterpretasi: AnalysisInterpretasiAI | undefined = undefined
        if (forceDecode) {
            const { data: ai, error: aiError } = await supabaseAnonKey
                .from('analysis_interpretasi_ai')
                .select('*')
                .eq('analysis_forcedecode_id', forceDecode.id)
                .is('deleted_at', null)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle()
            if (aiError) throw new Error(aiError.message)
            aiInterpretasi = ai ?? undefined
        }

        return {
            analysis: analysis as Analysis,
            forceDecode: forceDecode as AnalysisForceDecode | null,
            aiInterpretasi,
        }
    }, [])

    // ── Create ───────────────────────────────────────────────

    const create = useCallback(async (payload: AnalysisInsert): Promise<Analysis> => {
        const { data, error } = await supabaseAnonKey
            .from('analysis')
            .insert({ ...payload, created_at: new Date().toISOString() })
            .select()
            .single()
        if (error) throw new Error(error.message)
        return data as Analysis
    }, [])

    // ── Update ───────────────────────────────────────────────

    const update = useCallback(async (id: string, payload: AnalysisUpdate): Promise<Analysis> => {
        const { data, error } = await supabaseAnonKey
            .from('analysis')
            .update({ ...payload, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single()
        if (error) throw new Error(error.message)
        const updated = data as Analysis
        setState(s => ({
            ...s,
            items: s.items.map(i =>
                i.id === id
                    ? { ...updated, force_decode: i.force_decode, ai_interpretasi: i.ai_interpretasi }
                    : i
            ),
        }))
        return updated
    }, [])

    // ── Soft delete ──────────────────────────────────────────

    const softDelete = useCallback(async (id: string): Promise<void> => {
        const now = new Date().toISOString()
        const { error } = await supabaseAnonKey
            .from('analysis')
            .update({ deleted_at: now, updated_at: now })
            .eq('id', id)
        if (error) throw new Error(error.message)
        setState(s => ({
            ...s,
            items: includeDeleted
                ? s.items.map(i => i.id === id ? { ...i, deleted_at: now } : i)
                : s.items.filter(i => i.id !== id),
            total: includeDeleted ? s.total : Math.max(0, s.total - 1),
        }))
    }, [includeDeleted])

    // ── Restore ──────────────────────────────────────────────

    const restore = useCallback(async (id: string): Promise<void> => {
        const { error } = await supabaseAnonKey
            .from('analysis')
            .update({ deleted_at: null, updated_at: new Date().toISOString() })
            .eq('id', id)
        if (error) throw new Error(error.message)
        setState(s => ({
            ...s,
            items: s.items.map(i => i.id === id ? { ...i, deleted_at: undefined } : i),
        }))
    }, [])

    // ── Hard delete ──────────────────────────────────────────

    const hardDelete = useCallback(async (id: string): Promise<void> => {
        const { error } = await supabaseAnonKey
            .from('analysis')
            .delete()
            .eq('id', id)
        if (error) throw new Error(error.message)
    }, [])

    // ── Realtime subscriptions ───────────────────────────────

    useEffect(() => {
        const userFilter = userId ? `user_id=eq.${userId}` : undefined

        const channel = supabaseAnonKey
            .channel(`realtime-analysis-${userId ?? 'all'}`)

            .on('postgres_changes', {
                event: 'INSERT', schema: 'public', table: 'analysis',
                ...(userFilter ? { filter: userFilter } : {}),
            }, (payload) => {
                const newRow = payload.new as Analysis
                if (!includeDeleted && newRow.deleted_at) return
                setState(s => ({
                    ...s,
                    items: [{ ...newRow, force_decode: null, ai_interpretasi: undefined }, ...s.items],
                    total: s.total + 1,
                }))
            })

            .on('postgres_changes', {
                event: 'UPDATE', schema: 'public', table: 'analysis',
                ...(userFilter ? { filter: userFilter } : {}),
            }, (payload) => {
                const updated = payload.new as Analysis
                setState(s => ({
                    ...s,
                    items: includeDeleted
                        ? s.items.map(i => i.id === updated.id
                            ? { ...updated, force_decode: i.force_decode, ai_interpretasi: i.ai_interpretasi }
                            : i)
                        : updated.deleted_at
                            ? s.items.filter(i => i.id !== updated.id)
                            : s.items.map(i => i.id === updated.id
                                ? { ...updated, force_decode: i.force_decode, ai_interpretasi: i.ai_interpretasi }
                                : i),
                }))
            })

            .on('postgres_changes', {
                event: 'DELETE', schema: 'public', table: 'analysis',
                ...(userFilter ? { filter: userFilter } : {}),
            }, (payload) => {
                setState(s => ({
                    ...s,
                    items: s.items.filter(i => i.id !== payload.old.id),
                    total: Math.max(0, s.total - 1),
                }))
            })

            .on('postgres_changes', {
                event: 'INSERT', schema: 'public', table: 'analysis_forcedecode',
            }, (payload) => {
                const fd = payload.new as AnalysisForceDecode
                // Realtime hanya update kolom ringan (tidak ada decoded_raw di payload.new)
                setState(s => ({
                    ...s,
                    items: s.items.map(i =>
                        i.id === fd.analysis_id ? { ...i, force_decode: fd } : i
                    ),
                }))
            })

            .on('postgres_changes', {
                event: 'UPDATE', schema: 'public', table: 'analysis_forcedecode',
            }, (payload) => {
                const fd = payload.new as AnalysisForceDecode
                setState(s => ({
                    ...s,
                    items: s.items.map(i =>
                        i.force_decode?.id === fd.id ? { ...i, force_decode: fd } : i
                    ),
                }))
            })

            .on('postgres_changes', {
                event: 'INSERT', schema: 'public', table: 'analysis_interpretasi_ai',
            }, (payload) => {
                const ai = payload.new as AnalysisInterpretasiAI
                setState(s => ({
                    ...s,
                    items: s.items.map(i =>
                        i.force_decode?.id === ai.analysis_forcedecode_id
                            ? { ...i, ai_interpretasi: ai }
                            : i
                    ),
                }))
            })

            .on('postgres_changes', {
                event: 'UPDATE', schema: 'public', table: 'analysis_interpretasi_ai',
            }, (payload) => {
                const ai = payload.new as AnalysisInterpretasiAI
                setState(s => ({
                    ...s,
                    items: s.items.map(i =>
                        i.ai_interpretasi?.id === ai.id
                            ? { ...i, ai_interpretasi: ai }
                            : i
                    ),
                }))
            })

            .subscribe()

        return () => { supabaseAnonKey.removeChannel(channel) }
    }, [userId, includeDeleted])

    useEffect(() => { fetchInitial() }, [fetchInitial])

    return {
        ...state,
        loadMore,
        refresh: fetchInitial,
        getById,
        create,
        update,
        softDelete,
        restore,
        hardDelete,
    }
}
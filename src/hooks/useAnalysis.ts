// hooks/useAnalysis.ts

import { useState, useEffect, useCallback, useRef } from 'react'
import supabaseAnonKey from '@/libs/supabase/anon_key'
import type {
    Analysis, AnalysisForceDecode, AnalysisInterpretasiAI,
    AnalysisInsert, AnalysisUpdate, AnalysisResult,
} from '@/types/analysis'
import { getWaktuWIB } from '@/utils/format'
import { MethodForceDecode } from '@/types/forceDecode'

const PAGE_SIZE = 5

export interface AnalysisListItem extends Analysis {
    force_decode: AnalysisForceDecode | null
    ai_interpretasi: AnalysisInterpretasiAI | undefined
}

interface UseAnalysisState {
    items: AnalysisListItem[]
    total: number
    currentPage: number
    totalPages: number
    isLoading: boolean
    isLoadingMore: boolean
    hasMore: boolean
    error: string | null
}

export interface UseAnalysisReturn extends UseAnalysisState {
    goToPage: (page: number) => Promise<void>
    loadMore: () => Promise<void>
    refresh: () => Promise<void>
    getById: (id: string) => Promise<AnalysisResult | null>
    create: (payload: AnalysisInsert) => Promise<Analysis>
    update: (id: string, payload: AnalysisUpdate) => Promise<Analysis>
    softDelete: (id: string) => Promise<void>
    restore: (id: string) => Promise<void>
    hardDelete: (id: string) => Promise<void>
}

async function fetchLatestForceDecodes(analysisIds: string[]): Promise<Map<string, AnalysisForceDecode>> {
    if (analysisIds.length === 0) {
        return new Map()
    }

    const { data, error } = await supabaseAnonKey
        .from('analysis_forcedecode')
        .select('*')
        .in('analysis_id', analysisIds)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

    if (error) {
        throw new Error(error.message)
    }

    const map = new Map<string, AnalysisForceDecode>()
    for (const row of (data ?? []) as unknown as AnalysisForceDecode[]) {
        if (!map.has(row.analysis_id)) map.set(row.analysis_id, row)
    }

    return map
}

async function fetchLatestInterpretasi(forceDecodeIds: string[]): Promise<Map<string, AnalysisInterpretasiAI>> {
    if (forceDecodeIds.length === 0) {
        return new Map()
    }

    const { data, error } = await supabaseAnonKey
        .from('analysis_interpretasi_ai')
        .select('*')
        .in('analysis_forcedecode_id', forceDecodeIds)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

    if (error) {
        throw new Error(error.message)
    }

    const map = new Map<string, AnalysisInterpretasiAI>()
    for (const row of (data ?? []) as unknown as AnalysisInterpretasiAI[]) {
        if (!map.has(row.analysis_forcedecode_id)) map.set(row.analysis_forcedecode_id, row)
    }

    return map
}

async function enrichAnalysisRows(rows: Analysis[]): Promise<AnalysisListItem[]> {
    if (rows.length === 0) {
        return []
    }

    const analysisIds = rows.map(r => r.id)
    const fdMap = await fetchLatestForceDecodes(analysisIds)

    const forceDecodeIds = [...fdMap.values()].map(fd => fd.id)
    const aiMap = await fetchLatestInterpretasi(forceDecodeIds)

    return rows.map(analysis => {
        const forceDecode = fdMap.get(analysis.id) ?? null
        const aiInterpretasi = forceDecode ? aiMap.get(forceDecode.id) : undefined
        return { ...analysis, force_decode: forceDecode, ai_interpretasi: aiInterpretasi }
    })
}

export function useAnalysis(includeDeleted = false): UseAnalysisReturn {
    const [state, setState] = useState<UseAnalysisState>({
        items: [], total: 0, currentPage: 1, totalPages: 1,
        isLoading: true, isLoadingMore: false, hasMore: false, error: null,
    })
    const pageRef = useRef(0)

    const baseQuery = useCallback(() => {
        let q = supabaseAnonKey.from('analysis').select('*')

        if (!includeDeleted) {
            q = q.is('deleted_at', null)
        } else {
            q = q.not('deleted_at', 'is', null)
        }

        return q
    }, [includeDeleted])

    // Fetch halaman tertentu
    const fetchPage = useCallback(async (page: number, silent = false) => {
        if (!silent) setState(s => ({ ...s, isLoading: true, error: null }))
        try {
            let countQ = supabaseAnonKey.from('analysis').select('*', { count: 'exact', head: true })

            if (!includeDeleted) {
                countQ = countQ.is('deleted_at', null)
            } else {
                countQ = countQ.not('deleted_at', 'is', null)
            }

            const { count, error: countError } = await countQ
            if (countError) {
                throw countError
            }

            const total = count ?? 0
            const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
            const safePage = Math.min(page, totalPages)
            const from = (safePage - 1) * PAGE_SIZE

            const { data: analysisRows, error: analysisError } = await baseQuery()
                .order('created_at', { ascending: false })
                .range(from, from + PAGE_SIZE - 1)
            if (analysisError) {
                throw analysisError
            }

            const items = await enrichAnalysisRows((analysisRows ?? []) as Analysis[])
            pageRef.current = safePage

            setState(s => ({
                ...s,
                items,
                total,
                totalPages,
                currentPage: safePage,
                hasMore: safePage < totalPages,
                isLoading: false,
                isLoadingMore: false,
            }))
        } catch (err: any) {
            setState(s => ({ ...s, error: err.message, isLoading: false, isLoadingMore: false }))
        }
    }, [baseQuery, includeDeleted])

    const fetchInitial = useCallback(() => fetchPage(1), [fetchPage])

    // dipakai komponen pagination
    const goToPage = useCallback(async (page: number) => {
        if (page === pageRef.current) return
        setState(s => ({ ...s, isLoading: true }))
        await fetchPage(page)
    }, [fetchPage])

    // tetap ada untuk load more
    const loadMore = useCallback(async () => {
        if (state.isLoadingMore || !state.hasMore) return
        await goToPage(pageRef.current + 1)
    }, [goToPage, state.isLoadingMore, state.hasMore])

    const getById = useCallback(async (id: string): Promise<AnalysisResult | null> => {
        const { data: analysis, error: analysisError } = await supabaseAnonKey
            .from('analysis').select('*').eq('id', id).single()
        if (analysisError) throw new Error(analysisError.message)
        if (!analysis) return null

        const { data: forceDecode, error: forceError } = await supabaseAnonKey
            .from('analysis_forcedecode')
            .select('*')
            .eq('analysis_id', id)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()
        if (forceError) throw new Error(forceError.message)

        // Fetch method_forcedecode jika ada forceDecode
        let methodForceDecodes: MethodForceDecode[] = []
        if (forceDecode) {
            const { data: methods, error: methodError } = await supabaseAnonKey
                .from('method_forcedecode')
                .select('*')
                .eq('analysis_forcedecode_id', forceDecode.id)
                .is('deleted_at', null)
                .order('created_at', { ascending: true })
            if (methodError) throw new Error(methodError.message)
            methodForceDecodes = (methods ?? []) as MethodForceDecode[]
        }

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
            methodForceDecodes,
            aiInterpretasi,
        }
    }, [])

    const create = useCallback(async (payload: AnalysisInsert): Promise<Analysis> => {
        const { data, error } = await supabaseAnonKey.from('analysis')
            .insert({ ...payload }).select().single()
        if (error) throw new Error(error.message)
        return data as Analysis
    }, [])

    const update = useCallback(async (id: string, payload: AnalysisUpdate): Promise<Analysis> => {
        const { data, error } = await supabaseAnonKey.from('analysis')
            .update({ ...payload, updated_at: getWaktuWIB().toISOString() }).eq('id', id).select().single()
        if (error) throw new Error(error.message)
        const updated = data as Analysis
        setState(s => ({ ...s, items: s.items.map(i => i.id === id ? { ...updated, force_decode: i.force_decode, ai_interpretasi: i.ai_interpretasi } : i) }))
        return updated
    }, [])

    const softDelete = useCallback(async (id: string): Promise<void> => {
        const now = getWaktuWIB().toISOString()
        const { error } = await supabaseAnonKey.from('analysis').update({ deleted_at: now, updated_at: now }).eq('id', id)
        if (error) throw new Error(error.message)
        setState(s => ({
            ...s,
            items: includeDeleted ? s.items.map(i => i.id === id ? { ...i, deleted_at: now } : i) : s.items.filter(i => i.id !== id),
            total: includeDeleted ? s.total : Math.max(0, s.total - 1),
        }))
    }, [includeDeleted])

    const restore = useCallback(async (id: string): Promise<void> => {
        const { error } = await supabaseAnonKey.from('analysis')
            .update({ deleted_at: null, updated_at: getWaktuWIB().toISOString() }).eq('id', id)
        if (error) throw new Error(error.message)
        setState(s => ({ ...s, items: s.items.filter(i => i.id !== id), total: Math.max(0, s.total - 1) }))
    }, [])

    const hardDelete = useCallback(async (id: string): Promise<void> => {
        const { error } = await supabaseAnonKey.from('analysis').delete().eq('id', id)
        if (error) throw new Error(error.message)
        setState(s => ({ ...s, items: s.items.filter(i => i.id !== id), total: Math.max(0, s.total - 1) }))
    }, [])

    // Realtime
    useEffect(() => {
        const channel = supabaseAnonKey.channel(`realtime-analysis-all-${includeDeleted}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'analysis' }, (payload) => {
                const newRow = payload.new as Analysis
                if (!includeDeleted && newRow.deleted_at) return
                // Re-fetch halaman 1 supaya urutan tetap benar
                fetchPage(1, true)
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'analysis' }, (payload) => {
                const updated = payload.new as Analysis
                setState(s => ({
                    ...s,
                    items: includeDeleted
                        ? s.items.map(i => i.id === updated.id ? { ...updated, force_decode: i.force_decode, ai_interpretasi: i.ai_interpretasi } : i)
                        : updated.deleted_at
                            ? s.items.filter(i => i.id !== updated.id)
                            : s.items.map(i => i.id === updated.id ? { ...updated, force_decode: i.force_decode, ai_interpretasi: i.ai_interpretasi } : i),
                }))
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'analysis' }, (payload) => {
                setState(s => ({ ...s, items: s.items.filter(i => i.id !== payload.old.id), total: Math.max(0, s.total - 1) }))
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'analysis_forcedecode' }, (payload) => {
                const fd = payload.new as AnalysisForceDecode
                setState(s => ({ ...s, items: s.items.map(i => i.id === fd.analysis_id ? { ...i, force_decode: fd } : i) }))
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'analysis_forcedecode' }, (payload) => {
                const fd = payload.new as AnalysisForceDecode
                setState(s => ({ ...s, items: s.items.map(i => i.force_decode?.id === fd.id ? { ...i, force_decode: fd } : i) }))
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'analysis_interpretasi_ai' }, (payload) => {
                const ai = payload.new as AnalysisInterpretasiAI
                setState(s => ({ ...s, items: s.items.map(i => i.force_decode?.id === ai.analysis_forcedecode_id ? { ...i, ai_interpretasi: ai } : i) }))
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'analysis_interpretasi_ai' }, (payload) => {
                const ai = payload.new as AnalysisInterpretasiAI
                setState(s => ({ ...s, items: s.items.map(i => i.ai_interpretasi?.id === ai.id ? { ...i, ai_interpretasi: ai } : i) }))
            })
            .subscribe()
        return () => { supabaseAnonKey.removeChannel(channel) }
    }, [includeDeleted, fetchPage])

    useEffect(() => { fetchInitial() }, [fetchInitial])

    return { ...state, goToPage, loadMore, refresh: fetchInitial, getById, create, update, softDelete, restore, hardDelete }
}
// hooks/useGeminiTokens.ts
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import supabaseAnonKey from '@/libs/supabase/anon_key'
import type {
    GeminiToken,
    CreateGeminiTokenPayload,
    UpdateGeminiTokenPayload,
} from '@/types/GeminiToken'

const TABLE = 'gemini_tokens'
const PAGE_SIZE = 10

interface UseGeminiTokensState {
    items: GeminiToken[]
    total: number
    currentPage: number
    totalPages: number
    isLoading: boolean
    error: string | null
}

export interface UseGeminiTokensReturn extends UseGeminiTokensState {
    goToPage: (page: number) => Promise<void>
    refresh: () => Promise<void>
    createToken: (payload: CreateGeminiTokenPayload) => Promise<GeminiToken | null>
    updateToken: (id: string, payload: UpdateGeminiTokenPayload) => Promise<boolean>
    softDelete: (id: string) => Promise<boolean>
    restore: (id: string) => Promise<boolean>
    hardDelete: (id: string) => Promise<boolean>
    setDefault: (id: string) => Promise<boolean>
    toggleActive: (id: string, current: boolean) => Promise<boolean>
}

interface Options {
    includeDeleted?: boolean
}

export function useGeminiTokens(options: Options = {}): UseGeminiTokensReturn {
    const { includeDeleted = false } = options

    const [state, setState] = useState<UseGeminiTokensState>({
        items: [], total: 0, currentPage: 1, totalPages: 1,
        isLoading: true, error: null,
    })
    const pageRef = useRef(1)

    // ── Fetch page ─────────────────────────────────────────────
    const fetchPage = useCallback(async (page: number, silent = false) => {
        if (!silent) setState(s => ({ ...s, isLoading: true, error: null }))
        try {
            let countQ = supabaseAnonKey
                .from(TABLE)
                .select('*', { count: 'exact', head: true })
            if (!includeDeleted) countQ = countQ.is('deleted_at', null)
            else countQ = countQ.not('deleted_at', 'is', null)

            const { count, error: cErr } = await countQ
            if (cErr) throw cErr

            const total = count ?? 0
            const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
            const safePage = Math.min(Math.max(1, page), totalPages)
            const from = (safePage - 1) * PAGE_SIZE

            let dataQ = supabaseAnonKey
                .from(TABLE)
                .select('*')
                .order('created_at', { ascending: false })
                .range(from, from + PAGE_SIZE - 1)
            if (!includeDeleted) dataQ = dataQ.is('deleted_at', null)
            else dataQ = dataQ.not('deleted_at', 'is', null)

            const { data, error } = await dataQ
            if (error) throw error

            pageRef.current = safePage
            setState(s => ({
                ...s,
                items: (data ?? []) as GeminiToken[],
                total,
                totalPages,
                currentPage: safePage,
                isLoading: false,
                error: null,
            }))
        } catch (err: any) {
            setState(s => ({ ...s, error: err.message, isLoading: false }))
        }
    }, [includeDeleted])

    const fetchInitial = useCallback(() => fetchPage(1), [fetchPage])

    const goToPage = useCallback(async (page: number) => {
        if (page === pageRef.current) return
        setState(s => ({ ...s, isLoading: true }))
        await fetchPage(page)
    }, [fetchPage])

    useEffect(() => { fetchInitial() }, [fetchInitial])

    // ── Create ─────────────────────────────────────────────────
    const createToken = useCallback(async (
        payload: CreateGeminiTokenPayload
    ): Promise<GeminiToken | null> => {
        if (payload.is_default) {
            await supabaseAnonKey.from(TABLE).update({ is_default: false }).eq('is_default', true)
        }
        const { data, error: err } = await supabaseAnonKey
            .from(TABLE)
            .insert([{
                ...payload,
                is_active: payload.is_active ?? true,
                is_default: payload.is_default ?? false,
            }])
            .select().single()
        if (err) { setState(s => ({ ...s, error: err.message })); return null }
        await fetchInitial()
        return data as GeminiToken
    }, [fetchInitial])

    // ── Update ─────────────────────────────────────────────────
    const updateToken = useCallback(async (
        id: string,
        payload: UpdateGeminiTokenPayload
    ): Promise<boolean> => {
        if (payload.is_default) {
            await supabaseAnonKey
                .from(TABLE).update({ is_default: false }).eq('is_default', true).neq('id', id)
        }
        const { data, error: err } = await supabaseAnonKey
            .from(TABLE).update(payload).eq('id', id).select().single()
        if (err) { setState(s => ({ ...s, error: err.message })); return false }
        setState(s => ({
            ...s,
            items: s.items.map(t => t.id === id ? (data as GeminiToken) : t),
        }))
        return true
    }, [])

    // ── Soft Delete ────────────────────────────────────────────
    const softDelete = useCallback(async (id: string): Promise<boolean> => {
        const { error: err } = await supabaseAnonKey
            .from(TABLE)
            .update({ deleted_at: new Date().toISOString(), is_active: false, is_default: false })
            .eq('id', id)
        if (err) { setState(s => ({ ...s, error: err.message })); return false }
        await fetchPage(pageRef.current, true)
        return true
    }, [fetchPage])

    // ── Restore ────────────────────────────────────────────────
    const restore = useCallback(async (id: string): Promise<boolean> => {
        const { error: err } = await supabaseAnonKey
            .from(TABLE).update({ deleted_at: null }).eq('id', id)
        if (err) { setState(s => ({ ...s, error: err.message })); return false }
        await fetchPage(pageRef.current, true)
        return true
    }, [fetchPage])

    // ── Hard Delete ────────────────────────────────────────────
    const hardDelete = useCallback(async (id: string): Promise<boolean> => {
        const { error: err } = await supabaseAnonKey.from(TABLE).delete().eq('id', id)
        if (err) { setState(s => ({ ...s, error: err.message })); return false }
        await fetchPage(pageRef.current, true)
        return true
    }, [fetchPage])

    // ── Set Default ────────────────────────────────────────────
    const setDefault = useCallback(async (id: string): Promise<boolean> => {
        await supabaseAnonKey.from(TABLE).update({ is_default: false }).eq('is_default', true)
        const { data, error: err } = await supabaseAnonKey
            .from(TABLE).update({ is_default: true, is_active: true }).eq('id', id).select().single()
        if (err) { setState(s => ({ ...s, error: err.message })); return false }
        setState(s => ({
            ...s,
            items: s.items.map(t =>
                t.id === id ? (data as GeminiToken) : { ...t, is_default: false }
            ),
        }))
        return true
    }, [])

    // ── Toggle Active ──────────────────────────────────────────
    const toggleActive = useCallback(async (id: string, current: boolean): Promise<boolean> => {
        const { data, error: err } = await supabaseAnonKey
            .from(TABLE).update({ is_active: !current }).eq('id', id).select().single()
        if (err) { setState(s => ({ ...s, error: err.message })); return false }
        setState(s => ({
            ...s,
            items: s.items.map(t => t.id === id ? (data as GeminiToken) : t),
        }))
        return true
    }, [])

    return {
        ...state,
        goToPage,
        refresh: fetchInitial,
        createToken,
        updateToken,
        softDelete,
        restore,
        hardDelete,
        setDefault,
        toggleActive,
    }
}
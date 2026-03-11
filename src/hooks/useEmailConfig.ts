// hooks/useEmailConfig.ts
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { EmailConfig, CreateEmailConfigPayload, UpdateEmailConfigPayload } from '@/types/EmailConfig'
import supabaseAnonKey from '@/libs/supabase/anon_key'

const TABLE = 'email_config'
const PAGE_SIZE = 10

interface UseEmailConfigState {
    items: EmailConfig[]
    total: number
    currentPage: number
    totalPages: number
    isLoading: boolean
    error: string | null
}

export interface UseEmailConfigReturn extends UseEmailConfigState {
    goToPage: (page: number) => Promise<void>
    refresh: () => Promise<void>
    createConfig: (payload: CreateEmailConfigPayload) => Promise<EmailConfig | null>
    updateConfig: (id: string, payload: UpdateEmailConfigPayload) => Promise<boolean>
    softDelete: (id: string) => Promise<boolean>
    restore: (id: string) => Promise<boolean>
    hardDelete: (id: string) => Promise<boolean>
    toggleActive: (id: string, current: boolean) => Promise<boolean>
}

interface Options {
    includeDeleted?: boolean
}

export function useEmailConfig(options: Options = {}): UseEmailConfigReturn {
    const { includeDeleted = false } = options

    const [state, setState] = useState<UseEmailConfigState>({
        items: [], total: 0, currentPage: 1, totalPages: 1,
        isLoading: true, error: null,
    })
    const pageRef = useRef(1)

    // ── Fetch page ─────────────────────────────────────────────
    const fetchPage = useCallback(async (page: number, silent = false) => {
        if (!silent) setState(s => ({ ...s, isLoading: true, error: null }))
        try {
            // Count
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

            // Data
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
                items: (data ?? []) as EmailConfig[],
                total,
                totalPages,
                currentPage: safePage,
                isLoading: false,
                error: null,
            }))
        } catch (err: any) {
            const msg = err instanceof Error ? err.message : String(err)
            setState(s => ({ ...s, error: msg, isLoading: false }))
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
    const createConfig = useCallback(async (
        payload: CreateEmailConfigPayload
    ): Promise<EmailConfig | null> => {
        try {
            if (payload.is_active) {
                await supabaseAnonKey
                    .from(TABLE).update({ is_active: false }).eq('is_active', true)
            }
            const { data, error: err } = await supabaseAnonKey
                .from(TABLE).insert([payload]).select().single()
            if (err) throw err
            await fetchInitial()
            return data as EmailConfig
        } catch (err: any) {
            setState(s => ({ ...s, error: err.message }))
            return null
        }
    }, [fetchInitial])

    // ── Update ─────────────────────────────────────────────────
    const updateConfig = useCallback(async (
        id: string,
        payload: UpdateEmailConfigPayload
    ): Promise<boolean> => {
        try {
            if (payload.is_active === true) {
                await supabaseAnonKey
                    .from(TABLE).update({ is_active: false }).neq('id', id)
            }
            const { data, error: err } = await supabaseAnonKey
                .from(TABLE)
                .update({ ...payload, updated_at: new Date().toISOString() })
                .eq('id', id).select().single()
            if (err) throw err
            setState(s => ({
                ...s,
                items: s.items.map(c => c.id === id ? (data as EmailConfig) : c),
            }))
            return true
        } catch (err: any) {
            setState(s => ({ ...s, error: err.message }))
            return false
        }
    }, [])

    // ── Soft Delete ────────────────────────────────────────────
    const softDelete = useCallback(async (id: string): Promise<boolean> => {
        try {
            const { error: err } = await supabaseAnonKey
                .from(TABLE)
                .update({
                    deleted_at: new Date().toISOString(),
                    is_active: false,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id)
            if (err) throw err
            await fetchPage(pageRef.current, true)
            return true
        } catch (err: any) {
            setState(s => ({ ...s, error: err.message }))
            return false
        }
    }, [fetchPage])

    // ── Restore ────────────────────────────────────────────────
    const restore = useCallback(async (id: string): Promise<boolean> => {
        try {
            const { error: err } = await supabaseAnonKey
                .from(TABLE)
                .update({ deleted_at: null, updated_at: new Date().toISOString() })
                .eq('id', id)
            if (err) throw err
            await fetchPage(pageRef.current, true)
            return true
        } catch (err: any) {
            setState(s => ({ ...s, error: err.message }))
            return false
        }
    }, [fetchPage])

    // ── Hard Delete ────────────────────────────────────────────
    const hardDelete = useCallback(async (id: string): Promise<boolean> => {
        try {
            const { error: err } = await supabaseAnonKey
                .from(TABLE).delete().eq('id', id)
            if (err) throw err
            await fetchPage(pageRef.current, true)
            return true
        } catch (err: any) {
            setState(s => ({ ...s, error: err.message }))
            return false
        }
    }, [fetchPage])

    // ── Toggle Active ──────────────────────────────────────────
    const toggleActive = useCallback(async (id: string, current: boolean): Promise<boolean> => {
        try {
            if (!current) {
                // Aktifkan → nonaktifkan yang lain dulu
                await supabaseAnonKey
                    .from(TABLE)
                    .update({ is_active: false, updated_at: new Date().toISOString() })
                    .neq('id', id)
            }
            const { data, error: err } = await supabaseAnonKey
                .from(TABLE)
                .update({ is_active: !current, updated_at: new Date().toISOString() })
                .eq('id', id).select().single()
            if (err) throw err
            // Kalau ada perubahan is_active di row lain, refetch supaya konsisten
            await fetchPage(pageRef.current, true)
            return true
        } catch (err: any) {
            setState(s => ({ ...s, error: err.message }))
            return false
        }
    }, [fetchPage])

    return {
        ...state,
        goToPage,
        refresh: fetchInitial,
        createConfig,
        updateConfig,
        softDelete,
        restore,
        hardDelete,
        toggleActive,
    }
}
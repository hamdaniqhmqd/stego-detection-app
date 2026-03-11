// hooks/useUsers.ts
import { useState, useEffect, useCallback, useRef } from 'react'
import supabaseAnonKey from '@/libs/supabase/anon_key'
import type { User, UserInsert, UserUpdate } from '@/types/Users'

const TABLE = 'users'
const PAGE_SIZE = 5

interface UseUsersState {
    items: User[]
    total: number
    currentPage: number
    totalPages: number
    isLoading: boolean
    isLoadingMore: boolean
    hasMore: boolean
    error: string | null
}

export interface UseUsersReturn extends UseUsersState {
    goToPage: (page: number) => Promise<void>
    loadMore: () => Promise<void>
    refresh: () => Promise<void>
    getById: (id: string) => Promise<User | null>
    create: (payload: UserInsert) => Promise<User>
    update: (id: string, payload: UserUpdate) => Promise<User>
    softDelete: (id: string) => Promise<void>
    restore: (id: string) => Promise<void>
    hardDelete: (id: string) => Promise<void>
}

export function useUsers(includeDeleted = false): UseUsersReturn {
    const [state, setState] = useState<UseUsersState>({
        items: [], total: 0, currentPage: 1, totalPages: 1,
        isLoading: true, isLoadingMore: false, hasMore: false, error: null,
    })
    const pageRef = useRef(1)

    const baseQuery = useCallback(() => {
        let q = supabaseAnonKey.from(TABLE).select('*')
        if (!includeDeleted) q = q.is('deleted_at', null)
        else q = q.not('deleted_at', 'is', null)
        return q
    }, [includeDeleted])

    // ── Fetch halaman tertentu ────────────────────────────────
    const fetchPage = useCallback(async (page: number, silent = false) => {
        if (!silent) setState(s => ({ ...s, isLoading: true, error: null }))
        try {
            let countQ = supabaseAnonKey.from(TABLE).select('*', { count: 'exact', head: true })
            if (!includeDeleted) countQ = countQ.is('deleted_at', null)
            else countQ = countQ.not('deleted_at', 'is', null)
            const { count, error: cErr } = await countQ
            if (cErr) throw cErr

            const total = count ?? 0
            const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
            const safePage = Math.min(Math.max(1, page), totalPages)
            const from = (safePage - 1) * PAGE_SIZE

            const { data, error } = await baseQuery()
                .order('created_at', { ascending: false })
                .range(from, from + PAGE_SIZE - 1)
            if (error) throw error

            const items = (data ?? []) as User[]
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

    const goToPage = useCallback(async (page: number) => {
        if (page === pageRef.current) return
        setState(s => ({ ...s, isLoading: true }))
        await fetchPage(page)
    }, [fetchPage])

    const loadMore = useCallback(async () => {
        if (state.isLoadingMore || !state.hasMore) return
        await goToPage(pageRef.current + 1)
    }, [goToPage, state.isLoadingMore, state.hasMore])

    const getById = useCallback(async (id: string): Promise<User | null> => {
        const { data, error } = await supabaseAnonKey.from(TABLE).select('*').eq('id', id).single()
        if (error) throw new Error(error.message)
        return data as User | null
    }, [])

    const create = useCallback(async (payload: UserInsert): Promise<User> => {
        const { data, error } = await supabaseAnonKey.from(TABLE)
            .insert({ ...payload, created_at: new Date().toISOString() }).select().single()
        if (error) throw new Error(error.message)
        return data as User
    }, [])

    const update = useCallback(async (id: string, payload: UserUpdate): Promise<User> => {
        const { data, error } = await supabaseAnonKey.from(TABLE)
            .update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id).select().single()
        if (error) throw new Error(error.message)
        const updated = data as User
        setState(s => ({ ...s, items: s.items.map(i => i.id === id ? updated : i) }))
        return updated
    }, [])

    const softDelete = useCallback(async (id: string): Promise<void> => {
        const now = new Date().toISOString()
        const { error } = await supabaseAnonKey.from(TABLE)
            .update({ deleted_at: now, updated_at: now }).eq('id', id)
        if (error) throw new Error(error.message)
        setState(s => ({
            ...s,
            items: s.items.filter(i => i.id !== id),
            total: Math.max(0, s.total - 1),
        }))
    }, [])

    const restore = useCallback(async (id: string): Promise<void> => {
        const { error } = await supabaseAnonKey.from(TABLE)
            .update({ deleted_at: null, updated_at: new Date().toISOString() }).eq('id', id)
        if (error) throw new Error(error.message)
        setState(s => ({
            ...s,
            items: s.items.filter(i => i.id !== id),
            total: Math.max(0, s.total - 1),
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

    // Realtime
    useEffect(() => {
        const channelName = includeDeleted ? `rt-${TABLE}-deleted` : `rt-${TABLE}-active`
        const ch = supabaseAnonKey.channel(channelName)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: TABLE }, () => {
                // Re-fetch halaman 1 supaya data baru langsung muncul
                if (!includeDeleted) fetchPage(1, true)
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: TABLE }, (p) => {
                const row = p.new as User
                setState(s => ({
                    ...s,
                    items: includeDeleted
                        ? (row.deleted_at ? s.items.map(i => i.id === row.id ? row : i) : s.items.filter(i => i.id !== row.id))
                        : (row.deleted_at ? s.items.filter(i => i.id !== row.id) : s.items.map(i => i.id === row.id ? row : i)),
                }))
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: TABLE }, (p) => {
                setState(s => ({
                    ...s,
                    items: s.items.filter(i => i.id !== p.old.id),
                    total: Math.max(0, s.total - 1),
                }))
            })
            .subscribe()
        return () => { supabaseAnonKey.removeChannel(ch) }
    }, [includeDeleted, fetchPage])

    useEffect(() => { fetchInitial() }, [fetchInitial])

    return { ...state, goToPage, loadMore, refresh: fetchInitial, getById, create, update, softDelete, restore, hardDelete }
}
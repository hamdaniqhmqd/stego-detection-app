// hooks/useUsers.ts
// Hook spesifik tabel `users`
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from 'react'
import supabaseAnonKey from '@/libs/supabase/anon_key'
import type { User, UserInsert, UserUpdate } from '@/types/Users'

const TABLE = 'users'
const PAGE_SIZE = 10

interface UseUsersState {
    items: User[]
    total: number
    isLoading: boolean
    isLoadingMore: boolean
    hasMore: boolean
    error: string | null
}

export interface UseUsersReturn extends UseUsersState {
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
        items: [], total: 0, isLoading: true,
        isLoadingMore: false, hasMore: false, error: null,
    })
    const pageRef = useRef(0)

    const baseQuery = useCallback(() => {
        let q = supabaseAnonKey.from(TABLE).select('*')
        if (!includeDeleted) q = q.is('deleted_at', null)
        return q
    }, [includeDeleted])

    const fetchInitial = useCallback(async () => {
        setState(s => ({ ...s, isLoading: true, error: null }))
        pageRef.current = 0
        try {
            let countQ = supabaseAnonKey.from(TABLE).select('*', { count: 'exact', head: true })
            if (!includeDeleted) countQ = countQ.is('deleted_at', null)
            const { count, error: cErr } = await countQ
            if (cErr) throw cErr

            const { data, error } = await baseQuery().order('created_at', { ascending: false }).range(0, PAGE_SIZE - 1)
            if (error) throw error

            const items = (data ?? []) as User[]
            pageRef.current = 1
            setState(s => ({ ...s, items, total: count ?? 0, hasMore: items.length < (count ?? 0), isLoading: false }))
        } catch (err: any) {
            setState(s => ({ ...s, error: err.message, isLoading: false }))
        }
    }, [baseQuery, includeDeleted])

    const loadMore = useCallback(async () => {
        if (state.isLoadingMore || !state.hasMore) return
        setState(s => ({ ...s, isLoadingMore: true }))
        try {
            const from = pageRef.current * PAGE_SIZE
            const { data, error } = await baseQuery().order('created_at', { ascending: false }).range(from, from + PAGE_SIZE - 1)
            if (error) throw error
            const newItems = (data ?? []) as User[]
            pageRef.current += 1
            setState(s => ({ ...s, items: [...s.items, ...newItems], hasMore: s.items.length + newItems.length < s.total, isLoadingMore: false }))
        } catch (err: any) {
            setState(s => ({ ...s, error: err.message, isLoadingMore: false }))
        }
    }, [baseQuery, state.isLoadingMore, state.hasMore])

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
        const { error } = await supabaseAnonKey.from(TABLE).update({ deleted_at: now, updated_at: now }).eq('id', id)
        if (error) throw new Error(error.message)
        setState(s => ({
            ...s,
            items: includeDeleted ? s.items.map(i => i.id === id ? { ...i, deleted_at: now } : i) : s.items.filter(i => i.id !== id),
            total: includeDeleted ? s.total : Math.max(0, s.total - 1),
        }))
    }, [includeDeleted])

    const restore = useCallback(async (id: string): Promise<void> => {
        const { error } = await supabaseAnonKey.from(TABLE)
            .update({ deleted_at: null, updated_at: new Date().toISOString() }).eq('id', id)
        if (error) throw new Error(error.message)
        setState(s => ({ ...s, items: s.items.map(i => i.id === id ? { ...i, deleted_at: undefined } : i) }))
    }, [])

    const hardDelete = useCallback(async (id: string): Promise<void> => {
        const { error } = await supabaseAnonKey.from(TABLE).delete().eq('id', id)
        if (error) throw new Error(error.message)
    }, [])

    useEffect(() => {
        const ch = supabaseAnonKey.channel(`rt-${TABLE}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: TABLE }, (p) => {
                const row = p.new as User
                if (!includeDeleted && row.deleted_at) return
                setState(s => ({ ...s, items: [row, ...s.items], total: s.total + 1 }))
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: TABLE }, (p) => {
                const row = p.new as User
                setState(s => ({
                    ...s,
                    items: includeDeleted
                        ? s.items.map(i => i.id === row.id ? row : i)
                        : row.deleted_at ? s.items.filter(i => i.id !== row.id) : s.items.map(i => i.id === row.id ? row : i),
                }))
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: TABLE }, (p) => {
                setState(s => ({ ...s, items: s.items.filter(i => i.id !== p.old.id), total: Math.max(0, s.total - 1) }))
            })
            .subscribe()
        return () => { supabaseAnonKey.removeChannel(ch) }
    }, [includeDeleted])

    useEffect(() => { fetchInitial() }, [fetchInitial])

    return { ...state, loadMore, refresh: fetchInitial, getById, create, update, softDelete, restore, hardDelete }
}
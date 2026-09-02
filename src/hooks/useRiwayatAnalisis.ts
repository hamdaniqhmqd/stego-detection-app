// hooks/useRiwayatAnalisis.ts

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Analysis } from '@/types/analysis'
import supabaseAnonKey from '@/libs/supabase/anon_key'

const PAGE_SIZE = 10

export interface RiwayatItem {
    id: string
    created_at: string
    teknik_count: number   // jumlah kombinasi dari field teknik (jsonb array)
    metode?: string
}

type RiwayatRow = Pick<Analysis, 'id' | 'created_at' | 'teknik' | 'metode'>

export function toRiwayatItem(row: RiwayatRow): RiwayatItem {
    return {
        id: row.id,
        created_at: row.created_at,
        teknik_count: Array.isArray(row.teknik) ? row.teknik.length : 0,
        metode: row.metode,
    }
}

interface UseRiwayatAnalisisReturn {
    items: RiwayatItem[]
    total: number
    isLoading: boolean
    isLoadingMore: boolean
    hasMore: boolean
    loadMore: () => void
    error: string | null
}

export function useRiwayatAnalisis(userId: string | undefined): UseRiwayatAnalisisReturn {
    const [items, setItems] = useState<RiwayatItem[]>([])
    const [total, setTotal] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const pageRef = useRef(0)
    const totalRef = useRef(0)

    const fetchInitial = useCallback(async () => {
        if (!userId) return
        setIsLoading(true)
        setError(null)
        pageRef.current = 0

        try {
            const { count } = await supabaseAnonKey
                .from('analysis')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .is('deleted_at', null)

            totalRef.current = count ?? 0
            setTotal(totalRef.current)

            const { data, error: fetchError } = await supabaseAnonKey
                .from('analysis')
                .select('id, created_at, teknik, metode')
                .eq('user_id', userId)
                .is('deleted_at', null)
                .order('created_at', { ascending: false })
                .range(0, PAGE_SIZE - 1)

            if (fetchError) throw fetchError

            const mapped = (data ?? []).map(toRiwayatItem)
            setItems(mapped)
            setHasMore(mapped.length < totalRef.current)
            pageRef.current = 1
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }, [userId])

    const loadMore = useCallback(async () => {
        if (!userId || isLoadingMore || !hasMore) return
        setIsLoadingMore(true)

        try {
            const from = pageRef.current * PAGE_SIZE
            const to = from + PAGE_SIZE - 1

            const { data, error: fetchError } = await supabaseAnonKey
                .from('analysis')
                .select('id, created_at, teknik, metode')
                .eq('user_id', userId)
                .is('deleted_at', null)
                .order('created_at', { ascending: false })
                .range(from, to)

            if (fetchError) throw fetchError

            const mapped = (data ?? []).map(toRiwayatItem)
            setItems((prev) => [...prev, ...mapped])
            pageRef.current += 1
            setHasMore(from + mapped.length < totalRef.current)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoadingMore(false)
        }
    }, [userId, isLoadingMore, hasMore])

    useEffect(() => {
        fetchInitial()
    }, [fetchInitial])

    useEffect(() => {
        if (!userId) return

        const channel = supabaseAnonKey
            .channel(`riwayat-analisis-${userId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'analysis', filter: `user_id=eq.${userId}` },
                (payload) => {
                    const newItem = toRiwayatItem(payload.new as Analysis)
                    setItems((prev) => [newItem, ...prev])
                    totalRef.current += 1
                    setTotal(totalRef.current)
                }
            )
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'analysis', filter: `user_id=eq.${userId}` },
                (payload) => {
                    setItems((prev) => prev.filter((i) => i.id !== payload.old.id))
                    totalRef.current = Math.max(0, totalRef.current - 1)
                    setTotal(totalRef.current)
                }
            )
            .subscribe()

        return () => {
            supabaseAnonKey.removeChannel(channel)
        }
    }, [userId])

    return { items, total, isLoading, isLoadingMore, hasMore, loadMore, error }
}
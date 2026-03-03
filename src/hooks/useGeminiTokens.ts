// hooks/useGeminiTokens.ts
'use client'

import { useState, useEffect, useCallback } from 'react'
import supabaseAnonKey from '@/libs/supabase/anon_key'
import type {
    GeminiToken,
    CreateGeminiTokenPayload,
    UpdateGeminiTokenPayload,
} from '@/types/GeminiToken'

const TABLE = 'gemini_tokens'

interface UseGeminiTokensReturn {
    tokens: GeminiToken[]
    isLoading: boolean
    error: string | null
    // CRUD
    createToken: (payload: CreateGeminiTokenPayload) => Promise<GeminiToken | null>
    updateToken: (id: string, payload: UpdateGeminiTokenPayload) => Promise<boolean>
    softDelete: (id: string) => Promise<boolean>
    restore: (id: string) => Promise<boolean>
    hardDelete: (id: string) => Promise<boolean>
    setDefault: (id: string) => Promise<boolean>
    toggleActive: (id: string, current: boolean) => Promise<boolean>
    refresh: () => Promise<void>
}

export function useGeminiTokens(): UseGeminiTokensReturn {
    const [tokens, setTokens] = useState<GeminiToken[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // ── Fetch all (termasuk soft deleted) ─────────────────────
    const fetchAll = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        const { data, error: err } = await supabaseAnonKey
            .from(TABLE)
            .select('*')
            .order('created_at', { ascending: false })

        if (err) {
            setError(err.message)
        } else {
            setTokens((data as GeminiToken[]) ?? [])
        }
        setIsLoading(false)
    }, [])

    useEffect(() => { fetchAll() }, [fetchAll])

    // ── Create ─────────────────────────────────────────────────
    const createToken = useCallback(async (
        payload: CreateGeminiTokenPayload
    ): Promise<GeminiToken | null> => {
        // Jika is_default=true, unset default yang lama dulu
        if (payload.is_default) {
            await supabaseAnonKey
                .from(TABLE)
                .update({ is_default: false })
                .eq('is_default', true)
        }

        const { data, error: err } = await supabaseAnonKey
            .from(TABLE)
            .insert([{
                ...payload,
                is_active: payload.is_active ?? true,
                is_default: payload.is_default ?? false,
            }])
            .select()
            .single()

        if (err) { setError(err.message); return null }

        const newToken = data as GeminiToken
        setTokens(prev => [newToken, ...prev])
        return newToken
    }, [])

    // ── Update ─────────────────────────────────────────────────
    const updateToken = useCallback(async (
        id: string,
        payload: UpdateGeminiTokenPayload
    ): Promise<boolean> => {
        // Jika is_default=true, unset default yang lama dulu
        if (payload.is_default) {
            await supabaseAnonKey
                .from(TABLE)
                .update({ is_default: false })
                .eq('is_default', true)
                .neq('id', id)
        }

        const { data, error: err } = await supabaseAnonKey
            .from(TABLE)
            .update(payload)
            .eq('id', id)
            .select()
            .single()

        if (err) { setError(err.message); return false }

        setTokens(prev => prev.map(t => t.id === id ? (data as GeminiToken) : t))
        return true
    }, [])

    // ── Soft Delete ────────────────────────────────────────────
    const softDelete = useCallback(async (id: string): Promise<boolean> => {
        const { data, error: err } = await supabaseAnonKey
            .from(TABLE)
            .update({ deleted_at: new Date().toISOString(), is_active: false, is_default: false })
            .eq('id', id)
            .select()
            .single()

        if (err) { setError(err.message); return false }

        setTokens(prev => prev.map(t => t.id === id ? (data as GeminiToken) : t))
        return true
    }, [])

    // ── Restore ────────────────────────────────────────────────
    const restore = useCallback(async (id: string): Promise<boolean> => {
        const { data, error: err } = await supabaseAnonKey
            .from(TABLE)
            .update({ deleted_at: null })
            .eq('id', id)
            .select()
            .single()

        if (err) { setError(err.message); return false }

        setTokens(prev => prev.map(t => t.id === id ? (data as GeminiToken) : t))
        return true
    }, [])

    // ── Hard Delete ────────────────────────────────────────────
    const hardDelete = useCallback(async (id: string): Promise<boolean> => {
        const { error: err } = await supabaseAnonKey
            .from(TABLE)
            .delete()
            .eq('id', id)

        if (err) { setError(err.message); return false }

        setTokens(prev => prev.filter(t => t.id !== id))
        return true
    }, [])

    // ── Set Default ────────────────────────────────────────────
    const setDefault = useCallback(async (id: string): Promise<boolean> => {
        // Unset semua default
        await supabaseAnonKey
            .from(TABLE)
            .update({ is_default: false })
            .eq('is_default', true)

        // Set yang dipilih
        const { data, error: err } = await supabaseAnonKey
            .from(TABLE)
            .update({ is_default: true, is_active: true })
            .eq('id', id)
            .select()
            .single()

        if (err) { setError(err.message); return false }

        setTokens(prev =>
            prev.map(t =>
                t.id === id
                    ? (data as GeminiToken)
                    : { ...t, is_default: false }
            )
        )
        return true
    }, [])

    // ── Toggle Active ──────────────────────────────────────────
    const toggleActive = useCallback(async (
        id: string,
        current: boolean
    ): Promise<boolean> => {
        const { data, error: err } = await supabaseAnonKey
            .from(TABLE)
            .update({ is_active: !current })
            .eq('id', id)
            .select()
            .single()

        if (err) { setError(err.message); return false }

        setTokens(prev => prev.map(t => t.id === id ? (data as GeminiToken) : t))
        return true
    }, [])

    return {
        tokens,
        isLoading,
        error,
        createToken,
        updateToken,
        softDelete,
        restore,
        hardDelete,
        setDefault,
        toggleActive,
        refresh: fetchAll,
    }
}
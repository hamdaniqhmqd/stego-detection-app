// hooks/useEmailConfig.ts
'use client'

import { useState, useEffect, useCallback } from 'react'
import type { EmailConfig, CreateEmailConfigPayload, UpdateEmailConfigPayload } from '@/types/EmailConfig'
import supabaseAnonKey from '@/libs/supabase/anon_key'

interface UseEmailConfigReturn {
    configs: EmailConfig[]
    isLoading: boolean
    error: string | null
    createConfig: (payload: CreateEmailConfigPayload) => Promise<EmailConfig | null>
    updateConfig: (id: string, payload: UpdateEmailConfigPayload) => Promise<boolean>
    deleteConfig: (id: string) => Promise<boolean>
    toggleActive: (id: string, current: boolean) => Promise<boolean>
    refetch: () => Promise<void>
}

export function useEmailConfig(): UseEmailConfigReturn {
    const [configs, setConfigs] = useState<EmailConfig[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchConfigs = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const { data, error: fetchError } = await supabaseAnonKey
                .from('email_config')
                .select('*')
                .order('created_at', { ascending: false })

            if (fetchError) throw fetchError
            setConfigs(data as EmailConfig[])
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Gagal memuat konfigurasi email'
            setError(msg)
            console.error('[useEmailConfig] fetchConfigs:', err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchConfigs()
    }, [fetchConfigs])

    // ── CREATE ─────────────────────────────────────────────────
    const createConfig = useCallback(async (
        payload: CreateEmailConfigPayload
    ): Promise<EmailConfig | null> => {
        setError(null)
        try {
            // Jika is_active true, nonaktifkan yang lain dulu
            if (payload.is_active) {
                await supabaseAnonKey
                    .from('email_config')
                    .update({ is_active: false })
                    .neq('id', 'placeholder') // update semua
            }

            const { data, error: insertError } = await supabaseAnonKey
                .from('email_config')
                .insert([payload])
                .select()
                .single()

            if (insertError) throw insertError

            await fetchConfigs()
            return data as EmailConfig
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Gagal menambah konfigurasi'
            setError(msg)
            console.error('[useEmailConfig] createConfig:', err)
            return null
        }
    }, [fetchConfigs])

    // ── UPDATE ─────────────────────────────────────────────────
    const updateConfig = useCallback(async (
        id: string,
        payload: UpdateEmailConfigPayload
    ): Promise<boolean> => {
        setError(null)
        try {
            // Jika mengaktifkan config ini, nonaktifkan yang lain
            if (payload.is_active === true) {
                await supabaseAnonKey
                    .from('email_config')
                    .update({ is_active: false })
                    .neq('id', id)
            }

            const { error: updateError } = await supabaseAnonKey
                .from('email_config')
                .update({ ...payload, updated_at: new Date().toISOString() })
                .eq('id', id)

            if (updateError) throw updateError

            await fetchConfigs()
            return true
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Gagal memperbarui konfigurasi'
            setError(msg)
            console.error('[useEmailConfig] updateConfig:', err)
            return false
        }
    }, [fetchConfigs])

    // ── DELETE ─────────────────────────────────────────────────
    const deleteConfig = useCallback(async (id: string): Promise<boolean> => {
        setError(null)
        try {
            const { error: deleteError } = await supabaseAnonKey
                .from('email_config')
                .delete()
                .eq('id', id)

            if (deleteError) throw deleteError

            setConfigs(prev => prev.filter(c => c.id !== id))
            return true
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Gagal menghapus konfigurasi'
            setError(msg)
            console.error('[useEmailConfig] deleteConfig:', err)
            return false
        }
    }, [])

    // ── TOGGLE ACTIVE ──────────────────────────────────────────
    const toggleActive = useCallback(async (
        id: string,
        current: boolean
    ): Promise<boolean> => {
        setError(null)
        try {
            // Hanya satu config yang bisa aktif, jika mengaktifkan -> nonaktifkan lainnya
            if (!current) {
                await supabaseAnonKey
                    .from('email_config')
                    .update({ is_active: false, updated_at: new Date().toISOString() })
                    .neq('id', id)
            }

            const { error: toggleError } = await supabaseAnonKey
                .from('email_config')
                .update({ is_active: !current, updated_at: new Date().toISOString() })
                .eq('id', id)

            if (toggleError) throw toggleError

            await fetchConfigs()
            return true
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Gagal mengubah status'
            setError(msg)
            console.error('[useEmailConfig] toggleActive:', err)
            return false
        }
    }, [fetchConfigs])

    return {
        configs,
        isLoading,
        error,
        createConfig,
        updateConfig,
        deleteConfig,
        toggleActive,
        refetch: fetchConfigs,
    }
}
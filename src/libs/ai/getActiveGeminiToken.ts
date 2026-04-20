// libs/ai/getActiveGeminiToken.ts

import { GeminiTokenRecord } from "@/types/GeminiToken"
import { supabaseServer } from "../supabase/server"

export async function getActiveGeminiToken(): Promise<GeminiTokenRecord> {
    const { data, error } = await supabaseServer
        .from('gemini_tokens')
        .select('id, api_key, label')
        .eq('is_default', true)
        .eq('is_active', true)
        .is('deleted_at', null)
        .single()

    if (error || !data) {
        // Fallback: ambil token aktif mana saja jika tidak ada yang is_default
        const { data: fallback, error: fbErr } = await supabaseServer
            .from('gemini_tokens')
            .select('id, api_key, label')
            .eq('is_active', true)
            .is('deleted_at', null)
            .order('created_at', { ascending: true })
            .limit(1)
            .single()

        if (fbErr || !fallback) {
            throw new Error(
                'Tidak ada Gemini API token aktif di database. ' +
                'Tambahkan token di halaman Kelola Token.'
            )
        }

        return fallback as GeminiTokenRecord
    }

    return data as GeminiTokenRecord
}
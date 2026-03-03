// libs/ai/interpret.ts

import { buildPrompt } from './prompt'
import { supabaseServer } from '@/libs/supabase/server'

export const runtime = 'nodejs'

// ── Types ──────────────────────────────────────────────────────

export interface GeminiUsage {
    promptTokenCount: number
    candidatesTokenCount: number
    totalTokenCount: number
}

export interface GeminiTokenRecord {
    id: string
    api_key: string
    label: string
}

export interface InterpretResult {
    text: string
    usage: GeminiUsage | null
    tokenRecord: GeminiTokenRecord
}

// ── Ambil token aktif dari DB ──────────────────────────────────

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

// ── Update usage per request (fire-and-forget) ─────────────────

export async function incrementTokenUsage(
    tokenId: string,
    tokensUsed: number
): Promise<void> {
    // Gunakan RPC untuk atomic increment agar tidak race condition
    const { error } = await supabaseServer.rpc('increment_gemini_token_usage', {
        p_token_id: tokenId,
        p_tokens_used: tokensUsed,
    })

    // Jika RPC belum dibuat, fallback ke manual fetch + update
    if (error) {
        const { data: current } = await supabaseServer
            .from('gemini_tokens')
            .select('usage_count')
            .eq('id', tokenId)
            .single()

        await supabaseServer
            .from('gemini_tokens')
            .update({
                usage_count: (current?.usage_count ?? 0) + tokensUsed,
                last_used_at: new Date().toISOString(),
            })
            .eq('id', tokenId)
    }
}

// ── Update error tracking ──────────────────────────────────────

export async function recordTokenError(
    tokenId: string,
    errorMessage: string
): Promise<void> {
    const { data: current } = await supabaseServer
        .from('gemini_tokens')
        .select('error_count')
        .eq('id', tokenId)
        .single()

    await supabaseServer
        .from('gemini_tokens')
        .update({
            error_count: (current?.error_count ?? 0) + 1,
            last_error: errorMessage.slice(0, 500), // truncate agar tidak meluap
            last_error_at: new Date().toISOString(),
        })
        .eq('id', tokenId)
}

// ── Main interpret function ────────────────────────────────────

export async function interpretWithAI(
    text: string,
    token: GeminiTokenRecord
): Promise<InterpretResult> {
    try {
        const response = await fetch(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': token.api_key,
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: 'user',
                            parts: [{ text: buildPrompt(text) }],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.3,
                    },
                }),
            }
        )

        if (!response.ok) {
            const errorText = await response.text()
            const msg = `Gemini API failed: ${response.status} - ${errorText}`

            // Catat error ke DB (fire-and-forget, jangan block proses)
            recordTokenError(token.id, msg).catch(() => { })

            throw new Error(msg)
        }

        const data = await response.json()

        const interpretationText: string =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

        // Ambil usageMetadata dari response Gemini
        const usageMeta = data?.usageMetadata ?? null
        const usage: GeminiUsage | null = usageMeta
            ? {
                promptTokenCount: usageMeta.promptTokenCount ?? 0,
                candidatesTokenCount: usageMeta.candidatesTokenCount ?? 0,
                totalTokenCount: usageMeta.totalTokenCount ?? 0,
            }
            : null

        // Update usage_count di DB secara per-request (fire-and-forget)
        if (usage && usage.totalTokenCount > 0) {
            incrementTokenUsage(token.id, usage.totalTokenCount).catch(() => { })
        }

        return {
            text: interpretationText || 'AI tidak menemukan interpretasi',
            usage,
            tokenRecord: token,
        }
    } catch (error: any) {
        return {
            text: `AI interpretation failed: ${error.message}`,
            usage: null,
            tokenRecord: token,
        }
    }
}
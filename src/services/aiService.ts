// services/aiService.ts

import { supabaseServer } from '@/libs/supabase/server'
import {
    interpretWithAI,
    getActiveGeminiToken,
    type GeminiUsage,
    type GeminiTokenRecord,
} from '@/libs/ai/interpret'
import type { HasilInterpretasi } from '@/types/analysis'
import { DecodedRawItem } from '@/types/shared'

// ── Types ──────────────────────────────────────────────────────

interface PerItemTokenUsage {
    channel: string
    arah: string
    prompt_tokens: number
    candidates_tokens: number
    total_tokens: number
}

interface TokenUsageSummary {
    gemini_token_id: string
    gemini_token_label: string
    total_prompt_tokens: number
    total_candidates_tokens: number
    total_tokens: number
    per_item: PerItemTokenUsage[]
}

// ── Helpers ────────────────────────────────────────────────────

/**
 * Decode base64 → teks asli sebelum dikirim ke AI.
 * text disimpan sebagai base64 di DB karena JSONB tidak support \u0000.
 */
function decodeItemText(item: DecodedRawItem): string {
    if (!item.base64_encoded) return item.text
    try {
        return Buffer.from(item.text, 'base64').toString('binary')
    } catch {
        return item.text
    }
}

// ── Main Service ───────────────────────────────────────────────

export async function processAIInterpretation(
    analysisId: string,
    forceDecodeId: string,
    selectedItems: DecodedRawItem[]
) {
    const start = Date.now()
    const hasil: HasilInterpretasi[] = []

    // 1. Ambil token aktif dari DB sekali di awal
    //    (satu proses batch pakai token yang sama)
    let activeToken: GeminiTokenRecord
    try {
        activeToken = await getActiveGeminiToken()
    } catch (err: any) {
        throw new Error(`Gagal mendapatkan token Gemini: ${err.message}`)
    }

    // 2. Akumulasi token usage untuk seluruh batch
    const usageAccumulator: TokenUsageSummary = {
        gemini_token_id: activeToken.id,
        gemini_token_label: activeToken.label,
        total_prompt_tokens: 0,
        total_candidates_tokens: 0,
        total_tokens: 0,
        per_item: [],
    }

    // 3. Proses setiap item
    for (const item of selectedItems) {
        const decodedText = decodeItemText(item)

        if (!decodedText || decodedText.trim().length < 10) {
            hasil.push({
                channel: item.channel,
                arah: item.arah,
                interpretation:
                    'Tidak ada data tersembunyi yang terdeteksi atau data terlalu pendek untuk dianalisis.',
                status_ancaman: 'Aman',
            })

            // Catat item ini dengan 0 token (tidak ada request ke Gemini)
            usageAccumulator.per_item.push({
                channel: item.channel,
                arah: item.arah,
                prompt_tokens: 0,
                candidates_tokens: 0,
                total_tokens: 0,
            })

            continue
        }

        try {
            // interpretWithAI sudah:
            // - Menggunakan token yang kita pass
            // - Increment usage_count di DB per-request (fire-and-forget)
            // - Return usage metadata dari Gemini
            const result = await interpretWithAI(decodedText, activeToken)

            const statusMatch = result.text.match(
                /Status Ancaman\s*[:：]\s*(Aman|Mencurigakan|Berbahaya)/i
            )
            const statusAncaman = statusMatch
                ? (statusMatch[1] as HasilInterpretasi['status_ancaman'])
                : 'Aman'

            hasil.push({
                channel: item.channel,
                arah: item.arah,
                interpretation: result.text,
                status_ancaman: statusAncaman,
            })

            // Akumulasi usage dari response Gemini
            const usage: GeminiUsage | null = result.usage
            const perItem: PerItemTokenUsage = {
                channel: item.channel,
                arah: item.arah,
                prompt_tokens: usage?.promptTokenCount ?? 0,
                candidates_tokens: usage?.candidatesTokenCount ?? 0,
                total_tokens: usage?.totalTokenCount ?? 0,
            }

            usageAccumulator.per_item.push(perItem)
            usageAccumulator.total_prompt_tokens += perItem.prompt_tokens
            usageAccumulator.total_candidates_tokens += perItem.candidates_tokens
            usageAccumulator.total_tokens += perItem.total_tokens

        } catch (err: any) {
            hasil.push({
                channel: item.channel,
                arah: item.arah,
                interpretation: `Gagal interpretasi: ${err.message}`,
                status_ancaman: 'Aman',
            })

            usageAccumulator.per_item.push({
                channel: item.channel,
                arah: item.arah,
                prompt_tokens: 0,
                candidates_tokens: 0,
                total_tokens: 0,
            })
        }
    }

    const waktuProses = `${((Date.now() - start) / 1000).toFixed(2)}s`

    // 4. Update last_used_at di gemini_tokens sebagai penanda batch selesai
    //    (usage_count sudah di-increment per-request di dalam interpretWithAI,
    //     di sini kita hanya update timestamp terakhir dipakai)
    await supabaseServer
        .from('gemini_tokens')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', activeToken.id)
        .then(({ error }) => {
            if (error) console.error('[aiService] Gagal update last_used_at:', error.message)
        })

    // 5. Simpan hasil interpretasi + token_usage ke DB
    const { data, error } = await supabaseServer
        .from('analysis_interpretasi_ai')
        .insert({
            analysis_id: analysisId,
            analysis_forcedecode_id: forceDecodeId,
            hasil,
            waktu_proses: waktuProses,
            // Kolom baru hasil migration
            gemini_token_id: activeToken.id,
            token_usage: usageAccumulator,
        })
        .select()
        .single()

    if (error) throw error

    return data
}
// services/aiService.ts

'use server'

import { getActiveGeminiToken } from '@/libs/ai/getActiveGeminiToken'
import { interpretWithAI } from '@/libs/ai/interpret'
import supabaseAnonKey from '@/libs/supabase/anon_key'
import type { HasilInterpretasi } from '@/types/analysis'
import { GeminiTokenRecord, GeminiUsage, PerItemTokenUsage, TokenUsageSummary } from '@/types/GeminiToken'
import { DecodedRawItem } from '@/types/shared'
import { extractStatusAncaman } from '@/utils/ai/extractStatusAncaman'
import { decodeItemText } from '@/utils/Decode'
import { getWaktuWIB } from '@/utils/format'

export async function processAIInterpretation(
    analysisId: string,
    forceDecodeId: string,
    selectedItems: DecodedRawItem[]
): Promise<HasilInterpretasi[]> {
    const start = Date.now()
    const hasil: HasilInterpretasi[] = []

    let activeToken: GeminiTokenRecord
    try {
        activeToken = await getActiveGeminiToken()
    } catch (err: any) {
        throw new Error(`Gagal mendapatkan token Gemini: ${err.message}`)
    }

    const usageAccumulator: TokenUsageSummary = {
        gemini_token_id: activeToken.id,
        gemini_token_label: activeToken.label,
        total_prompt_tokens: 0,
        total_candidates_tokens: 0,
        total_tokens: 0,
        per_item: [],
    }

    for (const item of selectedItems) {
        const decodedText = decodeItemText(item)

        if (!decodedText || decodedText.trim().length < 10) {
            hasil.push({
                channel: item.channel,
                arah: item.arah,
                interpretation: 'Tidak ada data tersembunyi yang terdeteksi atau data terlalu pendek untuk dianalisis.',
                status_ancaman: 'Aman',
            })

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
            const result = await interpretWithAI(decodedText, activeToken)
            const statusAncaman = extractStatusAncaman(result.text)

            hasil.push({
                channel: item.channel,
                arah: item.arah,
                interpretation: result.text,
                status_ancaman: statusAncaman,
            })

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

    await supabaseAnonKey
        .from('gemini_tokens')
        .update({ last_used_at: getWaktuWIB().toISOString() })
        .eq('id', activeToken.id)
        .then(({ error }) => {
            if (error) console.error('[aiService] Gagal update last_used_at:', error.message)
        })

    const { error } = await supabaseAnonKey
        .from('analysis_interpretasi_ai')
        .insert({
            analysis_id: analysisId,
            analysis_forcedecode_id: forceDecodeId,
            hasil,
            waktu_proses: waktuProses,
            gemini_token_id: activeToken.id,
            token_usage: usageAccumulator,
        })

    if (error) throw error

    // ✅ Return array hasil, bukan DB row
    return hasil
}
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

    // per_item dari sesi INI saja — nanti di-merge ke per_item lama (jika ada)
    const sessionPerItem: PerItemTokenUsage[] = []

    // Jalankan AI untuk setiap item (tidak berubah)
    for (const item of selectedItems) {
        const decodedText = decodeItemText(item)

        if (!decodedText || decodedText.trim().length < 10) {
            hasil.push({
                channel: item.channel,
                arah: item.arah,
                interpretation: 'Tidak ada data tersembunyi yang terdeteksi atau data terlalu pendek untuk dianalisis.',
                status_ancaman: 'Aman',
            })

            sessionPerItem.push({
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
            sessionPerItem.push({
                channel: item.channel,
                arah: item.arah,
                prompt_tokens: usage?.promptTokenCount ?? 0,
                candidates_tokens: usage?.candidatesTokenCount ?? 0,
                total_tokens: usage?.totalTokenCount ?? 0,
            })

        } catch (err: any) {
            hasil.push({
                channel: item.channel,
                arah: item.arah,
                interpretation: `Gagal interpretasi: ${err.message}`,
                status_ancaman: 'Aman',
            })

            sessionPerItem.push({
                channel: item.channel,
                arah: item.arah,
                prompt_tokens: 0,
                candidates_tokens: 0,
                total_tokens: 0,
            })
        }
    }

    const waktuProses = `${((Date.now() - start) / 1000).toFixed(2)}s`

    // Update last_used_at token (tidak berubah)
    await supabaseAnonKey
        .from('gemini_tokens')
        .update({ last_used_at: getWaktuWIB().toISOString() })
        .eq('id', activeToken.id)
        .then(({ error }) => {
            if (error) console.error('[aiService] Gagal update last_used_at:', error.message)
        })

    // cek apakah record untuk analysis_id + forcedecode_id sudah ada
    const { data: existing, error: selectError } = await supabaseAnonKey
        .from('analysis_interpretasi_ai')
        .select('id, hasil, token_usage')
        .eq('analysis_id', analysisId)
        .eq('analysis_forcedecode_id', forceDecodeId)
        .is('deleted_at', null)
        .maybeSingle()

    if (selectError) throw selectError

    // merge array per_item berdasarkan channel+arah (timpa jika sama, append jika baru)
    function mergePerItem(
        oldItems: PerItemTokenUsage[],
        newItems: PerItemTokenUsage[]
    ): PerItemTokenUsage[] {
        const merged = [...oldItems]
        for (const item of newItems) {
            const idx = merged.findIndex(
                (m) => m.channel === item.channel && m.arah === item.arah
            )
            if (idx >= 0) merged[idx] = item
            else merged.push(item)
        }
        return merged
    }

    // hitung ulang total dari per_item yang sudah final (bukan akumulasi manual)
    function recalcTotals(perItem: PerItemTokenUsage[]) {
        return perItem.reduce(
            (acc, item) => ({
                total_prompt_tokens: acc.total_prompt_tokens + item.prompt_tokens,
                total_candidates_tokens: acc.total_candidates_tokens + item.candidates_tokens,
                total_tokens: acc.total_tokens + item.total_tokens,
            }),
            { total_prompt_tokens: 0, total_candidates_tokens: 0, total_tokens: 0 }
        )
    }

    if (existing) {
        // Merge hasil[] (channel+arah sama → timpa, baru → append)
        const existingHasil: HasilInterpretasi[] =
            typeof existing.hasil === 'string' ? JSON.parse(existing.hasil) : existing.hasil

        const mergedHasil: HasilInterpretasi[] = [...existingHasil]
        for (const newItem of hasil) {
            const idx = mergedHasil.findIndex(
                (h) => h.channel === newItem.channel && h.arah === newItem.arah
            )
            if (idx >= 0) mergedHasil[idx] = newItem
            else mergedHasil.push(newItem)
        }

        // Merge token_usage.per_item dengan aturan yang sama
        const existingTokenUsage: TokenUsageSummary =
            typeof existing.token_usage === 'string'
                ? JSON.parse(existing.token_usage)
                : existing.token_usage

        const mergedPerItem = mergePerItem(
            existingTokenUsage?.per_item ?? [],
            sessionPerItem
        )
        const totals = recalcTotals(mergedPerItem)

        const mergedTokenUsage: TokenUsageSummary = {
            gemini_token_id: activeToken.id,
            gemini_token_label: activeToken.label,
            per_item: mergedPerItem,
            ...totals,
        }

        const { error: updateError } = await supabaseAnonKey
            .from('analysis_interpretasi_ai')
            .update({
                hasil: mergedHasil,
                waktu_proses: waktuProses,
                gemini_token_id: activeToken.id,
                token_usage: mergedTokenUsage,
                updated_at: getWaktuWIB().toISOString(),
            })
            .eq('id', existing.id)

        if (updateError) throw updateError

    } else {
        // Belum ada record — insert baru, per_item = sessionPerItem saja
        const totals = recalcTotals(sessionPerItem)

        const tokenUsage: TokenUsageSummary = {
            gemini_token_id: activeToken.id,
            gemini_token_label: activeToken.label,
            per_item: sessionPerItem,
            ...totals,
        }

        const { error: insertError } = await supabaseAnonKey
            .from('analysis_interpretasi_ai')
            .insert({
                analysis_id: analysisId,
                analysis_forcedecode_id: forceDecodeId,
                hasil,
                waktu_proses: waktuProses,
                gemini_token_id: activeToken.id,
                token_usage: tokenUsage,
            })

        if (insertError) throw insertError
    }

    // Return hasil
    return hasil
}
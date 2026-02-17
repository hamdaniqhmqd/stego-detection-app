// services/aiService.ts

import { supabaseServer } from '@/libs/supabase/server'
import { interpretWithAI } from '@/libs/ai/interpret'
import type { DecodedRawItem, HasilInterpretasi } from '@/types/analysis'

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

export async function processAIInterpretation(
    analysisId: string,
    forceDecodeId: string,
    selectedItems: DecodedRawItem[]
) {
    const start = Date.now()
    const hasil: HasilInterpretasi[] = []

    for (const item of selectedItems) {
        // Decode base64 → teks asli
        const decodedText = decodeItemText(item)

        if (!decodedText || decodedText.trim().length < 10) {
            hasil.push({
                channel: item.channel,
                arah: item.arah,
                interpretation:
                    'Tidak ada data tersembunyi yang terdeteksi atau data terlalu pendek untuk dianalisis.',
                status_ancaman: 'Aman',
            })
            continue
        }

        try {
            const raw = await interpretWithAI(decodedText)

            const statusMatch = raw.match(
                /Status Ancaman\s*[:：]\s*(Aman|Mencurigakan|Berbahaya)/i
            )
            const statusAncaman = statusMatch
                ? (statusMatch[1] as HasilInterpretasi['status_ancaman'])
                : 'Aman'

            hasil.push({
                channel: item.channel,
                arah: item.arah,
                interpretation: raw,
                status_ancaman: statusAncaman,
            })
        } catch (err: any) {
            hasil.push({
                channel: item.channel,
                arah: item.arah,
                interpretation: `Gagal interpretasi: ${err.message}`,
                status_ancaman: 'Aman',
            })
        }
    }

    const waktuProses = `${((Date.now() - start) / 1000).toFixed(2)}s`

    const { data, error } = await supabaseServer
        .from('analysis_interpretasi_ai')
        .insert({
            analysis_id: analysisId,
            analysis_forcedecode_id: forceDecodeId,
            hasil,
            waktu_proses: waktuProses,
        })
        .select()
        .single()

    if (error) throw error
    return data
}
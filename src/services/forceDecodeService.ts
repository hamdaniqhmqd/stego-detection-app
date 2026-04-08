// services/forceDecodeService.ts

import { supabaseServer } from '@/libs/supabase/server'
import { forceDecodeLSB } from '@/libs/steganalysis/forceDecode'
import type { DecodeTeknik, DecodedBitItem, DecodedRawItem } from '@/types/shared'
import { getWaktuWIB } from '@/utils/format'

function encodeTextForJsonb(text: string): string {
    return Buffer.from(text, 'binary').toString('base64')
}

export async function processForceDecode(
    analysisId: string,
    imageUrl: string,
    teknikList: DecodeTeknik[]
) {
    const start = getWaktuWIB()

    const imageRes = await fetch(imageUrl)
    if (!imageRes.ok) throw new Error(`Gagal mengambil gambar: ${imageRes.statusText}`)
    const buffer = Buffer.from(await imageRes.arrayBuffer())

    const { decodedBit, decodedRaw } = await forceDecodeLSB(buffer, teknikList)

    const waktuProses = `${((Number(getWaktuWIB()) - Number(start)) / 1000).toFixed(2)}s`

    // Encode raw text untuk jsonb
    const safeRaw = decodedRaw.map((item) => ({
        ...item,
        text: encodeTextForJsonb(item.text),
        base64_encoded: true,
    }))

    // ── 1. Simpan ke analysis_forcedecode (ringkasan, tanpa payload besar) ──
    const { data: fdRecord, error: fdError } = await supabaseServer
        .from('analysis_forcedecode')
        .insert({
            analysis_id: analysisId,
            decode_teknik: teknikList,
            waktu_proses: waktuProses,
        })
        .select()
        .single()

    if (fdError) throw fdError

    // ── 2. Simpan per-teknik ke method_forcedecode ──
    const methodRows = teknikList.map((teknik) => {
        const bitItem = decodedBit.find(
            (b) => b.channel === teknik.channel && b.arah === teknik.arah
        )
        const rawItem = safeRaw.find(
            (r) => r.channel === teknik.channel && r.arah === teknik.arah
        )

        return {
            analysis_forcedecode_id: fdRecord.id,
            channel: teknik.channel,
            arah: teknik.arah,
            decoded_bit: bitItem
                ? { bits: bitItem.bits, total_bits: bitItem.total_bits }
                : null,
            decoded_raw: rawItem
                ? {
                    text: rawItem.text,
                    base64_encoded: rawItem.base64_encoded,
                    printable_ratio: rawItem.printable_ratio,
                    total_chars: rawItem.total_chars,
                }
                : null,
        }
    })

    const { error: methodError } = await supabaseServer
        .from('method_forcedecode')
        .insert(methodRows)

    if (methodError) throw methodError

    return fdRecord
}
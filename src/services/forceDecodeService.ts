// services/forceDecodeService.ts

import { supabaseServer } from '@/libs/supabase/server'
import { forceDecodeLSB } from '@/libs/steganalysis/forceDecode'
import type { DecodeTeknik, DecodedBitItem, DecodedRawItem } from '@/types/shared'

function encodeTextForJsonb(text: string): string {
    return Buffer.from(text, 'binary').toString('base64')
}

function sanitizeDecodedBit(items: DecodedBitItem[]): DecodedBitItem[] {
    return items
}

function sanitizeDecodedRaw(items: DecodedRawItem[]): DecodedRawItem[] {
    return items.map((item) => ({
        ...item,
        text: encodeTextForJsonb(item.text),
        base64_encoded: true,
    }))
}

export async function processForceDecode(
    analysisId: string,
    imageUrl: string,
    teknikList: DecodeTeknik[]
) {
    const start = Date.now()

    // Ambil gambar dari URL
    const imageRes = await fetch(imageUrl)
    if (!imageRes.ok) throw new Error(`Gagal mengambil gambar: ${imageRes.statusText}`)
    const buffer = Buffer.from(await imageRes.arrayBuffer())

    // Jalankan force decode — hasilkan decoded_bit dan decoded_raw
    const { decodedBit, decodedRaw } = await forceDecodeLSB(buffer, teknikList)

    const waktuProses = `${((Date.now() - start) / 1000).toFixed(2)}s`

    // Sanitasi sebelum masuk JSONB:
    // - decoded_bit: bits string hanya 0/1 → aman langsung
    // - decoded_raw: text bisa mengandung \u0000 → encode ke base64
    const safeBit = sanitizeDecodedBit(decodedBit)
    const safeRaw = sanitizeDecodedRaw(decodedRaw)

    // Simpan ke tabel analysis_forcedecode
    const { data, error } = await supabaseServer
        .from('analysis_forcedecode')
        .insert({
            analysis_id: analysisId,
            decode_teknik: teknikList,
            decoded_bit: safeBit,
            decoded_raw: safeRaw,
            waktu_proses: waktuProses,
        })
        .select()
        .single()

    if (error) throw error
    return data
}
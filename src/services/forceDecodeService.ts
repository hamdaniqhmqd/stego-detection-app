// services/forceDecodeService.ts

import { supabaseServer } from '@/libs/supabase/server'
import { forceDecodeLSB } from '@/libs/steganalysis/forceDecode'
import type { DecodeTeknik, DecodedBitItem, DecodedRawItem } from '@/types/analysis'

/**
 * PostgreSQL/Supabase JSONB tidak mendukung karakter null (\u0000) dan
 * beberapa Unicode escape sequence yang tidak valid di JSON.
 *
 * Solusi: encode string ke Base64 sebelum disimpan ke JSONB,
 * lalu decode kembali di sisi client/komponen.
 *
 * Ini memastikan semua byte 0x00–0xFF tersimpan dengan aman tanpa kehilangan data.
 */

function encodeTextForJsonb(text: string): string {
    // Konversi string ke Buffer latin-1 (preserves 0x00–0xFF),
    // lalu encode ke base64 agar aman untuk JSONB
    return Buffer.from(text, 'binary').toString('base64')
}

function sanitizeDecodedBit(items: DecodedBitItem[]): DecodedBitItem[] {
    // bits hanya berisi '0' dan '1' — aman, tidak perlu encode
    return items
}

function sanitizeDecodedRaw(items: DecodedRawItem[]): DecodedRawItem[] {
    return items.map((item) => ({
        ...item,
        // Encode text ke base64 agar aman di JSONB
        // Flag 'base64_encoded: true' digunakan oleh client untuk decode balik
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
// libs/steganalysis/forceDecode.ts

import { Jimp } from 'jimp'
import type {
    Channel,
    TeknikArah,
    DecodeTeknik,
    DecodedBitItem,
    DecodedRawItem,
} from '@/types/analysis'

type PixelCoord = { x: number; y: number }

// ─── Koordinat pixel per arah ekstraksi ─────────────────────────────────────
function getPixelCoordinates(
    width: number,
    height: number,
    arah: TeknikArah
): PixelCoord[] {
    const coords: PixelCoord[] = []

    switch (arah) {
        // Kiri → Kanan, Atas → Bawah (standard)
        case 'kiri-kanan-atas-bawah':
            for (let y = 0; y < height; y++)
                for (let x = 0; x < width; x++)
                    coords.push({ x, y })
            break

        // Kanan → Kiri, Bawah → Atas
        case 'kanan-kiri-bawah-atas':
            for (let y = height - 1; y >= 0; y--)
                for (let x = width - 1; x >= 0; x--)
                    coords.push({ x, y })
            break

        // Atas → Bawah, Kiri → Kanan (per kolom)
        case 'atas-bawah-kiri-kanan':
            for (let x = 0; x < width; x++)
                for (let y = 0; y < height; y++)
                    coords.push({ x, y })
            break

        // Bawah → Atas, Kanan → Kiri
        case 'bawah-atas-kanan-kiri':
            for (let x = width - 1; x >= 0; x--)
                for (let y = height - 1; y >= 0; y--)
                    coords.push({ x, y })
            break
    }

    return coords
}

// ─── Ekstrak semua bit LSB dari satu channel ─────────────────────────────────

function extractLSBChannel(
    data: Buffer,
    coords: PixelCoord[],
    width: number,
    channel: Channel
): string {
    const channelOffset = channel === 'R' ? 0 : channel === 'G' ? 1 : 2
    let bits = ''

    for (const { x, y } of coords) {
        const idx = (y * width + x) * 4   // RGBA → 4 bytes per pixel
        bits += (data[idx + channelOffset] & 1).toString()
    }

    return bits
}

// ─── Decode semua bit → teks, byte 0–255 tanpa filter ───────────────────────

/**
 * Decode SEMUA bit ke string.
 * - Tidak berhenti di null byte (0x00)
 * - Tidak mem-filter karakter apapun — semua byte 0x00–0xFF masuk
 * - String.fromCharCode langsung tanpa replacement
 */
function bitsToFullText(bits: string): string {
    let result = ''
    for (let i = 0; i + 8 <= bits.length; i += 8) {
        result += String.fromCharCode(parseInt(bits.slice(i, i + 8), 2))
    }
    return result
}

// ─── Hitung printable ratio (info tambahan di card) ──────────────────────────

function calculatePrintableRatio(text: string, sampleSize = 5000): number {
    const sample = text.slice(0, sampleSize)
    if (sample.length === 0) return 0
    const printable = [...sample].filter(
        (c) =>
            (c >= ' ' && c <= '~') ||
            c === '\n' ||
            c === '\r' ||
            c === '\t'
    ).length
    return printable / sample.length
}

// ─── Entry point ─────────────────────────────────────────────────────────────
export interface ForceDecodeResult {
    decodedBit: DecodedBitItem[]
    decodedRaw: DecodedRawItem[]
}

/**
 * Jalankan force decode LSB untuk semua kombinasi channel × teknik.
 *
 * @param imageBuffer   Buffer gambar (PNG/JPG)
 * @param teknikList    Daftar kombinasi {channel, arah} yang dijalankan
 * @returns             { decodedBit, decodedRaw } — satu item per kombinasi
 */
export async function forceDecodeLSB(
    imageBuffer: Buffer,
    teknikList: DecodeTeknik[]
): Promise<ForceDecodeResult> {
    const image = await Jimp.read(imageBuffer)
    const { width, height } = image.bitmap
    const pixelData = image.bitmap.data as unknown as Buffer

    const decodedBit: DecodedBitItem[] = []
    const decodedRaw: DecodedRawItem[] = []

    for (const { channel, arah } of teknikList) {
        const coords = getPixelCoordinates(width, height, arah)

        // 1. Ekstrak semua bit LSB sesuai urutan koordinat
        const bits = extractLSBChannel(pixelData, coords, width, channel)

        // 2. Decode semua bit ke teks — 0x00–0xFF, tidak ada filter
        const text = bitsToFullText(bits)

        decodedBit.push({
            channel,
            arah,
            bits,
            total_bits: bits.length,
        })

        decodedRaw.push({
            channel,
            arah,
            text,
            printable_ratio: calculatePrintableRatio(text),
            total_chars: text.length,
        })
    }

    return { decodedBit, decodedRaw }
}
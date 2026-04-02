// services/forceDecodeService.ts

import { supabaseServer } from '@/libs/supabase/server'
import { forceDecodeLSB } from '@/libs/steganalysis/forceDecode'
import type { DecodeTeknik, DecodedBitItem } from '@/types/shared'
import type { DecodedRawItemExtended, DetectedMarker, MessageSegment } from '@/libs/steganalysis/forceDecode'

// ─── Encoding helper ──────────────────────────────────────────────────────────

function encodeText(text: string): string {
    return Buffer.from(text, 'binary').toString('base64')
}

function sanitizeDecodedBit(items: DecodedBitItem[]): DecodedBitItem[] {
    return items
}

function sanitizeMarker(m: DetectedMarker): DetectedMarker {
    return { ...m, marker: encodeText(m.marker) }
}

function sanitizeSegment(s: MessageSegment): MessageSegment {
    return {
        ...s,
        text: encodeText(s.text),
        boundary_marker: encodeText(s.boundary_marker),
    }
}

function sanitizeDecodedRaw(items: DecodedRawItemExtended[]): object[] {
    return items.map((item) => ({
        channel: item.channel,
        arah: item.arah,
        text: encodeText(item.text),
        base64_encoded: true,
        printable_ratio: item.printable_ratio,
        total_chars: item.total_chars,
        detected_markers: item.detected_markers.map(sanitizeMarker),
        message_segments: item.message_segments.map(sanitizeSegment),
    }))
}

// ─── Fetch gambar dengan retry + timeout ─────────────────────────────────────
//
// "TypeError: terminated" paling sering disebabkan oleh:
//   1. Koneksi ke storage (Supabase/S3) terputus di tengah stream
//   2. Signed URL sudah expired saat di-fetch dari server
//   3. Server Next.js tidak bisa akses URL internal storage secara langsung
//
// Solusi: retry 3x dengan timeout 30 detik, validasi buffer sebelum ke Jimp

async function fetchImageBuffer(imageUrl: string): Promise<Buffer> {
    const MAX_RETRIES = 3
    const TIMEOUT_MS = 30_000

    let lastError: Error = new Error('Unknown error')

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

        try {
            console.log(`[forceDecode] Fetch gambar attempt ${attempt}/${MAX_RETRIES}: ${imageUrl}`)

            const res = await fetch(imageUrl, {
                signal: controller.signal,
                headers: {
                    'Accept': 'image/png,image/jpeg,image/webp,image/*',
                    'Cache-Control': 'no-cache',
                },
            })

            clearTimeout(timeoutId)

            if (!res.ok) {
                throw new Error(`HTTP ${res.status} ${res.statusText}`)
            }

            const contentLength = res.headers.get('content-length')
            const contentType = res.headers.get('content-type') ?? 'unknown'
            console.log(`[forceDecode] content-type: ${contentType}, content-length: ${contentLength ?? 'tidak diketahui'}`)

            const arrayBuffer = await res.arrayBuffer()

            if (arrayBuffer.byteLength === 0) {
                throw new Error(`Buffer kosong (0 bytes) — URL mungkin tidak valid atau sudah expired`)
            }

            console.log(`[forceDecode] Buffer OK: ${arrayBuffer.byteLength} bytes`)
            return Buffer.from(arrayBuffer)

        } catch (err: any) {
            clearTimeout(timeoutId)
            lastError = err

            if (err.name === 'AbortError') {
                lastError = new Error(
                    `Fetch timeout (${TIMEOUT_MS / 1000}s). ` +
                    `Pastikan URL gambar dapat diakses dari sisi server, bukan hanya browser.`
                )
            } else if (
                err.message?.includes('terminated') ||
                err.message?.includes('socket hang up') ||
                err.message?.includes('ECONNRESET')
            ) {
                lastError = new Error(
                    `Koneksi terputus saat mengunduh gambar (${err.message}). ` +
                    `Kemungkinan penyebab: signed URL expired, atau server storage tidak dapat dijangkau.`
                )
            }

            console.error(`[forceDecode] Fetch error attempt ${attempt}: ${lastError.message}`)

            if (attempt < MAX_RETRIES) {
                // Tunggu sebelum retry: 500ms, 1000ms, dst
                await new Promise(r => setTimeout(r, attempt * 500))
            }
        }
    }

    throw lastError
}

// ─── Validasi magic bytes buffer ─────────────────────────────────────────────
//
// Jimp melempar "TypeError: terminated" saat menerima buffer yang bukan gambar
// (misal halaman HTML error dari storage, atau buffer terpotong).
// Cek magic bytes sebelum menyerahkan ke Jimp.

function validateImageBuffer(buffer: Buffer): void {
    if (buffer.length < 12) {
        throw new Error(`Buffer terlalu kecil (${buffer.length} bytes) — bukan file gambar valid`)
    }

    const isPNG = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47
    const isJPEG = buffer[0] === 0xff && buffer[1] === 0xd8
    const isWebP = buffer.slice(8, 12).toString('ascii') === 'WEBP'
    const isGIF = buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46

    if (!isPNG && !isJPEG && !isWebP && !isGIF) {
        // Cuplikan awal untuk membantu debug (mungkin HTML error page)
        const preview = buffer.slice(0, 120).toString('utf8').replace(/\n/g, ' ')
        throw new Error(
            `Buffer bukan file gambar valid. ` +
            `Magic bytes: 0x${buffer.slice(0, 4).toString('hex')}. ` +
            `Kemungkinan URL mengembalikan halaman error: "${preview}"`
        )
    }

    console.log(`[forceDecode] Format gambar valid — PNG: ${isPNG}, JPEG: ${isJPEG}, WebP: ${isWebP}, GIF: ${isGIF}`)
}

// ─── Service utama ────────────────────────────────────────────────────────────

export async function processForceDecode(
    analysisId: string,
    imageUrl: string,
    teknikList: DecodeTeknik[]
) {
    const start = Date.now()
    console.log(`[forceDecode] Mulai — ${teknikList.length} kombinasi — URL: ${imageUrl}`)

    // 1. Ambil gambar dengan retry dan timeout
    const buffer = await fetchImageBuffer(imageUrl)

    // 2. Validasi magic bytes sebelum ke Jimp
    validateImageBuffer(buffer)

    // 3. Jalankan force decode LSB
    console.log(`[forceDecode] Menjalankan Jimp + LSB extraction...`)
    const { decodedBit, decodedRaw } = await forceDecodeLSB(buffer, teknikList)

    const waktuProses = `${((Date.now() - start) / 1000).toFixed(2)}s`
    console.log(`[forceDecode] Selesai dalam ${waktuProses}`)

    // 4. Sanitasi dan simpan ke Supabase
    const safeBit = sanitizeDecodedBit(decodedBit)
    const safeRaw = sanitizeDecodedRaw(decodedRaw)

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

    if (error) {
        console.error(`[forceDecode] Supabase insert error:`, error)
        throw error
    }

    return data
}
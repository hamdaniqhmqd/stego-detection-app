// libs/steganalysis/forceDecode.ts

import { Jimp } from 'jimp'
import type {
    Channel,
    TeknikArah,
    DecodeTeknik,
    DecodedBitItem,
    DecodedRawItem,
} from '@/types/shared'

// ─── Tipe tambahan ────────────────────────────────────────────────────────────

export interface DetectedMarker {
    /** Representasi marker (bisa mengandung byte kontrol) */
    marker: string
    /** Nilai byte dari marker */
    bytes: number[]
    /** Posisi karakter dalam teks (semua kemunculan) */
    positions: number[]
    /** Tipe pendeteksian */
    type: 'null_cluster' | 'control_sequence' | 'repeated_pattern' | 'printable_boundary'
    /** Skor kepercayaan 0–1 */
    confidence: number
}

export interface MessageSegment {
    start: number
    end: number
    /** Teks segmen (raw, encoding ke base64 dilakukan di service) */
    text: string
    printable_ratio: number
    /** Representasi marker yang membatasi segmen ini */
    boundary_marker: string
}

/** DecodedRawItem yang diperluas dengan info marker dan segmen */
export interface DecodedRawItemExtended extends DecodedRawItem {
    detected_markers: DetectedMarker[]
    message_segments: MessageSegment[]
}

// ─── Koordinat pixel per arah ─────────────────────────────────────────────────

type PixelCoord = { x: number; y: number }

function getPixelCoordinates(
    width: number,
    height: number,
    arah: TeknikArah
): PixelCoord[] {
    const coords: PixelCoord[] = []

    switch (arah) {
        case 'atas-bawah-kiri-kanan-col':          // top-bottom, left→right
            for (let y = 0; y < height; y++)
                for (let x = 0; x < width; x++)
                    coords.push({ x, y })
            break

        case 'atas-bawah-kanan-kiri-col':          // top-bottom, right→left
            for (let y = 0; y < height; y++)
                for (let x = width - 1; x >= 0; x--)
                    coords.push({ x, y })
            break

        case 'bawah-atas-kiri-kanan-col':          // bottom-top, left→right
            for (let y = height - 1; y >= 0; y--)
                for (let x = 0; x < width; x++)
                    coords.push({ x, y })
            break

        case 'bawah-atas-kanan-kiri-col':          // bottom-top, right→left
            for (let y = height - 1; y >= 0; y--)
                for (let x = width - 1; x >= 0; x--)
                    coords.push({ x, y })
            break

        case 'kiri-kanan-atas-bawah-row':          // left→right, top-bottom
            for (let x = 0; x < width; x++)
                for (let y = 0; y < height; y++)
                    coords.push({ x, y })
            break

        case 'kanan-kiri-atas-bawah-row':          // right→left, top-bottom
            for (let x = width - 1; x >= 0; x--)
                for (let y = 0; y < height; y++)
                    coords.push({ x, y })
            break

        case 'kiri-kanan-bawah-atas-row':          // left→right, bottom-top
            for (let x = 0; x < width; x++)
                for (let y = height - 1; y >= 0; y--)
                    coords.push({ x, y })
            break

        case 'kanan-kiri-bawah-atas-row':          // right→left, bottom-top
            for (let x = width - 1; x >= 0; x--)
                for (let y = height - 1; y >= 0; y--)
                    coords.push({ x, y })
            break
    }

    return coords
}

// ─── Ekstrak semua bit LSB dari satu channel ──────────────────────────────────

function extractLSBChannel(
    data: Buffer,
    coords: PixelCoord[],
    width: number,
    channel: Channel
): string {
    const off = channel === 'R' ? 0 : channel === 'G' ? 1 : 2
    let bits = ''

    for (const { x, y } of coords) {
        const idx = (y * width + x) * 4  // RGBA → 4 bytes per pixel
        bits += (data[idx + off] & 1).toString()
    }

    return bits
}

// ─── Konversi bit → simbol langsung (0x00–0xFF, seluruh tabel ASCII) ─────────
//
// Setiap 8 bit → 1 byte → String.fromCharCode(byte).
// TIDAK ada filter, TIDAK ada HTML entity, TIDAK ada replacement.
// 0x00 = NUL, 0x41 = 'A', 0xFF = 'ÿ' — semua masuk apa adanya.

function bitsToSymbols(bits: string): string {
    let result = ''
    for (let i = 0; i + 8 <= bits.length; i += 8) {
        result += String.fromCharCode(parseInt(bits.slice(i, i + 8), 2))
    }
    return result
}

// ─── Hitung printable ratio ───────────────────────────────────────────────────

function calcPrintableRatio(text: string, sampleSize = 5000): number {
    const sample = text.slice(0, sampleSize)
    if (sample.length === 0) return 0
    let count = 0
    for (let i = 0; i < sample.length; i++) {
        const c = sample.charCodeAt(i)
        if (
            (c >= 0x20 && c <= 0x7e) ||
            c === 0x09 ||   // tab
            c === 0x0a ||   // LF
            c === 0x0d      // CR
        ) count++
    }
    return count / sample.length
}

// ─── Deteksi key_marker alami dari data ──────────────────────────────────────
//
// Tidak ada wordlist. Tidak ada string hardcode.
// Semua marker berasal dari pola statistik yang ditemukan dalam data image:
//
//  1. null_cluster       → ≥3 byte 0x00 berturutan (terminator LSB paling umum)
//  2. control_sequence   → byte 0x01–0x1F (non-whitespace) dengan jarak regular
//  3. repeated_pattern   → sekuens 3–8 byte non-printable yang muncul ≥3×
//  4. printable_boundary → transisi tajam area printable tinggi → noise rendah

function detectNaturalMarkers(text: string): DetectedMarker[] {
    const markers: DetectedMarker[] = []
    const bytes = Array.from(text, c => c.charCodeAt(0))
    const maxScan = Math.min(bytes.length, 8192)

    // ── 1. Null cluster ───────────────────────────────────────────────────────
    {
        const clusterPositions: number[] = []
        let runStart = -1
        let runLen = 0

        for (let i = 0; i <= maxScan; i++) {
            if (i < maxScan && bytes[i] === 0x00) {
                if (runLen === 0) runStart = i
                runLen++
            } else {
                if (runLen >= 3) clusterPositions.push(runStart)
                runLen = 0
                runStart = -1
            }
        }

        if (clusterPositions.length > 0) {
            const confidence =
                clusterPositions.length <= 3 ? 0.90 :
                    clusterPositions.length <= 10 ? 0.70 : 0.40

            markers.push({
                marker: '\x00\x00\x00',
                bytes: [0x00, 0x00, 0x00],
                positions: clusterPositions,
                type: 'null_cluster',
                confidence,
            })
        }
    }

    // ── 2. Control sequence separator ─────────────────────────────────────────
    {
        const controlFreq = new Map<number, number[]>()

        for (let i = 0; i < maxScan; i++) {
            const b = bytes[i]
            // Byte kontrol selain tab, LF, CR
            if (b >= 0x01 && b <= 0x1f && b !== 0x09 && b !== 0x0a && b !== 0x0d) {
                if (!controlFreq.has(b)) controlFreq.set(b, [])
                controlFreq.get(b)!.push(i)
            }
        }

        for (const [byte, positions] of controlFreq) {
            if (positions.length < 2) continue

            // Coefficient of variation dari jarak antar kemunculan
            // CV rendah = spacing regular = kemungkinan separator disengaja
            const gaps = positions.slice(1).map((p, i) => p - positions[i])
            const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length
            const variance = gaps.reduce((a, g) => a + Math.pow(g - avgGap, 2), 0) / gaps.length
            const cv = avgGap > 0 ? Math.sqrt(variance) / avgGap : 999

            const confidence =
                cv < 0.2 ? 0.85 :
                    cv < 0.5 ? 0.65 :
                        positions.length >= 5 ? 0.50 : 0.30

            if (confidence >= 0.50) {
                markers.push({
                    marker: String.fromCharCode(byte),
                    bytes: [byte],
                    positions,
                    type: 'control_sequence',
                    confidence,
                })
            }
        }
    }

    // ── 3. Repeated short pattern ─────────────────────────────────────────────
    {
        const scanZone = text.slice(0, Math.min(2048, text.length))

        for (let patLen = 3; patLen <= 8; patLen++) {
            const seen = new Map<string, number[]>()

            for (let i = 0; i <= scanZone.length - patLen; i++) {
                const pat = scanZone.slice(i, i + patLen)

                // Hanya pattern yang mengandung byte non-printable
                // (pattern teks biasa terlalu umum dan bukan marker)
                const hasNonPrintable = Array.from(pat).some(
                    c => c.charCodeAt(0) < 0x20 || c.charCodeAt(0) > 0x7e
                )
                if (!hasNonPrintable) continue

                if (!seen.has(pat)) seen.set(pat, [])
                seen.get(pat)!.push(i)
            }

            for (const [pat, positions] of seen) {
                if (positions.length < 3) continue

                const confidence =
                    positions.length >= 5 ? 0.80 :
                        positions.length >= 3 ? 0.65 : 0.40

                markers.push({
                    marker: pat,
                    bytes: Array.from(pat, c => c.charCodeAt(0)),
                    positions,
                    type: 'repeated_pattern',
                    confidence,
                })
            }
        }
    }

    // ── 4. Printable boundary ─────────────────────────────────────────────────
    {
        const windowSize = 64
        const stepSize = 32

        interface Boundary { pos: number; drop: number }
        const boundaries: Boundary[] = []

        for (let i = windowSize; i < Math.min(maxScan - windowSize, 4096); i += stepSize) {
            const rBefore = calcPrintableRatio(text.slice(i - windowSize, i), windowSize)
            const rAfter = calcPrintableRatio(text.slice(i, i + windowSize), windowSize)
            const drop = rBefore - rAfter

            // Transisi tajam: sebelum printable tinggi, sesudah noise rendah
            if (rBefore >= 0.60 && rAfter <= 0.20 && drop >= 0.40) {
                boundaries.push({ pos: i, drop })
            }
        }

        if (boundaries.length > 0 && boundaries.length <= 5) {
            boundaries.sort((a, b) => b.drop - a.drop)
            const best = boundaries[0]
            const confidence =
                best.drop >= 0.70 ? 0.80 :
                    best.drop >= 0.50 ? 0.65 : 0.50

            markers.push({
                marker: `[boundary@${best.pos}]`,
                bytes: [],
                positions: boundaries.map(b => b.pos),
                type: 'printable_boundary',
                confidence,
            })
        }
    }

    // Urutkan dari confidence tertinggi
    markers.sort((a, b) => b.confidence - a.confidence)

    return markers
}

// ─── Isolasi segmen pesan berdasarkan marker ──────────────────────────────────
//
// Gunakan marker dengan confidence tertinggi untuk memisahkan teks.
// Tidak ada asumsi tentang isi — murni berdasarkan pola yang ditemukan.

function extractMessageSegments(text: string, markers: DetectedMarker[]): MessageSegment[] {
    if (markers.length === 0) return []

    const best = markers[0]  // sudah diurutkan by confidence
    if (best.positions.length === 0) return []

    const markerByteLen = best.bytes.length > 0 ? best.bytes.length : 32
    const segments: MessageSegment[] = []

    for (let i = 0; i < best.positions.length; i++) {
        const markerStart = best.positions[i]
        const markerEnd = markerStart + markerByteLen

        // Segmen sebelum marker ini
        const prevEnd = i > 0 ? best.positions[i - 1] + markerByteLen : 0
        const segText = text.slice(prevEnd, markerStart)

        if (segText.length > 0) {
            segments.push({
                start: prevEnd,
                end: markerStart,
                text: segText,
                printable_ratio: calcPrintableRatio(segText),
                boundary_marker: best.marker,
            })
        }

        // Segmen setelah marker terakhir (ambil 512 char)
        if (i === best.positions.length - 1) {
            const tail = text.slice(markerEnd, markerEnd + 512)
            if (tail.length > 0) {
                segments.push({
                    start: markerEnd,
                    end: markerEnd + tail.length,
                    text: tail,
                    printable_ratio: calcPrintableRatio(tail),
                    boundary_marker: best.marker,
                })
            }
        }
    }

    // Urutkan dari printable_ratio tertinggi (kandidat pesan terkuat di atas)
    segments.sort((a, b) => b.printable_ratio - a.printable_ratio)

    return segments
}

// ─── Entry point ──────────────────────────────────────────────────────────────

export interface ForceDecodeResult {
    decodedBit: DecodedBitItem[]
    decodedRaw: DecodedRawItemExtended[]
}

/**
 * Force decode LSB — satu stream bit per kombinasi channel × arah.
 *
 * Setiap kombinasi diproses TERPISAH, tidak digabung:
 *   Channel R arah T1 → 1 hasil
 *   Channel G arah T1 → 1 hasil
 *   Channel B arah T1 → 1 hasil
 *   Channel R arah T2 → 1 hasil
 *   ... dst (total = channel × arah kombinasi)
 *
 * Proses per kombinasi:
 *   1. Kumpulkan semua bit LSB dari setiap byte channel yang dipilih
 *   2. Konversi bit → simbol langsung (0x00–0xFF, seluruh tabel ASCII)
 *   3. Deteksi key_marker alami dari pola statistik dalam data
 *   4. Isolasi segmen pesan berdasarkan marker yang ditemukan
 */
export async function forceDecodeLSB(
    imageBuffer: Buffer,
    teknikList: DecodeTeknik[]
): Promise<ForceDecodeResult> {
    const image = await Jimp.read(imageBuffer)
    const { width, height } = image.bitmap
    const pixelData = image.bitmap.data as unknown as Buffer

    const decodedBit: DecodedBitItem[] = []
    const decodedRaw: DecodedRawItemExtended[] = []

    for (const { channel, arah } of teknikList) {
        const coords = getPixelCoordinates(width, height, arah)

        // 1. Kumpulkan semua bit LSB dari setiap byte channel ini
        const bits = extractLSBChannel(pixelData, coords, width, channel)

        // 2. Konversi bit → simbol langsung (0x00–0xFF, tidak ada filter)
        const text = bitsToSymbols(bits)

        // 3. Deteksi key_marker alami (null cluster, control byte, pattern, boundary)
        const detected_markers = detectNaturalMarkers(text)

        // 4. Isolasi segmen pesan berdasarkan marker terbaik
        const message_segments = extractMessageSegments(text, detected_markers)

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
            printable_ratio: calcPrintableRatio(text),
            total_chars: text.length,
            detected_markers,
            message_segments,
        })
    }

    return { decodedBit, decodedRaw }
}
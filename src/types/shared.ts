// types/shared.ts

export type Channel = 'R' | 'G' | 'B'

export type TeknikArah =
    // ── baru: column-major (loop y luar, x dalam) ──
    | 'atas-bawah-kiri-kanan-col'    // top-bottom, left→right, per kolom
    | 'atas-bawah-kanan-kiri-col'    // top-bottom, right→left, per kolom
    | 'bawah-atas-kiri-kanan-col'    // bottom-top, left→right, per kolom
    | 'bawah-atas-kanan-kiri-col'    // bottom-top, right→left, per kolom
    // ── baru: row-major (loop x luar, y dalam) ──
    | 'kiri-kanan-atas-bawah-row'    // left→right, top-bottom, per baris
    | 'kanan-kiri-atas-bawah-row'    // right→left, top-bottom, per baris
    | 'kiri-kanan-bawah-atas-row'    // left→right, bottom-top, per baris
    | 'kanan-kiri-bawah-atas-row'    // right→left, bottom-top, per baris

export const TEKNIK_LABEL: Record<TeknikArah, string> = {
    // column-major baru
    'atas-bawah-kiri-kanan-col': 'Atas → Bawah, Kiri → Kanan (Kolom)',
    'atas-bawah-kanan-kiri-col': 'Atas → Bawah, Kanan → Kiri (Kolom)',
    'bawah-atas-kiri-kanan-col': 'Bawah → Atas, Kiri → Kanan (Kolom)',
    'bawah-atas-kanan-kiri-col': 'Bawah → Atas, Kanan → Kiri (Kolom)',
    // row-major baru
    'kiri-kanan-atas-bawah-row': 'Kiri → Kanan, Atas → Bawah (Baris)',
    'kanan-kiri-atas-bawah-row': 'Kanan → Kiri, Atas → Bawah (Baris)',
    'kiri-kanan-bawah-atas-row': 'Kiri → Kanan, Bawah → Atas (Baris)',
    'kanan-kiri-bawah-atas-row': 'Kanan → Kiri, Bawah → Atas (Baris)',
}

export interface DecodeTeknik {
    channel: Channel
    arah: TeknikArah
}

export interface DecodedBitItem {
    channel: Channel
    arah: TeknikArah
    bits: string
    total_bits: number
}

export interface DecodedRawItem {
    channel: Channel
    arah: TeknikArah
    text: string
    base64_encoded?: boolean
    printable_ratio: number
    total_chars: number
}

export interface BaseRecord {
    id: string
    created_at: string
    updated_at?: string
    deleted_at?: string
}
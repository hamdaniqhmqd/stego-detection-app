// types/shared.ts
export type Channel = 'R' | 'G' | 'B'

export type TeknikArah =
    | 'atas-bawah-kiri-kanan-row'      // was: col
    | 'atas-bawah-kanan-kiri-row'      // was: col
    | 'bawah-atas-kiri-kanan-row'      // was: col
    | 'bawah-atas-kanan-kiri-row'      // was: col
    | 'kiri-kanan-atas-bawah-col'      // was: row
    | 'kanan-kiri-atas-bawah-col'      // was: row
    | 'kiri-kanan-bawah-atas-col'      // was: row
    | 'kanan-kiri-bawah-atas-col'      // was: row

export const TEKNIK_LABEL: Record<TeknikArah, string> = {
    'atas-bawah-kiri-kanan-row': 'Atas → Bawah, Kiri → Kanan (Baris)',
    'atas-bawah-kanan-kiri-row': 'Atas → Bawah, Kanan → Kiri (Baris)',
    'bawah-atas-kiri-kanan-row': 'Bawah → Atas, Kiri → Kanan (Baris)',
    'bawah-atas-kanan-kiri-row': 'Bawah → Atas, Kanan → Kiri (Baris)',
    'kiri-kanan-atas-bawah-col': 'Kiri → Kanan, Atas → Bawah (Kolom)',
    'kanan-kiri-atas-bawah-col': 'Kanan → Kiri, Atas → Bawah (Kolom)',
    'kiri-kanan-bawah-atas-col': 'Kiri → Kanan, Bawah → Atas (Kolom)',
    'kanan-kiri-bawah-atas-col': 'Kanan → Kiri, Bawah → Atas (Kolom)',
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
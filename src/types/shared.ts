// types/shared.ts
export type Channel = 'R' | 'G' | 'B'

export type TeknikArah =
    | 'atas-bawah-kiri-kanan-col'
    | 'atas-bawah-kanan-kiri-col'
    | 'bawah-atas-kiri-kanan-col'
    | 'bawah-atas-kanan-kiri-col'
    | 'kiri-kanan-atas-bawah-row'
    | 'kanan-kiri-atas-bawah-row'
    | 'kiri-kanan-bawah-atas-row'
    | 'kanan-kiri-bawah-atas-row'

export const TEKNIK_LABEL: Record<TeknikArah, string> = {
    'atas-bawah-kiri-kanan-col': 'Atas → Bawah, Kiri → Kanan (Kolom)',
    'atas-bawah-kanan-kiri-col': 'Atas → Bawah, Kanan → Kiri (Kolom)',
    'bawah-atas-kiri-kanan-col': 'Bawah → Atas, Kiri → Kanan (Kolom)',
    'bawah-atas-kanan-kiri-col': 'Bawah → Atas, Kanan → Kiri (Kolom)',
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
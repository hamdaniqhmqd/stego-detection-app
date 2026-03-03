// types/shared.ts
export type Channel = 'R' | 'G' | 'B'

export type TeknikArah =
    | 'kiri-kanan-atas-bawah'
    | 'kanan-kiri-bawah-atas'
    | 'atas-bawah-kiri-kanan'
    | 'bawah-atas-kanan-kiri'

export const TEKNIK_LABEL: Record<TeknikArah, string> = {
    'kiri-kanan-atas-bawah': 'Kiri → Kanan, Atas → Bawah',
    'kanan-kiri-bawah-atas': 'Kanan → Kiri, Bawah → Atas',
    'atas-bawah-kiri-kanan': 'Atas → Bawah, Kiri → Kanan',
    'bawah-atas-kanan-kiri': 'Bawah → Atas, Kanan → Kiri',
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
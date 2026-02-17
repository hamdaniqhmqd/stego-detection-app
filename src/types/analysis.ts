// types/analysis.ts

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
    bits: string          // seluruh bit LSB sebagai string '0101...' sesuai alur ekstraksi
    total_bits: number
}

export interface DecodedRawItem {
    channel: Channel
    arah: TeknikArah
    text: string          // base64-encoded jika disimpan dari DB (lihat base64_encoded flag)
    base64_encoded?: boolean  // true jika text sudah di-encode ke base64 untuk JSONB safety
    printable_ratio: number
    total_chars: number
}

// Sesuai tabel public.analysis
export interface Analysis {
    id: string
    user_id: string
    file_path?: string
    waktu_proses?: string
    metode?: string
    teknik?: DecodeTeknik[]        // jsonb — kombinasi channel+arah yang dipilih user
    interpretasi_ai: boolean
    created_at: string
    updated_at?: string
    deleted_at?: string
}

// Sesuai tabel public.analysis_forcedecode
export interface AnalysisForceDecode {
    id: string
    analysis_id: string
    decode_teknik?: DecodeTeknik[] // jsonb — teknik yang digunakan
    decoded_bit?: DecodedBitItem[] // jsonb — semua bit LSB per kombinasi
    decoded_raw?: DecodedRawItem[] // jsonb — semua byte 0-255 per kombinasi
    waktu_proses?: string
    created_at: string
    updated_at?: string
    deleted_at?: string
}

// Sesuai tabel public.analysis_interpretasi_ai
export interface AnalysisInterpretasiAI {
    id: string
    analysis_id?: string
    analysis_forcedecode_id: string
    hasil?: HasilInterpretasi[]    // jsonb — array hasil interpretasi per kombinasi
    waktu_proses?: string
    created_at: string
    updated_at?: string
    deleted_at?: string
}

export interface HasilInterpretasi {
    channel: Channel
    arah: TeknikArah
    interpretation: string
    status_ancaman: 'Aman' | 'Mencurigakan' | 'Berbahaya' | string
}

// Payload dari API /api/upload
export interface UploadPayload {
    url: string
    name: string
    size: number
}

// Payload ke API /api/analysis
export interface CreateAnalysisPayload {
    user_id: string
    file_path: string
    metode: string
    teknik: DecodeTeknik[]
    interpretasi_ai: boolean
}

// Payload ke API /api/force-decode
export interface ForceDecodePayload {
    analysis_id: string
    image_url: string
    teknik: DecodeTeknik[]
}

// Payload ke API /api/ai-interpretation
export interface AIInterpretationPayload {
    analysis_id: string
    force_decode_id: string
    selected_items: DecodedRawItem[]   // item yang dipilih user untuk di-interpret
}

// State gabungan untuk komponen HasilAnalisis
export interface AnalysisResult {
    analysis: Analysis
    forceDecode: AnalysisForceDecode | null
    aiInterpretasi?: AnalysisInterpretasiAI
}
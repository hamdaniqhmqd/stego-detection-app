// types/forceDecode.ts
import type { BaseRecord, Channel, TeknikArah, DecodeTeknik } from './shared'

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

export interface AnalysisForceDecode extends BaseRecord {
    analysis_id: string
    decode_teknik?: DecodeTeknik[]
    waktu_proses?: string
}

export interface ForceDecodeInsert {
    analysis_id: string
    decode_teknik: DecodeTeknik[]
    waktu_proses?: string
}

export interface MethodForceDecode extends BaseRecord {
    id: string
    analysis_forcedecode_id: string
    channel: Channel
    arah: TeknikArah
    decoded_bit?: {
        bits: string
        total_bits: number
    } | null
    decoded_raw?: {
        text: string
        base64_encoded?: boolean
        printable_ratio: number
        total_chars: number
    } | null
    created_at: string
    updated_at?: string
    deleted_at?: string
}
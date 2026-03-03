// src/types/analysis.ts

import type { BaseRecord, Channel, DecodedBitItem, DecodedRawItem, DecodeTeknik, TeknikArah } from './shared'

export interface Analysis extends BaseRecord {
    id: string
    user_id: string
    file_path?: string
    waktu_proses?: string
    metode?: string
    teknik?: DecodeTeknik[]
    interpretasi_ai: boolean
    created_at: string
    updated_at?: string
    deleted_at?: string
}

export interface AnalysisInsert {
    user_id: string
    file_path: string
    metode: string
    teknik: DecodeTeknik[]
    interpretasi_ai: boolean
}

export interface AnalysisUpdate {
    file_path?: string
    metode?: string
    teknik?: DecodeTeknik[]
    interpretasi_ai?: boolean
    waktu_proses?: string
}

export interface AnalysisForceDecode {
    id: string
    analysis_id: string
    decode_teknik?: DecodeTeknik[]
    decoded_bit?: DecodedBitItem[]
    decoded_raw?: DecodedRawItem[]
    waktu_proses?: string
    created_at: string
    updated_at?: string
    deleted_at?: string
}

// ── Token Usage Types ──────────────────────────────────────────

/** Pemakaian token per satu item (channel × arah) */
export interface PerItemTokenUsage {
    channel: string
    arah: string
    prompt_tokens: number
    candidates_tokens: number
    total_tokens: number
}

/** Summary token usage untuk seluruh sesi interpretasi */
export interface TokenUsageSummary {
    gemini_token_id: string
    gemini_token_label: string
    total_prompt_tokens: number
    total_candidates_tokens: number
    total_tokens: number
    per_item: PerItemTokenUsage[]
}

// ── Analysis Interpretasi AI ───────────────────────────────────

export interface AnalysisInterpretasiAI {
    id: string
    analysis_id?: string
    analysis_forcedecode_id: string
    hasil?: HasilInterpretasi[]
    waktu_proses?: string
    gemini_token_id?: string | null
    token_usage?: TokenUsageSummary | null
    created_at: string
    updated_at?: string
    deleted_at?: string
}

export interface HasilInterpretasi {
    channel: Channel
    arah: TeknikArah
    interpretation: string
    status_ancaman: 'Aman' | 'Mencurigakan' | 'Berbahaya'
}

export interface UploadPayload {
    url: string
    name: string
    size: number
}

export interface CreateAnalysisPayload {
    user_id: string
    file_path: string
    metode: string
    teknik: DecodeTeknik[]
    interpretasi_ai: boolean
}

export interface ForceDecodePayload {
    analysis_id: string
    image_url: string
    teknik: DecodeTeknik[]
}

export interface AIInterpretationPayload {
    analysis_id: string
    force_decode_id: string
    selected_items: DecodedRawItem[]
}

export interface AnalysisResult {
    analysis: Analysis
    forceDecode: AnalysisForceDecode | null
    aiInterpretasi?: AnalysisInterpretasiAI
}
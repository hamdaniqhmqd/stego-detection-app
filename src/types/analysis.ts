// src/types/analysis.ts

import { MethodForceDecode } from './forceDecode'
import { TokenUsageSummary } from './GeminiToken'
import type { BaseRecord, Channel, DecodeTeknik, TeknikArah } from './shared'

export interface Analysis extends BaseRecord {
    id: string
    user_id: string
    file_path?: string
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
}

export interface AnalysisForceDecode {
    id: string
    analysis_id: string
    decode_teknik?: DecodeTeknik[]
    waktu_proses?: string
    created_at: string
    updated_at?: string
    deleted_at?: string
}

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

export interface AnalysisResult {
    analysis: Analysis
    forceDecode: AnalysisForceDecode | null
    methodForceDecodes?: MethodForceDecode[]
    aiInterpretasi?: AnalysisInterpretasiAI
}
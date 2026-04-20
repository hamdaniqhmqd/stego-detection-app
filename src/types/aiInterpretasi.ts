// types/aiInterpretasi.ts
import { GeminiTokenRecord, GeminiUsage, TokenUsageSummary } from './GeminiToken'
import type { BaseRecord, Channel, DecodedRawItem, TeknikArah } from './shared'

export type StatusAncaman = 'Aman' | 'Mencurigakan' | 'Berbahaya'

export interface AIInterpretationPayload {
    analysis_id: string
    force_decode_id: string
    selected_items: DecodedRawItem[]
}

export interface HasilInterpretasi {
    channel: Channel
    arah: TeknikArah
    interpretation: string
    status_ancaman: StatusAncaman
}

export interface AnalysisInterpretasiAI extends BaseRecord {
    analysis_id?: string
    analysis_forcedecode_id: string
    hasil?: HasilInterpretasi[]
    waktu_proses?: string
    gemini_token_id?: string | null
    token_usage?: TokenUsageSummary | null
}

export interface InterpretasiInsert {
    analysis_id: string
    analysis_forcedecode_id: string
    hasil: HasilInterpretasi[]
    waktu_proses?: string
    gemini_token_id?: string
    token_usage?: TokenUsageSummary
}

export interface InterpretResult {
    text: string
    usage: GeminiUsage | null
    tokenRecord: GeminiTokenRecord
}
// types/aiInterpretasi.ts
import type { BaseRecord as BR, Channel as Ch, TeknikArah as TA } from './shared'
import type { TokenUsageSummary } from './analysis'

export type StatusAncaman = 'Aman' | 'Mencurigakan' | 'Berbahaya'

export interface HasilInterpretasi {
    channel: Ch
    arah: TA
    interpretation: string
    status_ancaman: StatusAncaman
}

export interface AnalysisInterpretasiAI extends BR {
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
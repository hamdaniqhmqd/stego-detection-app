// types/GeminiToken.ts

export interface GeminiToken {
    id: string
    label: string
    api_key: string
    description?: string | null
    is_active: boolean
    is_default: boolean
    usage_count: number
    quota_limit?: number | null
    last_used_at?: string | null
    error_count: number
    last_error?: string | null
    last_error_at?: string | null
    created_by?: string | null
    created_at: string
    updated_at: string
    deleted_at?: string | null
}

export interface CreateGeminiTokenPayload {
    label: string
    api_key: string
    description?: string
    is_active?: boolean
    is_default?: boolean
    quota_limit?: number | null
}

export interface UpdateGeminiTokenPayload {
    label?: string
    api_key?: string
    description?: string | null
    is_active?: boolean
    is_default?: boolean
    quota_limit?: number | null
}


export interface PerItemTokenUsage {
    channel: string
    arah: string
    prompt_tokens: number
    candidates_tokens: number
    total_tokens: number
}

export interface TokenUsageSummary {
    gemini_token_id: string
    gemini_token_label: string
    total_prompt_tokens: number
    total_candidates_tokens: number
    total_tokens: number
    per_item: PerItemTokenUsage[]
}

export interface GeminiUsage {
    promptTokenCount: number
    candidatesTokenCount: number
    totalTokenCount: number
}

export interface GeminiTokenRecord {
    id: string
    api_key: string
    label: string
}
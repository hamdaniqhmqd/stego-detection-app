// types/GeminiToken.ts

export interface GeminiToken {
    id: string

    // Identitas
    label: string
    api_key: string
    description?: string | null

    // Status
    is_active: boolean
    is_default: boolean

    // Pemakaian
    usage_count: number
    quota_limit?: number | null
    last_used_at?: string | null

    // Error tracking
    error_count: number
    last_error?: string | null
    last_error_at?: string | null

    // Metadata
    created_by?: string | null
    created_at: string
    updated_at: string
    deleted_at?: string | null
}

/** Payload untuk membuat token baru */
export interface CreateGeminiTokenPayload {
    label: string
    api_key: string
    description?: string
    is_active?: boolean
    is_default?: boolean
    quota_limit?: number | null
}

/** Payload untuk update token */
export interface UpdateGeminiTokenPayload {
    label?: string
    api_key?: string
    description?: string | null
    is_active?: boolean
    is_default?: boolean
    quota_limit?: number | null
}
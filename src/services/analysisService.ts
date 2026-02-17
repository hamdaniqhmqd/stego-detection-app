// services/analysisService.ts

import { supabaseServer } from '@/libs/supabase/server'
import type { CreateAnalysisPayload } from '@/types/analysis'

export async function createAnalysis(payload: CreateAnalysisPayload) {
    const { data, error } = await supabaseServer
        .from('analysis')
        .insert({
            user_id: payload.user_id,
            file_path: payload.file_path,
            metode: payload.metode,
            teknik: payload.teknik,
            interpretasi_ai: payload.interpretasi_ai,
        })
        .select()
        .single()

    if (error) throw error
    return data
}
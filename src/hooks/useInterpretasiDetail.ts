// hooks/useInterpretasiDetail.ts

import { useState, useEffect, useCallback } from 'react'
import supabaseAnonKey from '@/libs/supabase/anon_key'
import type { AnalysisInterpretasiAI, Analysis, AnalysisForceDecode } from '@/types/analysis'
import type { User } from '@/types/Users'

export interface InterpretasiDetailResult {
    interpretasi: AnalysisInterpretasiAI
    analysis: Analysis | null
    forceDecode: AnalysisForceDecode | null
    user: User | null
}

interface UseInterpretasiDetailState {
    result: InterpretasiDetailResult | null
    isLoading: boolean
    error: string | null
}

export function useInterpretasiDetail(id: string): UseInterpretasiDetailState & { refresh: () => Promise<void> } {
    const [state, setState] = useState<UseInterpretasiDetailState>({
        result: null,
        isLoading: true,
        error: null,
    })

    const fetch = useCallback(async () => {
        if (!id) return
        setState(s => ({ ...s, isLoading: true, error: null }))

        try {
            // 1. Fetch interpretasi
            const { data: interpretasi, error: iErr } = await supabaseAnonKey
                .from('analysis_interpretasi_ai')
                .select('*')
                .eq('id', id)
                .single()
            if (iErr) throw new Error(iErr.message)
            if (!interpretasi) throw new Error('Data interpretasi tidak ditemukan')

            const interp = interpretasi as AnalysisInterpretasiAI

            // 2. Fetch analysis (untuk metode, teknik, file_path, user_id)
            let analysis: Analysis | null = null
            if (interp.analysis_id) {
                const { data: a } = await supabaseAnonKey
                    .from('analysis')
                    .select('*')
                    .eq('id', interp.analysis_id)
                    .single()
                analysis = (a as Analysis) ?? null
            }

            // 3. Fetch force decode (untuk waktu_proses decode, decode_teknik)
            let forceDecode: AnalysisForceDecode | null = null
            if (interp.analysis_forcedecode_id) {
                const { data: fd } = await supabaseAnonKey
                    .from('analysis_forcedecode')
                    .select('id, analysis_id, decode_teknik, waktu_proses, created_at, updated_at, deleted_at')
                    .eq('id', interp.analysis_forcedecode_id)
                    .single()
                forceDecode = (fd as AnalysisForceDecode) ?? null
            }

            // 4. Fetch user (via analysis.user_id)
            let user: User | null = null
            if (analysis?.user_id) {
                const { data: u } = await supabaseAnonKey
                    .from('users')
                    .select('id, username, fullname, email, photo, role, is_verified, created_at')
                    .eq('id', analysis.user_id)
                    .single()
                user = (u as User) ?? null
            }

            setState({
                result: { interpretasi: interp, analysis, forceDecode, user },
                isLoading: false,
                error: null,
            })
        } catch (err: any) {
            setState({ result: null, isLoading: false, error: err.message })
        }
    }, [id])

    useEffect(() => { fetch() }, [fetch])

    return { ...state, refresh: fetch }
}
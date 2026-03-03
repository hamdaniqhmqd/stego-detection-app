// src/hooks/useAnalysisDetail.ts
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAnalysis } from './useAnalysis'
import type { AnalysisResult } from '@/types/analysis'

interface UseAnalysisDetailState {
    result: AnalysisResult | null
    isLoading: boolean
    error: string | null
}

export interface UseAnalysisDetailReturn extends UseAnalysisDetailState {
    refresh: () => Promise<void>
}

export function useAnalysisDetail(id: string | null | undefined): UseAnalysisDetailReturn {
    const { getById } = useAnalysis()

    const [state, setState] = useState<UseAnalysisDetailState>({
        result: null,
        isLoading: true,
        error: null,
    })

    const fetch = useCallback(async () => {
        if (!id) {
            setState({ result: null, isLoading: false, error: null })
            return
        }
        setState(s => ({ ...s, isLoading: true, error: null }))
        try {
            const result = await getById(id)
            setState({ result, isLoading: false, error: null })
        } catch (err: any) {
            setState({ result: null, isLoading: false, error: err.message })
        }
    }, [id, getById])

    useEffect(() => { fetch() }, [fetch])

    return { ...state, refresh: fetch }
}
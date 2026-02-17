// hooks/useAnalisisDetail.ts

import { useState, useEffect } from 'react'
import type { AnalysisResult } from '@/types/analysis'

interface UseAnalisisDetailReturn {
    data: AnalysisResult | null
    isLoading: boolean
    error: string | null
}

export function useAnalisisDetail(id: string): UseAnalisisDetailReturn {
    console.log('useAnalisisDetail id:', id)
    const [data, setData] = useState<AnalysisResult | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!id) return

        const fetchDetail = async () => {
            setIsLoading(true)
            setError(null)

            try {
                const res = await fetch(`/api/analysis/${id}`)
                if (!res.ok) {
                    const err = await res.json()
                    throw new Error(err.error ?? 'Gagal mengambil data analisis')
                }
                const json = await res.json()
                setData(json)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setIsLoading(false)
            }
        }

        fetchDetail()
    }, [id])

    return { data, isLoading, error }
}
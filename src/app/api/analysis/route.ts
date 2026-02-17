// api/analysis/route.ts

import { NextResponse } from 'next/server'
import { createAnalysis } from '@/services/analysisService'
import type { CreateAnalysisPayload } from '@/types/analysis'

export async function POST(req: Request) {
    try {
        const body: CreateAnalysisPayload = await req.json()
        const analysis = await createAnalysis(body)
        return NextResponse.json(analysis)
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
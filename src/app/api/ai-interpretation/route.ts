// api/ai-interpretation/route.ts

import { NextResponse } from 'next/server'
import { processAIInterpretation } from '@/services/aiService'
import type { AIInterpretationPayload } from '@/types/analysis'

export async function POST(req: Request) {
    try {
        const body: AIInterpretationPayload = await req.json()
        const result = await processAIInterpretation(
            body.analysis_id,
            body.force_decode_id,
            body.selected_items
        )
        return NextResponse.json(result)
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
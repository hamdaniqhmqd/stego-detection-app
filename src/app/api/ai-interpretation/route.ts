// api/ai-interpretation/route.ts
import { NextResponse } from 'next/server'
import { processAIInterpretation } from '@/services/aiService'

export async function POST(req: Request) {
    const body = await req.json()
    const result = await processAIInterpretation(
        body.force_decode_id,
        body.decoded_raw
    )

    return NextResponse.json({ interpretation: result })
}

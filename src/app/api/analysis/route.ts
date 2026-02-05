import { NextResponse } from 'next/server'
import { createAnalysis } from '@/services/analysisService'

export async function POST(req: Request) {
    const body = await req.json()
    const analysis = await createAnalysis(
        body.url,
        body.name,
        body.size
    )

    return NextResponse.json(analysis)
}

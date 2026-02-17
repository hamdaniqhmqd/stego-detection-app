// api/force-decode/route.ts

import { NextResponse } from 'next/server'
import { processForceDecode } from '@/services/forceDecodeService'
import type { ForceDecodePayload } from '@/types/analysis'

export async function POST(req: Request) {
    try {
        const body: ForceDecodePayload = await req.json()
        const result = await processForceDecode(
            body.analysis_id,
            body.image_url,
            body.teknik
        )
        return NextResponse.json(result)
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
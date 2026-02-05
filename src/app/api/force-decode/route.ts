import { NextResponse } from 'next/server'
import { processForceDecode } from '@/services/forceDecodeService'

export async function POST(req: Request) {
    const body = await req.json()
    const result = await processForceDecode(
        body.analysis_id,
        body.image_url
    )

    return NextResponse.json(result)
}

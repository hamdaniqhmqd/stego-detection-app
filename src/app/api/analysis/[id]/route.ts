// api/analysis/[id]/route.ts

import { NextResponse } from 'next/server'
import { supabaseServer } from '@/libs/supabase/server'

export async function GET(
    _req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        // ✅ unwrap params (WAJIB di Next 16)
        const { id } = await context.params
        console.log('id:', id)

        // 1️⃣ Fetch record analysis
        const { data: analysis, error: analysisError } = await supabaseServer
            .from('analysis')
            .select('*')
            .eq('id', id)
            .single()

        if (analysisError) throw analysisError
        if (!analysis) {
            return NextResponse.json(
                { error: 'Analisis tidak ditemukan' },
                { status: 404 }
            )
        }

        // 2️⃣ Fetch force decode
        const { data: forceDecode, error: forceError } = await supabaseServer
            .from('analysis_forcedecode')
            .select('*')
            .eq('analysis_id', id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (forceError) throw forceError

        // 3️⃣ Fetch AI interpretation (optional)
        let aiInterpretasi = undefined

        if (forceDecode) {
            const { data: ai, error: aiError } = await supabaseServer
                .from('analysis_interpretasi_ai')
                .select('*')
                .eq('analysis_forcedecode_id', forceDecode.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle()

            if (aiError) throw aiError
            aiInterpretasi = ai ?? undefined
        }

        return NextResponse.json({
            analysis,
            forceDecode: forceDecode ?? null,
            aiInterpretasi,
        })

    } catch (err: any) {
        return NextResponse.json(
            { error: err.message },
            { status: 500 }
        )
    }
}
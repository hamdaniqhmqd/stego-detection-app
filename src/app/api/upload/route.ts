// api/upload/route.ts

import { supabaseServer } from '@/libs/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 })
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'Ukuran file melebihi 5MB' }, { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const filePath = `stego/${Date.now()}-${file.name}`

        const { error: uploadError } = await supabaseServer.storage
            .from('stego-images')
            .upload(filePath, buffer, { contentType: file.type })

        if (uploadError) throw uploadError

        const { data } = supabaseServer.storage
            .from('stego-images')
            .getPublicUrl(filePath)

        return NextResponse.json({
            url: data.publicUrl,
            name: file.name,
            size: file.size,
        })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
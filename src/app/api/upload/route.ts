import { supabaseServer } from '@/libs/supabase/server' // ← UBAH INI
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    const formData = await req.formData()
    const file = formData.get('file') as File

    const buffer = Buffer.from(await file.arrayBuffer())
    const filePath = `stego/${Date.now()}-${file.name}`

    await supabaseServer.storage // ← UBAH INI
        .from('stego-images')
        .upload(filePath, buffer)

    const { data } = supabaseServer.storage // ← UBAH INI
        .from('stego-images')
        .getPublicUrl(filePath)

    return NextResponse.json({
        url: data.publicUrl,
        name: file.name,
        size: file.size
    })
}
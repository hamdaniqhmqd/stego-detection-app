import { supabaseServer } from '@/libs/supabase/server' // ← HARUS INI, BUKAN client!

export async function createAnalysis(
    imageUrl: string,
    name: string,
    size: number
) {
    console.log('🔍 Creating analysis with:', { imageUrl, name, size })

    const { data, error } = await supabaseServer
        .from('analysis')
        .insert({
            image_url: imageUrl,
            image_name: name,
            image_size: size,
            status: 'uploaded'
        })
        .select()
        .single()

    if (error) {
        console.error('❌ Analysis creation error:', error)
        throw error
    }

    console.log('✅ Analysis created:', data)
    return data
}
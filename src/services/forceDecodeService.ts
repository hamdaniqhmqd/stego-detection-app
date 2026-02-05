import { supabaseServer } from '@/libs/supabase/server' // ← UBAH INI
import { forceDecodeLSB } from '@/libs/steganalysis/forceDecode'

export async function processForceDecode(
    analysisId: string,
    imageUrl: string
) {
    const imageRes = await fetch(imageUrl)
    const buffer = Buffer.from(await imageRes.arrayBuffer())

    const decoded = await forceDecodeLSB(buffer)

    const { data, error } = await supabaseServer // ← UBAH INI
        .from('analysis_forcedecode')
        .insert({
            analysis_id: analysisId,
            decoded_raw: decoded
        })
        .select()
        .single()

    if (error) throw error
    return data
}
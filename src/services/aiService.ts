import { supabaseServer } from '@/libs/supabase/server'
import { interpretWithAI } from '@/libs/ai/interpret'

export async function processAIInterpretation(
    forceDecodeId: string,
    decodedText: string
) {
    try {
        // console.log('🔄 Processing AI interpretation...')
        // console.log('Force decode ID:', forceDecodeId)
        // console.log('Text preview:', decodedText)

        // Skip AI if no meaningful text
        if (!decodedText || decodedText.trim().length < 10) {
            const fallback = 'Tidak ada data tersembunyi yang terdeteksi atau data terlalu pendek untuk dianalisis.'

            await supabaseServer
                .from('analysis_forcedecode')
                .update({ ai_interpretation: fallback })
                .eq('id', forceDecodeId)

            return fallback
        }

        // Call AI
        const interpretation = await interpretWithAI(decodedText)
        // console.log('✅ AI interpretation received:', interpretation)

        // Save to database
        const { error } = await supabaseServer
            .from('analysis_forcedecode')
            .update({ ai_interpretation: interpretation })
            .eq('id', forceDecodeId)

        if (error) {
            // console.error('❌ Database update error:', error)
            throw error
        }

        // console.log('💾 Interpretation saved to database')
        return interpretation

    } catch (error: any) {
        // console.error('❌ AI service error:', error)

        // Save error to database instead of throwing
        const errorMsg = `Gagal melakukan interpretasi AI: ${error.message}`

        await supabaseServer
            .from('analysis_forcedecode')
            .update({ ai_interpretation: errorMsg })
            .eq('id', forceDecodeId)

        return errorMsg
    }
}
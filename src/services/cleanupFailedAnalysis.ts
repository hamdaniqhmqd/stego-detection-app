// services/cleanupFailedAnalysis.ts

'use server'

import supabaseAnonKey from '@/libs/supabase/anon_key'
import { deleteUploadedImage } from './uploadImage'

export async function cleanupFailedAnalysis(
    analysisId: string | null,
    imageUrl?: string | null
) {
    try {
        if (analysisId) {
            const { data: fds } = await supabaseAnonKey
                .from('analysis_forcedecode')
                .select('id')
                .eq('analysis_id', analysisId)

            const fdIds = (fds ?? []).map((f) => f.id)

            if (fdIds.length > 0) {
                await supabaseAnonKey
                    .from('analysis_interpretasi_ai')
                    .delete()
                    .in('analysis_forcedecode_id', fdIds)

                await supabaseAnonKey
                    .from('method_forcedecode')
                    .delete()
                    .in('analysis_forcedecode_id', fdIds)

                await supabaseAnonKey
                    .from('analysis_forcedecode')
                    .delete()
                    .in('id', fdIds)
            }

            await supabaseAnonKey
                .from('analysis')
                .delete()
                .eq('id', analysisId)
        }

        if (imageUrl) {
            await deleteUploadedImage(imageUrl)
        }
    } catch (cleanupErr: any) {
        // Jangan throw ulang — cukup log, supaya error ASLI (penyebab kegagalan
        // proses) yang tetap ditampilkan ke user, bukan error dari cleanup ini.
        console.error('[cleanupFailedAnalysis] Gagal membersihkan data:', cleanupErr.message)
    }
}
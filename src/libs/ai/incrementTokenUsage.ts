// libs/ai/incrementTokenUsage.ts

import { getWaktuWIB } from "@/utils/format"
import { supabaseServer } from "../supabase/server"

export async function incrementTokenUsage(
    tokenId: string,
    tokensUsed: number
): Promise<void> {
    // Gunakan RPC untuk atomic increment agar tidak race condition
    const { error } = await supabaseServer.rpc('increment_gemini_token_usage', {
        p_token_id: tokenId,
        p_tokens_used: tokensUsed,
    })

    // Jika RPC belum dibuat, fallback ke manual fetch + update
    if (error) {
        const { data: current } = await supabaseServer
            .from('gemini_tokens')
            .select('usage_count')
            .eq('id', tokenId)
            .single()

        await supabaseServer
            .from('gemini_tokens')
            .update({
                usage_count: (current?.usage_count ?? 0) + tokensUsed,
                last_used_at: getWaktuWIB().toISOString(),
            })
            .eq('id', tokenId)
    }
}
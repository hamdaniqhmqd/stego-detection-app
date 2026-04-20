// libs/ai/recordTokenError.ts

import { getWaktuWIB } from "@/utils/format"
import { supabaseServer } from "../supabase/server"

export async function recordTokenError(
    tokenId: string,
    errorMessage: string
): Promise<void> {
    const { data: current } = await supabaseServer
        .from('gemini_tokens')
        .select('error_count')
        .eq('id', tokenId)
        .single()

    await supabaseServer
        .from('gemini_tokens')
        .update({
            error_count: (current?.error_count ?? 0) + 1,
            last_error: errorMessage.slice(0, 500), // truncate agar tidak meluap
            last_error_at: getWaktuWIB().toISOString(),
        })
        .eq('id', tokenId)
}
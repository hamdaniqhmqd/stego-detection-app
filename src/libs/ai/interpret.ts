// libs/ai/interpret.ts

import { GeminiTokenRecord, GeminiUsage } from '@/types/GeminiToken'
import { buildPrompt } from './prompt'
import { InterpretResult } from '@/types/aiInterpretasi'
import { recordTokenError } from './recordTokenError'
import { incrementTokenUsage } from './incrementTokenUsage'

export const runtime = 'nodejs'

export async function interpretWithAI(
    text: string,
    token: GeminiTokenRecord
): Promise<InterpretResult> {
    try {
        const response = await fetch(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': token.api_key,
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: 'user',
                            parts: [{ text: buildPrompt(text) }],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.3,
                    },
                }),
            }
        )

        if (!response.ok) {
            const errorText = await response.text()
            const msg = `Gemini API failed: ${response.status} - ${errorText}`

            // Catat error ke DB (fire-and-forget, jangan block proses)
            recordTokenError(token.id, msg).catch(() => { })

            throw new Error(msg)
        }

        const data = await response.json()

        const interpretationText: string =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

        // Ambil usageMetadata dari response Gemini
        const usageMeta = data?.usageMetadata ?? null
        const usage: GeminiUsage | null = usageMeta
            ? {
                promptTokenCount: usageMeta.promptTokenCount ?? 0,
                candidatesTokenCount: usageMeta.candidatesTokenCount ?? 0,
                totalTokenCount: usageMeta.totalTokenCount ?? 0,
            }
            : null

        // Update usage_count di DB secara per-request (fire-and-forget)
        if (usage && usage.totalTokenCount > 0) {
            incrementTokenUsage(token.id, usage.totalTokenCount).catch(() => { })
        }

        return {
            text: interpretationText || 'AI tidak menemukan interpretasi',
            usage,
            tokenRecord: token,
        }
    } catch (error: any) {
        return {
            text: `AI interpretation failed: ${error.message}`,
            usage: null,
            tokenRecord: token,
        }
    }
}
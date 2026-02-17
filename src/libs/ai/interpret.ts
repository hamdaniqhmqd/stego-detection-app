// libs/ai/interpret.ts

import { buildPrompt } from './prompt'

export const runtime = 'nodejs'

export async function interpretWithAI(text: string): Promise<string> {
    try {
        const response = await fetch(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': process.env.GEMINI_API_KEY!,
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
            throw new Error(`Gemini API failed: ${response.status} - ${errorText}`)
        }

        const data = await response.json()

        const interpretation =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

        return interpretation || 'AI tidak menemukan interpretasi'
    } catch (error: any) {
        return `AI interpretation failed: ${error.message}`
    }
}
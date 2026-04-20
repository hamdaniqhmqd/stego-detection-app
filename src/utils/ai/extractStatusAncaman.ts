// src/utils/ai/extractStatusAncaman.ts

import { HasilInterpretasi } from "@/types/aiInterpretasi"

export function extractStatusAncaman(
    text: string
): HasilInterpretasi['status_ancaman'] {
    if (!text) return 'Aman'

    // Normalisasi untuk matching (case-insensitive)
    const normalizedText = text.toLowerCase()

    // Cari line yang spesifik mengandung "Status Ancaman"
    const statusLineMatch = normalizedText.match(
        /status\s+ancaman\s*[:：]\s*([^\n/,。.;；]+)/
    )

    if (statusLineMatch) {
        const value = statusLineMatch[1].trim()

        if (value.includes('mencurigakan')) return 'Mencurigakan'
        if (value.includes('berbahaya')) return 'Berbahaya'
        if (value.includes('aman')) return 'Aman'
    }

    // Cari pattern umum untuk status/threat/ancaman keywords
    const valueMatch = text.match(
        /(?:status\s+ancaman|threat|ancaman|level)\s*[:：]\s*([^,\n.;；]+)/i
    )
    if (valueMatch) {
        const value = valueMatch[1].toLowerCase().trim()
        if (value.includes('mencurigakan')) return 'Mencurigakan'
        if (value.includes('berbahaya')) return 'Berbahaya'
        if (value.includes('aman')) return 'Aman'
    }

    // Fallback - cari keyword status di seluruh teks
    if (normalizedText.includes('berbahaya')) return 'Berbahaya'
    if (normalizedText.includes('mencurigakan')) return 'Mencurigakan'
    if (normalizedText.includes('aman')) return 'Aman'

    // Default jika sama sekali tidak ditemukan
    return 'Aman'
}
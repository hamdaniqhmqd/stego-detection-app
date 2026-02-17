// src/utils/Decode.ts

import { DecodedRawItem } from "@/types/analysis"

export function decodeRawText(item: DecodedRawItem): string {
    if (!item.base64_encoded) return item.text
    try {
        // atob decode base64 → binary string (char codes 0–255)
        return atob(item.text)
    } catch {
        return item.text
    }
}


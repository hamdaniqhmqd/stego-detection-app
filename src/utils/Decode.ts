// src/utils/Decode.ts

import { DecodedRawItem } from "@/types/shared"

export function decodeRawText(item: DecodedRawItem): string {
    if (!item.base64_encoded) return item.text
    try {
        return atob(item.text)
    } catch {
        return item.text
    }
}
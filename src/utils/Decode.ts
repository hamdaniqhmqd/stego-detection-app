// src/utils/Decode.ts

import { DecodedRawItem } from "@/types/shared"

export function decodeRawText(item: DecodedRawItem): string {
    if (!item.base64_encoded) return item.text
    try {
        return atob(item.text)
    } catch {
        return item.text
    }
    // return item.text
}

export function decodeItemText(item: DecodedRawItem): string {
    if (!item.base64_encoded) return item.text
    try {
        return Buffer.from(item.text, 'base64').toString('binary')
    } catch {
        return item.text
    }
    // return item.text
}
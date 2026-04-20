import { MethodForceDecode } from "@/types/forceDecode"
import { DecodedBitItem, DecodedRawItem } from "@/types/shared"

export function methodToRawItem(m: MethodForceDecode): DecodedRawItem | null {
    if (!m.decoded_raw) return null
    return {
        channel: m.channel,
        arah: m.arah,
        text: m.decoded_raw.text,
        base64_encoded: m.decoded_raw.base64_encoded,
        printable_ratio: m.decoded_raw.printable_ratio,
        total_chars: m.decoded_raw.total_chars,
    }
}

export function methodToBitItem(m: MethodForceDecode): DecodedBitItem | null {
    if (!m.decoded_bit) return null
    return {
        channel: m.channel,
        arah: m.arah,
        bits: m.decoded_bit.bits,
        total_bits: m.decoded_bit.total_bits,
    }
}
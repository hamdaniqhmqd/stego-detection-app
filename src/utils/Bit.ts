// src/utils/Bit.ts

// Preview bit string: ambil N karakter pertama, format per 8 bit
export function formatBitPreview(bits: string, charCount: number): string {
    const slice = bits.slice(0, charCount)
    // kelompokkan per 8 bit dengan spasi
    return slice.replace(/(.{8})/g, '$1 ').trimEnd()
}
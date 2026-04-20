// utils/forceDecode/bitsToFullText.ts

export function bitsToFullText(bits: string): string {
    let result = ''
    for (let i = 0; i + 8 <= bits.length; i += 8) {
        result += String.fromCharCode(parseInt(bits.slice(i, i + 8), 2))
    }
    return result
}

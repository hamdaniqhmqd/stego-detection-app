// src/utils/forceDecode/calculatePrintableRatio.ts

export function calculatePrintableRatio(text: string): number {
    const sample = text
    if (sample.length === 0) return 0

    let printable = 0

    for (let i = 0; i < sample.length; i++) {
        const code = sample.charCodeAt(i)

        if (
            (code >= 32 && code <= 126) || // ASCII printable
            code === 9 || code === 10 || code === 13 // whitespace
        ) {
            printable++
        }
    }

    return printable / sample.length
}
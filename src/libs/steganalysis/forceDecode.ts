// libs/steganalysis/forceDecode.ts

import { Jimp } from 'jimp'
import type {
    DecodeTeknik,
    DecodedBitItem,
    DecodedRawItem,
} from '@/types/shared'
import { getPixelCoordinates } from '@/utils/forceDecode/getPixelCoordinates'
import { extractLSBChannel } from '@/utils/forceDecode/extractLSBChannel'
import { bitsToFullText } from '@/utils/forceDecode/bitsToFullText'
import { calculatePrintableRatio } from '@/utils/forceDecode/calculatePrintableRatio'

export interface ForceDecodeResult {
    decodedBit: DecodedBitItem[]
    decodedRaw: DecodedRawItem[]
}

export async function forceDecodeLSB(
    imageBuffer: Buffer,
    teknikList: DecodeTeknik[]
): Promise<ForceDecodeResult> {
    const image = await Jimp.read(imageBuffer)
    const { width, height } = image.bitmap
    // console.log('forceDecodeLSB - width, height', width, height)
    const pixelData = image.bitmap.data as unknown as Buffer

    const decodedBit: DecodedBitItem[] = []
    const decodedRaw: DecodedRawItem[] = []

    for (const { channel, arah } of teknikList) {
        // Ambil koordinat semua pixel
        const coords = getPixelCoordinates(width, height, arah)
        // console.log('forceDecodeLSB - coords', coords)

        // Ekstrak semua bit LSB sesuai urutan koordinat
        const bits = extractLSBChannel(pixelData, coords, width, channel)
        // console.log('forceDecodeLSB - bits', bits)

        // Decode semua bit ke teks ASCII
        const text = bitsToFullText(bits)
        // console.log("forceDecodeLSB - text", text)

        decodedBit.push({
            channel,
            arah,
            bits,
            total_bits: bits.length,
        })

        decodedRaw.push({
            channel,
            arah,
            text,
            printable_ratio: calculatePrintableRatio(text),
            total_chars: text.length,
        })
        // console.log("forceDecodeLSB - decodedBit", decodedBit)
        // console.log("forceDecodeLSB - decodedRaw", decodedRaw)
    }

    return { decodedBit, decodedRaw }
}
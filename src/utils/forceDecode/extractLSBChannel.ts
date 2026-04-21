// utils/forceDecode/extractLSBChannel.ts

import { PixelCoord } from "@/types/forceDecode"
import { Channel } from "@/types/shared"

export function extractLSBChannel(
    data: Buffer,
    coords: PixelCoord[],
    width: number,
    channel: Channel
): string {
    const channelOffset = channel === 'R' ? 0 : channel === 'G' ? 1 : 2
    let bits = ''

    for (const { x, y } of coords) {
        const idx = (y * width + x) * 4
        bits += (data[idx + channelOffset] & 1).toString()
        // console.log("extractLSBChannel - bits", bits)
    }

    return bits
}
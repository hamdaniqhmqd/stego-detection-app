import { Jimp } from "jimp"

export async function forceDecodeLSB(imageBuffer: Buffer): Promise<string> {
    const image = await Jimp.read(imageBuffer)

    let binary = ''

    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
        const blue = image.bitmap.data[idx + 2]
        binary += (blue & 1).toString()
    })

    let result = ''
    for (let i = 0; i < binary.length; i += 8) {
        const byte = binary.slice(i, i + 8)
        if (byte.length < 8) break

        const charCode = parseInt(byte, 2)
        if (charCode === 0) break

        result += String.fromCharCode(charCode)
    }

    return result.trim()
}

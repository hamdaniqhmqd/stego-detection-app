// src/utils/forceDecode/getPixelCoordinates.ts

import { PixelCoord } from "@/types/forceDecode"
import { TeknikArah } from "@/types/shared"

export function getPixelCoordinates(
    width: number,
    height: number,
    arah: TeknikArah
): PixelCoord[] {
    const coords: PixelCoord[] = []

    switch (arah) {
        // Atas → Bawah (y naik), Kiri → Kanan (x naik)
        case 'atas-bawah-kiri-kanan-col':
            for (let y = 0; y < height; y++)
                for (let x = 0; x < width; x++)
                    coords.push({ x, y })
            break

        // Atas → Bawah (y naik), Kanan → Kiri (x turun)
        case 'atas-bawah-kanan-kiri-col':
            for (let y = 0; y < height; y++)
                for (let x = width - 1; x >= 0; x--)
                    coords.push({ x, y })
            break

        // Bawah → Atas (y turun), Kiri → Kanan (x naik)
        case 'bawah-atas-kiri-kanan-col':
            for (let y = height - 1; y >= 0; y--)
                for (let x = 0; x < width; x++)
                    coords.push({ x, y })
            break

        // Bawah → Atas (y turun), Kanan → Kiri (x turun)
        case 'bawah-atas-kanan-kiri-col':
            for (let y = height - 1; y >= 0; y--)
                for (let x = width - 1; x >= 0; x--)
                    coords.push({ x, y })
            break

        // Kiri → Kanan (x naik), Atas → Bawah (y naik)
        case 'kiri-kanan-atas-bawah-row':
            for (let x = 0; x < width; x++)
                for (let y = 0; y < height; y++)
                    coords.push({ x, y })
            break

        // Kanan → Kiri (x turun), Atas → Bawah (y naik)
        case 'kanan-kiri-atas-bawah-row':
            for (let x = width - 1; x >= 0; x--)
                for (let y = 0; y < height; y++)
                    coords.push({ x, y })
            break

        // Kiri → Kanan (x naik), Bawah → Atas (y turun)
        case 'kiri-kanan-bawah-atas-row':
            for (let x = 0; x < width; x++)
                for (let y = height - 1; y >= 0; y--)
                    coords.push({ x, y })
            break

        // Kanan → Kiri (x turun), Bawah → Atas (y turun)
        case 'kanan-kiri-bawah-atas-row':
            for (let x = width - 1; x >= 0; x--)
                for (let y = height - 1; y >= 0; y--)
                    coords.push({ x, y })
            break
    }

    return coords
}
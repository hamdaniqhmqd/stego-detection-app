// src/utils/Stego/decodeLSB.ts

import { Channel } from "@/types/shared";
import { DEFAULT_MARKER, StegoConfig } from "@/types/Stego";
import { generateCoordinates } from "./generateCoordinates";

export async function decodeLSB(
    imageFile: File,
    config: StegoConfig
): Promise<Record<Channel, string>> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(imageFile);

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const channelMap: Record<Channel, number> = { R: 0, G: 1, B: 2 };
            const endMarker = config.marker || DEFAULT_MARKER;
            const coords = generateCoordinates(canvas.width, canvas.height, config.traversal);
            const maxChars = Math.floor(coords.length / 8);

            const results: Partial<Record<Channel, string>> = {};
            const errors: string[] = [];

            for (const ch of config.channels) {
                const offset = channelMap[ch];
                let bitBuffer = 0;
                let bitCount = 0;
                let result = '';
                let found = false;

                for (const [x, y] of coords) {
                    const pixelIdx = (y * canvas.width + x) * 4;
                    bitBuffer = (bitBuffer << 1) | (data[pixelIdx + offset] & 1);
                    bitCount++;

                    if (bitCount === 8) {
                        result += String.fromCharCode(bitBuffer & 0xFF);
                        bitBuffer = 0;
                        bitCount = 0;

                        const checkFrom = Math.max(0, result.length - endMarker.length - 10);
                        if (result.indexOf(endMarker, checkFrom) !== -1) {
                            results[ch] = result.split(endMarker)[0];
                            found = true;
                            break;
                        }

                        if (result.length > maxChars) {
                            errors.push(`Kanal ${ch}: pesan tidak ditemukan (sudah memindai ${maxChars.toLocaleString()} karakter)`);
                            break;
                        }
                    }
                }

                if (!found && results[ch] === undefined) {
                    errors.push(`Kanal ${ch}: marker tidak ditemukan`);
                }
            }

            URL.revokeObjectURL(url);

            // Jika tidak ada satupun kanal yang berhasil, reject
            if (Object.keys(results).length === 0) {
                reject(new Error(errors.join('\n') || 'Pesan tidak ditemukan di kanal manapun'));
                return;
            }

            resolve(results as Record<Channel, string>);
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Gagal memuat gambar'));
        };
        img.src = url;
    });
}
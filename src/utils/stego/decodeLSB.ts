// src/utils/Stego/decodeLSB.ts

import { Channel } from "@/types/shared";
import { DEFAULT_MARKER, StegoConfig } from "@/types/Stego";
import { generateCoordinates } from "./generateCoordinates";

// LSB Decode
export async function decodeLSB(imageFile: File, config: StegoConfig): Promise<string> {
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

            // Batas keamanan: maksimal kapasitas penuh gambar
            const maxChars = Math.floor((coords.length * config.channels.length) / 8);

            let bitBuffer = 0;
            let bitCount = 0;
            let result = '';

            outer:
            for (const [x, y] of coords) {
                const pixelIdx = (y * canvas.width + x) * 4;
                for (const ch of config.channels) {
                    const offset = channelMap[ch];

                    bitBuffer = (bitBuffer << 1) | (data[pixelIdx + offset] & 1);
                    bitCount++;

                    if (bitCount === 8) {
                        result += String.fromCharCode(bitBuffer & 0xFF);
                        bitBuffer = 0;
                        bitCount = 0;

                        // Cek marker hanya di akhir string (efisien)
                        const checkFrom = Math.max(0, result.length - endMarker.length - 10);
                        if (result.indexOf(endMarker, checkFrom) !== -1) {
                            URL.revokeObjectURL(url);
                            resolve(result.split(endMarker)[0]);
                            break outer;
                        }

                        // Batas keamanan: sudah memindai seluruh kapasitas gambar
                        if (result.length > maxChars) {
                            URL.revokeObjectURL(url);
                            reject(new Error(
                                `Pesan tidak ditemukan (sudah memindai seluruh kapasitas gambar: ${maxChars.toLocaleString()} karakter). ` +
                                `Pastikan kanal, traversal, dan marker sudah benar.`
                            ));
                            break outer;
                        }
                    }
                }
            }

            URL.revokeObjectURL(url);
            reject(new Error('Pesan tidak ditemukan atau konfigurasi tidak cocok'));
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Gagal memuat gambar')); };
        img.src = url;
    });
}
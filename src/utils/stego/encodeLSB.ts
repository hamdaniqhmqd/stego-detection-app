// src/utils/Stego/encodeLSB.ts

import { DEFAULT_MARKER, StegoConfig } from "@/types/Stego";
import { generateCoordinates } from "./generateCoordinates";
import { Channel } from "@/types/shared";

// LSB Encode
// Setiap kanal aktif menyimpan pesan yang IDENTIK secara independen.
// Kanal R menyimpan seluruh pesan, kanal G menyimpan seluruh pesan, dst.
// Kapasitas = coords.length / 8 karakter per kanal (bukan dikali jumlah kanal).
export async function encodeLSB(imageFile: File, message: string, config: StegoConfig): Promise<string> {
    return new Promise((resolve, reject) => {
        const endMarker = config.marker || DEFAULT_MARKER;
        const fullMessage = message + endMarker;

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

            // Bangun array bit dari fullMessage (sama untuk semua kanal)
            const bits: number[] = [];
            for (let i = 0; i < fullMessage.length; i++) {
                const code = fullMessage.charCodeAt(i);
                for (let b = 7; b >= 0; b--) bits.push((code >> b) & 1);
            }

            const coords = generateCoordinates(canvas.width, canvas.height, config.traversal);
            const channelMap: Record<Channel, number> = { R: 0, G: 1, B: 2 };

            const capacityBitsPerChannel = coords.length;
            if (bits.length > capacityBitsPerChannel) {
                reject(new Error(
                    `Kapasitas gambar tidak cukup! ` +
                    `Kapasitas per kanal: ${Math.floor(capacityBitsPerChannel / 8).toLocaleString()} karakter, ` +
                    `pesan + marker: ${Math.ceil(bits.length / 8).toLocaleString()} karakter.`
                ));
                return;
            }

            // Encode: setiap kanal aktif menulis bit yang SAMA dari awal
            for (const ch of config.channels) {
                const offset = channelMap[ch];
                for (let i = 0; i < bits.length; i++) {
                    const [x, y] = coords[i];
                    const pixelIdx = (y * canvas.width + x) * 4;
                    data[pixelIdx + offset] = (data[pixelIdx + offset] & ~1) | bits[i];
                }
            }

            ctx.putImageData(imageData, 0, 0);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Gagal memuat gambar')); };
        img.src = url;
    });
}
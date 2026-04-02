// src/utils/Stego.ts

import { Channel } from "@/types/shared";

export type Mode = 'encode' | 'decode';

export interface StegoConfig {
    channels: Channel[];
    traversal: TraversalMode;
    marker: string;
}

export const DEFAULT_MARKER = '##END##';

// Traversal modes
export type TraversalMode =
    | 'top-bottom-left-right'
    | 'top-bottom-right-left'
    | 'bottom-top-left-right'
    | 'bottom-top-right-left'
    | 'spiral-cw'
    | 'spiral-ccw'
    | 'zigzag-horizontal'
    | 'zigzag-vertical'
    | 'diagonal-tl-br'
    | 'diagonal-tr-bl';

// Traversal Coordinates
export function generateCoordinates(width: number, height: number, mode: TraversalMode): [number, number][] {
    const coords: [number, number][] = [];

    switch (mode) {
        case 'top-bottom-left-right':
            for (let y = 0; y < height; y++)
                for (let x = 0; x < width; x++)
                    coords.push([x, y]);
            break;
        case 'top-bottom-right-left':
            for (let y = 0; y < height; y++)
                for (let x = width - 1; x >= 0; x--)
                    coords.push([x, y]);
            break;
        case 'bottom-top-left-right':
            for (let y = height - 1; y >= 0; y--)
                for (let x = 0; x < width; x++)
                    coords.push([x, y]);
            break;
        case 'bottom-top-right-left':
            for (let y = height - 1; y >= 0; y--)
                for (let x = width - 1; x >= 0; x--)
                    coords.push([x, y]);
            break;
        case 'spiral-cw': {
            let top = 0, bottom = height - 1, left = 0, right = width - 1;
            while (top <= bottom && left <= right) {
                for (let x = left; x <= right; x++) coords.push([x, top]);
                top++;
                for (let y = top; y <= bottom; y++) coords.push([right, y]);
                right--;
                if (top <= bottom) { for (let x = right; x >= left; x--) coords.push([x, bottom]); bottom--; }
                if (left <= right) { for (let y = bottom; y >= top; y--) coords.push([left, y]); left++; }
            }
            break;
        }
        case 'spiral-ccw': {
            let top = 0, bottom = height - 1, left = 0, right = width - 1;
            while (top <= bottom && left <= right) {
                for (let y = top; y <= bottom; y++) coords.push([left, y]);
                left++;
                for (let x = left; x <= right; x++) coords.push([x, bottom]);
                bottom--;
                if (left <= right) { for (let y = bottom; y >= top; y--) coords.push([right, y]); right--; }
                if (top <= bottom) { for (let x = right; x >= left; x--) coords.push([x, top]); top++; }
            }
            break;
        }
        case 'zigzag-horizontal':
            for (let y = 0; y < height; y++) {
                if (y % 2 === 0) for (let x = 0; x < width; x++) coords.push([x, y]);
                else for (let x = width - 1; x >= 0; x--) coords.push([x, y]);
            }
            break;
        case 'zigzag-vertical':
            for (let x = 0; x < width; x++) {
                if (x % 2 === 0) for (let y = 0; y < height; y++) coords.push([x, y]);
                else for (let y = height - 1; y >= 0; y--) coords.push([x, y]);
            }
            break;
        case 'diagonal-tl-br':
            for (let d = 0; d < width + height - 1; d++)
                for (let x = 0; x <= d; x++) { const y = d - x; if (x < width && y < height) coords.push([x, y]); }
            break;
        case 'diagonal-tr-bl':
            for (let d = 0; d < width + height - 1; d++)
                for (let x = width - 1; x >= 0; x--) { const y = d - (width - 1 - x); if (y >= 0 && y < height) coords.push([x, y]); }
            break;
    }

    return coords;
}

// LSB Encode
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

            const bits: number[] = [];
            for (let i = 0; i < fullMessage.length; i++) {
                const code = fullMessage.charCodeAt(i);
                for (let b = 7; b >= 0; b--) bits.push((code >> b) & 1);
            }

            const coords = generateCoordinates(canvas.width, canvas.height, config.traversal);
            const channelMap: Record<Channel, number> = { R: 0, G: 1, B: 2 };

            // Validasi: Kapasitas gambar (bits) harus cukup untuk menampung pesan + marker
            const capacityBits = coords.length * config.channels.length;
            if (bits.length > capacityBits) {
                reject(new Error(
                    `Kapasitas gambar tidak cukup! ` +
                    `Kapasitas: ${Math.floor(capacityBits / 8).toLocaleString()} karakter, ` +
                    `pesan + marker: ${Math.ceil(bits.length / 8).toLocaleString()} karakter.`
                ));
                return;
            }

            let bitIdx = 0;
            outer:
            for (const [x, y] of coords) {
                const pixelIdx = (y * canvas.width + x) * 4;
                for (const ch of config.channels) {
                    if (bitIdx >= bits.length) break outer;
                    const offset = channelMap[ch];
                    data[pixelIdx + offset] = (data[pixelIdx + offset] & ~1) | bits[bitIdx++];
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

// Constants
export const TRAVERSAL_OPTIONS: { value: TraversalMode; label: string; icon: string }[] = [
    { value: 'top-bottom-left-right', label: 'Atas→Bawah, Kiri→Kanan', icon: '↓→' },
    { value: 'top-bottom-right-left', label: 'Atas→Bawah, Kanan→Kiri', icon: '↓←' },
    { value: 'bottom-top-left-right', label: 'Bawah→Atas, Kiri→Kanan', icon: '↑→' },
    { value: 'bottom-top-right-left', label: 'Bawah→Atas, Kanan→Kiri', icon: '↑←' },
    { value: 'spiral-cw', label: 'Spiral Searah Jarum Jam', icon: '↻' },
    { value: 'spiral-ccw', label: 'Spiral Berlawanan Jarum Jam', icon: '↺' },
    { value: 'zigzag-horizontal', label: 'Zig-Zag Horizontal', icon: '≋' },
    { value: 'zigzag-vertical', label: 'Zig-Zag Vertikal', icon: '⋮' },
    { value: 'diagonal-tl-br', label: 'Diagonal ↘ (Kiri Atas)', icon: '↘' },
    { value: 'diagonal-tr-bl', label: 'Diagonal ↙ (Kanan Atas)', icon: '↙' },
];

// ChannelInfo
export const CHANNEL_INFO: Record<Channel, { label: string; activeText: string; activeBorder: string; activeBg: string; dot: string; inactiveDot: string }> = {
    R: { label: 'Red', activeText: 'text-red-400', activeBorder: 'border-red-500', activeBg: 'bg-red-500/10', dot: 'bg-red-400', inactiveDot: 'bg-white/10' },
    G: { label: 'Green', activeText: 'text-green-400', activeBorder: 'border-green-500', activeBg: 'bg-green-500/10', dot: 'bg-green-400', inactiveDot: 'bg-white/10' },
    B: { label: 'Blue', activeText: 'text-blue-400', activeBorder: 'border-blue-500', activeBg: 'bg-blue-500/10', dot: 'bg-blue-400', inactiveDot: 'bg-white/10' },
};
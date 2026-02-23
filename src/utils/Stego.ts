// src/utils/Stego.ts

import { Channel } from "@/types/analysis";

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

            const endMarker = config.marker || DEFAULT_MARKER;
            const fullMessage = message + endMarker;
            const bits: number[] = [];
            for (const char of fullMessage) {
                const code = char.charCodeAt(0);
                for (let b = 7; b >= 0; b--) bits.push((code >> b) & 1);
            }

            const coords = generateCoordinates(canvas.width, canvas.height, config.traversal);
            const channelMap = { R: 0, G: 1, B: 2 };

            const capacity = coords.length * config.channels.length;
            if (bits.length > capacity) {
                reject(new Error(`Pesan terlalu panjang! Kapasitas: ${Math.floor(capacity / 8)} karakter`));
                return;
            }

            let bitIdx = 0;
            for (const [x, y] of coords) {
                if (bitIdx >= bits.length) break;
                const pixelIdx = (y * canvas.width + x) * 4;
                for (const ch of config.channels) {
                    if (bitIdx >= bits.length) break;
                    const offset = channelMap[ch];
                    data[pixelIdx + offset] = (data[pixelIdx + offset] & ~1) | bits[bitIdx++];
                }
            }

            ctx.putImageData(imageData, 0, 0);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => reject(new Error('Gagal memuat gambar'));
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
            const channelMap = { R: 0, G: 1, B: 2 };

            const endMarker = config.marker || DEFAULT_MARKER;
            const coords = generateCoordinates(canvas.width, canvas.height, config.traversal);
            let bits = '';
            let result = '';

            outer:
            for (const [x, y] of coords) {
                const pixelIdx = (y * canvas.width + x) * 4;
                for (const ch of config.channels) {
                    const offset = channelMap[ch];
                    bits += (data[pixelIdx + offset] & 1).toString();
                    if (bits.length % 8 === 0) {
                        const charCode = parseInt(bits.slice(-8), 2);
                        result += String.fromCharCode(charCode);
                        if (result.includes(endMarker)) {
                            URL.revokeObjectURL(url);
                            resolve(result.split(endMarker)[0]);
                            break outer;
                        }
                    }
                }
            }

            URL.revokeObjectURL(url);
            reject(new Error('Pesan tidak ditemukan atau konfigurasi tidak cocok'));
        };
        img.onerror = () => reject(new Error('Gagal memuat gambar'));
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
// src/types/Stego.ts

import { Channel } from "./shared";

export type Mode = 'encode' | 'decode';
export const DEFAULT_MARKER = '##END##';

export interface StegoConfig {
    channels: Channel[];
    traversal: TraversalMode;
    marker: string;
}

// Traversal modes
export type TraversalMode =
    | 'left-right-top-bottom'
    | 'right-left-top-bottom'
    | 'left-right-bottom-top'
    | 'right-left-bottom-top'
    | 'spiral-cw'
    | 'spiral-ccw'
    | 'zigzag-horizontal'
    | 'zigzag-vertical'
    | 'diagonal-tl-br'
    | 'diagonal-tr-bl';

// Opsi traversal untuk UI
export const TRAVERSAL_OPTIONS: { value: TraversalMode; label: string; icon: string }[] = [
    { value: 'left-right-top-bottom', label: 'Kiri→Kanan, Atas→Bawah', icon: '→↓' },
    { value: 'right-left-top-bottom', label: 'Kanan→Kiri, Atas→Bawah', icon: '←↓' },
    { value: 'left-right-bottom-top', label: 'Kiri→Kanan, Bawah→Atas', icon: '→↑' },
    { value: 'right-left-bottom-top', label: 'Kanan→Kiri, Bawah→Atas', icon: '←↑' },
    { value: 'spiral-cw', label: 'Spiral Searah Jarum Jam', icon: '↻' },
    { value: 'spiral-ccw', label: 'Spiral Berlawanan Jarum Jam', icon: '↺' },
    { value: 'zigzag-horizontal', label: 'Zig-Zag Horizontal', icon: '≋' },
    { value: 'zigzag-vertical', label: 'Zig-Zag Vertikal', icon: '⋮' },
    { value: 'diagonal-tl-br', label: 'Diagonal ↘ (Kiri Atas)', icon: '↘' },
    { value: 'diagonal-tr-bl', label: 'Diagonal ↙ (Kanan Atas)', icon: '↙' },
];
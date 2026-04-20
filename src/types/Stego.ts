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

// Opsi traversal untuk UI
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
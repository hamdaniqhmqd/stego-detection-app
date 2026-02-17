// src/utils/Channel.ts

import { Channel, TEKNIK_LABEL, TeknikArah } from "@/types/analysis";

export const CH_STYLE: Record<
    Channel,
    { pill: string; header: string; badge: string; dot: string; ring: string }
> = {
    R: {
        pill: 'bg-red-950 text-red-400 border-red-800',
        header: 'border-red-900/60',
        badge: 'bg-red-950/60 text-red-400',
        dot: 'bg-red-500',
        ring: 'ring-red-700',
    },
    G: {
        pill: 'bg-green-950 text-green-400 border-green-800',
        header: 'border-green-900/60',
        badge: 'bg-green-950/60 text-green-400',
        dot: 'bg-green-500',
        ring: 'ring-green-700',
    },
    B: {
        pill: 'bg-blue-950 text-blue-400 border-blue-800',
        header: 'border-blue-900/60',
        badge: 'bg-blue-950/60 text-blue-400',
        dot: 'bg-blue-500',
        ring: 'ring-blue-700',
    },
}

export const ANCAMAN_STYLE: Record<string, string> = {
    Aman: 'bg-green-950 text-green-400 border-green-800',
    Mencurigakan: 'bg-amber-950 text-amber-400 border-amber-800',
    Berbahaya: 'bg-red-950 text-red-400 border-red-800',
}

export const CHANNELS: Channel[] = ['R', 'G', 'B']


export const CHANNEL_META: Record<Channel, { color: string; bg: string; border: string; label: string }> = {
    R: { color: 'text-red-400', bg: 'bg-red-950/40', border: 'border-red-800', label: 'Red' },
    G: { color: 'text-green-400', bg: 'bg-green-950/40', border: 'border-green-800', label: 'Green' },
    B: { color: 'text-blue-400', bg: 'bg-blue-950/40', border: 'border-blue-800', label: 'Blue' },
}

export const TEKNIK_KEYS = Object.keys(TEKNIK_LABEL) as TeknikArah[]
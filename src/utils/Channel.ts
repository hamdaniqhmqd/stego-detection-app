// src/utils/Channel.ts

import { Channel, TEKNIK_LABEL, TeknikArah } from "@/types/analysis";

export const CH_STYLE: Record<
    Channel,
    { pill: string; header: string; badge: string; dot: string; ring: string }
> = {
    R: {
        pill: 'bg-red-100 text-red-600 border-red-600',
        header: 'border-red-600/60',
        badge: 'bg-red-600/60 text-red-400',
        dot: 'bg-red-500',
        ring: 'ring-red-600',
    },
    G: {
        pill: 'bg-green-100 text-green-600 border-green-600',
        header: 'border-green-600/60',
        badge: 'bg-green-600/60 text-green-400',
        dot: 'bg-green-500',
        ring: 'ring-green-600',
    },
    B: {
        pill: 'bg-blue-100 text-blue-600 border-blue-600',
        header: 'border-blue-600/60',
        badge: 'bg-blue-600/60 text-blue-400',
        dot: 'bg-blue-500',
        ring: 'ring-blue-600',
    },
}

export const ANCAMAN_STYLE: Record<string, string> = {
    Aman: 'bg-green-200 text-green-800 border-green-800',
    Mencurigakan: 'bg-amber-950 text-amber-400 border-amber-800',
    Berbahaya: 'bg-red-950 text-red-400 border-red-800',
}

export const CHANNELS: Channel[] = ['R', 'G', 'B']


export const CHANNEL_META: Record<Channel, { color: string; bg: string; border: string; label: string }> = {
    R: { color: 'text-red-400', bg: 'bg-red-300/40', border: 'border-red-600', label: 'Red' },
    G: { color: 'text-green-400', bg: 'bg-green-300/40', border: 'border-green-600', label: 'Green' },
    B: { color: 'text-blue-400', bg: 'bg-blue-300/40', border: 'border-blue-600', label: 'Blue' },
}

export const TEKNIK_KEYS = Object.keys(TEKNIK_LABEL) as TeknikArah[]
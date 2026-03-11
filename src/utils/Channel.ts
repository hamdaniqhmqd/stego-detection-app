// src/utils/Channel.ts

import { StatusAncaman } from "@/hooks/useInterpretasiAI";
import { Channel, TEKNIK_LABEL, TeknikArah } from "@/types/shared";

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

export const CHANNEL_COLOR: Record<string, string> = {
    R: 'bg-red-50 text-red-700 border-red-200',
    G: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    B: 'bg-blue-50 text-blue-700 border-blue-200',
}

export const STATUS_COLOR: Record<StatusAncaman, string> = {
    Aman: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Mencurigakan: 'bg-amber-50 text-amber-700 border-amber-200',
    Berbahaya: 'bg-red-50 text-red-700 border-red-200',
}

export const STATUS_DOT: Record<StatusAncaman, string> = {
    Aman: 'bg-emerald-500',
    Mencurigakan: 'bg-amber-500',
    Berbahaya: 'bg-red-500',
}

export const STATUS_RING: Record<StatusAncaman, string> = {
    Aman: 'ring-emerald-200',
    Mencurigakan: 'ring-amber-200',
    Berbahaya: 'ring-red-200',
}

export const STATUS_BG: Record<StatusAncaman, string> = {
    Aman: 'bg-emerald-50',
    Mencurigakan: 'bg-amber-50',
    Berbahaya: 'bg-red-50',
}

export const STATUS_TEXT: Record<StatusAncaman, string> = {
    Aman: 'text-emerald-700',
    Mencurigakan: 'text-amber-700',
    Berbahaya: 'text-red-700',
}

export const CHANNEL_TOOLTIPS: Record<Channel, string> = {
    R: "Kanal Merah (Red): menyimpan bit pada nilai merah setiap piksel. Perubahan tidak terlihat mata manusia.",
    G: "Kanal Hijau (Green): mata manusia paling sensitif terhadap hijau, namun perubahan 1-bit tetap tidak terdeteksi.",
    B: "Kanal Biru (Blue): menyimpan bit pada nilai biru setiap piksel. Semakin banyak kanal aktif, semakin besar kapasitas pesan.",
};

export const TRAVERSAL_TOOLTIPS: Record<string, string> = {
    "top-bottom-left-right": "Membaca piksel dari kiri atas ke kanan bawah, baris demi baris — pola paling umum.",
    "bottom-top-right-left": "Membaca piksel dari kanan bawah ke kiri atas, kebalikan dari pola default.",
    "left-right-top-bottom": "Membaca piksel secara vertikal dari atas ke bawah, kolom demi kolom.",
    "right-left-bottom-top": "Membaca piksel secara vertikal dari bawah ke atas, kolom demi kolom, dimulai dari kanan.",
    "spiral-inward": "Membaca piksel mengikuti pola spiral dari tepi gambar menuju pusat.",
    "zigzag": "Membaca piksel dengan pola zig-zag — berganti arah setiap baris.",
    "diagonal": "Membaca piksel mengikuti garis diagonal dari sudut ke sudut.",
    "random": "Urutan piksel diacak berdasarkan seed tertentu — menambah keamanan namun wajib konsisten saat dekode.",
};
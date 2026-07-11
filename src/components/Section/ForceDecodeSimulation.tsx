// src/components/Section/ForceDecodeSimulation.tsx

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Coord = [number, number];

type ScanMode = {
    key: string;
    label: string;
    axis: 'Baris' | 'Kolom';
    desc: string;
    gen: (w: number, h: number) => Coord[];
};

type Channel = 'R' | 'G' | 'B';

type Pixel = { r: number; g: number; b: number };

const W = 8;
const H = 8;

const MODES: ScanMode[] = [
    {
        key: 'row-lr-tb',
        label: 'Kiri → Kanan, Atas → Bawah',
        axis: 'Baris',
        desc: 'Membaca setiap baris dari atas ke bawah, dan di dalam satu baris bergerak dari kiri ke kanan.',
        gen: (w, h) => {
            const c: Coord[] = [];
            for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) c.push([x, y]);
            return c;
        },
    },
    {
        key: 'row-rl-tb',
        label: 'Kanan → Kiri, Atas → Bawah',
        axis: 'Baris',
        desc: 'Arah horizontal dibalik: setiap baris dibaca dari kanan ke kiri, tetap dari baris atas ke bawah.',
        gen: (w, h) => {
            const c: Coord[] = [];
            for (let y = 0; y < h; y++) for (let x = w - 1; x >= 0; x--) c.push([x, y]);
            return c;
        },
    },
    {
        key: 'row-lr-bt',
        label: 'Kiri → Kanan, Bawah → Atas',
        axis: 'Baris',
        desc: 'Arah vertikal dibalik: baris paling bawah dibaca lebih dulu, isi baris tetap kiri ke kanan.',
        gen: (w, h) => {
            const c: Coord[] = [];
            for (let y = h - 1; y >= 0; y--) for (let x = 0; x < w; x++) c.push([x, y]);
            return c;
        },
    },
    {
        key: 'row-rl-bt',
        label: 'Kanan → Kiri, Bawah → Atas',
        axis: 'Baris',
        desc: 'Kombinasi kebalikan penuh dari pola pertama: baris bawah ke atas, isi baris kanan ke kiri.',
        gen: (w, h) => {
            const c: Coord[] = [];
            for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) c.push([x, y]);
            return c;
        },
    },
    {
        key: 'col-tb-lr',
        label: 'Atas → Bawah, Kiri → Kanan',
        axis: 'Kolom',
        desc: 'Berbasis kolom: setiap kolom dibaca dari atas ke bawah sebelum berpindah ke kolom berikutnya di sebelah kanan.',
        gen: (w, h) => {
            const c: Coord[] = [];
            for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) c.push([x, y]);
            return c;
        },
    },
    {
        key: 'col-bt-lr',
        label: 'Bawah → Atas, Kiri → Kanan',
        axis: 'Kolom',
        desc: 'Setiap kolom dibaca dari bawah ke atas, kolom-kolom diproses dari kiri ke kanan.',
        gen: (w, h) => {
            const c: Coord[] = [];
            for (let x = 0; x < w; x++) for (let y = h - 1; y >= 0; y--) c.push([x, y]);
            return c;
        },
    },
    {
        key: 'col-tb-rl',
        label: 'Atas → Bawah, Kanan → Kiri',
        axis: 'Kolom',
        desc: 'Setiap kolom dibaca dari atas ke bawah, tetapi kolom-kolom diproses mulai dari sisi kanan.',
        gen: (w, h) => {
            const c: Coord[] = [];
            for (let x = w - 1; x >= 0; x--) for (let y = 0; y < h; y++) c.push([x, y]);
            return c;
        },
    },
    {
        key: 'col-bt-rl',
        label: 'Bawah → Atas, Kanan → Kiri',
        axis: 'Kolom',
        desc: 'Kebalikan penuh dari pola berbasis kolom pertama: kolom kanan diproses lebih dulu, tiap kolom dibaca dari bawah ke atas.',
        gen: (w, h) => {
            const c: Coord[] = [];
            for (let x = w - 1; x >= 0; x--) for (let y = h - 1; y >= 0; y--) c.push([x, y]);
            return c;
        },
    },
];

const CHANNELS: { key: Channel; label: string; dot: string }[] = [
    { key: 'R', label: 'Merah (R)', dot: 'bg-red-500' },
    { key: 'G', label: 'Hijau (G)', dot: 'bg-green-500' },
    { key: 'B', label: 'Biru (B)', dot: 'bg-blue-500' },
];

// PRNG sederhana & deterministik (mulberry32) supaya data piksel selalu sama
// di setiap render (menghindari mismatch hydration Next.js) namun tetap
// "terlihat acak" seperti gambar sungguhan.
function mulberry32(seed: number) {
    let a = seed;
    return function () {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// Pesan rahasia yang sengaja disisipkan pada LSB kanal Biru, dibaca dengan
// urutan 'row-lr-tb' (kiri→kanan, atas→bawah). 36 piksel = 36 bit tersedia,
// cukup untuk 4 karakter ASCII penuh (32 bit) + 4 bit sisa yang diabaikan.
const HIDDEN_MESSAGE = 'abcdefgh';

function messageToBits(msg: string): number[] {
    const bits: number[] = [];
    for (const ch of msg) {
        const code = ch.charCodeAt(0);
        for (let b = 7; b >= 0; b--) bits.push((code >> b) & 1);
    }
    return bits;
}

// Bangun grid piksel sintetis: kanal R & G sepenuhnya acak, kanal B punya
// LSB berisi bit pesan (sesuai urutan row-lr-tb), 7 bit tersisanya acak.
function buildPixelGrid(w: number, h: number): Pixel[][] {
    const rand = mulberry32(1337);
    const grid: Pixel[][] = Array.from({ length: h }, () => Array(w));
    const rowOrder = MODES[0].gen(w, h); // row-lr-tb
    const bits = messageToBits(HIDDEN_MESSAGE);

    rowOrder.forEach(([x, y], i) => {
        const bit = i < bits.length ? bits[i] : Math.round(rand());
        const rBase = Math.floor(rand() * 256) & 0xfe;
        const gBase = Math.floor(rand() * 256) & 0xfe;
        const bBase = Math.floor(rand() * 256) & 0xfe;
        grid[y][x] = {
            r: rBase | Math.round(rand()),
            g: gBase | Math.round(rand()),
            b: bBase | bit,
        };
    });

    return grid;
}

function lsb(pixel: Pixel, channel: Channel): number {
    const v = channel === 'R' ? pixel.r : channel === 'G' ? pixel.g : pixel.b;
    return v & 1;
}

function bitsToBytes(bits: number[]): number[] {
    const bytes: number[] = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
        let byte = 0;
        for (let k = 0; k < 8; k++) byte = (byte << 1) | bits[i + k];
        bytes.push(byte);
    }
    return bytes;
}

function byteToDisplayChar(byte: number): string {
    return byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '·';
}

export default function ForceDecodeSimulation() {
    const [modeIdx, setModeIdx] = useState(0);
    const [channel, setChannel] = useState<Channel>('R');
    const [step, setStep] = useState(0);
    const [playing, setPlaying] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const logEndRef = useRef<HTMLDivElement | null>(null);

    const mode = MODES[modeIdx];
    const coords = useMemo(() => mode.gen(W, H), [mode]);
    const total = W * H;

    const pixelGrid = useMemo(() => buildPixelGrid(W, H), []);

    useEffect(() => {
        setStep(0);
        setPlaying(false);
        if (timerRef.current) clearInterval(timerRef.current);
    }, [modeIdx, channel]);

    useEffect(() => {
        if (!playing) return;
        timerRef.current = setInterval(() => {
            setStep((s) => {
                if (s >= total) {
                    setPlaying(false);
                    if (timerRef.current) clearInterval(timerRef.current);
                    return s;
                }
                return s + 1;
            });
        }, 260);
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playing, total]);

    const visited = useMemo(() => {
        const s = new Set<string>();
        for (let i = 0; i < step; i++) s.add(coords[i][0] + ',' + coords[i][1]);
        return s;
    }, [coords, step]);

    const active = step > 0 ? coords[step - 1] : null;

    // Bit-bit yang sudah "diekstrak" sejauh langkah saat ini, sesuai
    // urutan pemindaian (mode) dan kanal warna yang dipilih.
    const extractedBits = useMemo(() => {
        const bits: number[] = [];
        for (let i = 0; i < step; i++) {
            const [x, y] = coords[i];
            bits.push(lsb(pixelGrid[y][x], channel));
        }
        return bits;
    }, [coords, step, pixelGrid, channel]);

    const bytes = useMemo(() => bitsToBytes(extractedBits), [extractedBits]);
    const decodedText = useMemo(() => bytes.map(byteToDisplayChar).join(''), [bytes]);
    const printableRatio = useMemo(() => {
        if (bytes.length === 0) return 0;
        const printable = bytes.filter((b) => b >= 32 && b <= 126).length;
        return printable / bytes.length;
    }, [bytes]);

    const isLikelyCorrect = mode.key === 'row-lr-tb' && channel === 'B';
    const finished = step >= total;

    // Log animasi: satu baris per piksel yang sudah "disinggahi", tumbuh
    // seiring 'step' bertambah — ini yang membuat koordinat & bit LSB
    // terasa "muncul berdasarkan animasi" alih-alih langsung tampil semua.
    const coordLog = useMemo(() => {
        const lines: { i: number; x: number; y: number; bit: number; byteDone: boolean }[] = [];
        for (let i = 0; i < step; i++) {
            const [x, y] = coords[i];
            const bit = lsb(pixelGrid[y][x], channel);
            const byteDone = (i + 1) % 8 === 0;
            lines.push({ i: i + 1, x, y, bit, byteDone });
        }
        return lines;
    }, [coords, step, pixelGrid, channel]);

    // Auto-scroll log ke baris terbaru setiap kali step bertambah.
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ block: 'end' });
    }, [step]);

    const handlePlay = () => {
        if (playing) {
            setPlaying(false);
            return;
        }
        if (step >= total) setStep(0);
        setPlaying(true);
    };

    const handleReset = () => {
        setPlaying(false);
        setStep(0);
    };

    return (
        <div className="w-full border border-neutral-900 rounded-sm bg-neutral-50 p-5 sm:p-8">
            {/* Mode selector */}
            <div className="mb-4">
                <span className="block text-[11px] uppercase tracking-wide text-neutral-500 font-semibold mb-2">
                    Pilih arah pembacaan piksel (8 pola)
                </span>
                <div className="flex flex-wrap gap-2">
                    {MODES.map((m, i) => (
                        <button
                            key={m.key}
                            onClick={() => setModeIdx(i)}
                            className={`px-3 py-1.5 text-[11px] font-medium rounded-sm border transition-all ${i === modeIdx
                                ? 'bg-neutral-900 text-neutral-100 border-neutral-900 -translate-y-0.5 shadow-[-3px_3px_0_rgba(26,26,46,0.8)]'
                                : `bg-transparent text-neutral-700 border-neutral-300
                                    duration-300 ease-in-out
                                    hover:-translate-y-0.5 hover:border-neutral-900 hover:shadow-[-3px_3px_0_rgba(26,26,46,0.8)]`
                                }`}
                        >
                            {i + 1}. {m.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Channel selector */}
            <div className="mb-6">
                <span className="block text-[11px] uppercase tracking-wide text-neutral-500 font-semibold mb-2">
                    Pilih kanal warna yang diuji (LSB)
                </span>
                <div className="flex flex-wrap gap-2">
                    {CHANNELS.map((c) => (
                        <button
                            key={c.key}
                            onClick={() => setChannel(c.key)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-sm border transition-all ${channel === c.key
                                ? 'bg-neutral-900 text-neutral-100 border-neutral-900 -translate-y-0.5 shadow-[-3px_3px_0_rgba(26,26,46,0.8)]'
                                : `bg-transparent text-neutral-700 border-neutral-300
                                    duration-300 ease-in-out
                                    hover:-translate-y-0.5 hover:border-neutral-900 hover:shadow-[-3px_3px_0_rgba(26,26,46,0.8)]`
                                }`}
                        >
                            <span className={`w-2 h-2 rounded-full inline-block ${c.dot}`} />
                            {c.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid sm:grid-cols-[auto_1fr] gap-8 items-start">
                {/* Grid */}
                <div className="flex flex-col gap-3 items-center sm:items-start">
                    <div
                        className="grid gap-1"
                        style={{ gridTemplateColumns: `repeat(${W}, minmax(0,1fr))` }}
                    >
                        {
                            Array.from({ length: H }).map((_, y) =>
                                Array.from({ length: W }).map((_, x) => {
                                    const idx = coords.findIndex((p) => p[0] === x && p[1] === y);
                                    const key = `${x},${y}`;
                                    const isActive = active && active[0] === x && active[1] === y;
                                    const isVisited = visited.has(key) && !isActive;
                                    const bitVal = lsb(pixelGrid[y][x], channel);
                                    return (
                                        <div
                                            key={key}
                                            className={`w-9 h-9 sm:w-10 sm:h-10 flex flex-col items-center justify-center text-[10px] font-semibold rounded-sm border transition-colors duration-150 
                                                ${isActive
                                                    ? 'bg-neutral-900 text-neutral-100 border-neutral-900'
                                                    : isVisited
                                                        ? 'bg-neutral-300 text-neutral-800 border-neutral-400'
                                                        : 'bg-white text-neutral-400 border-neutral-200'
                                                }`}
                                        >
                                            <span>{idx + 1}</span>
                                            {(isActive || isVisited) && (
                                                <span className="text-[8px] opacity-70 leading-none">bit {bitVal}</span>
                                            )}
                                        </div>
                                    );
                                })
                            )
                        }
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePlay}
                            className="px-4 py-1.5 text-xs font-semibold rounded-sm border border-neutral-900 bg-neutral-100 text-neutral-900 hover:-translate-y-0.5 hover:shadow-[-3px_3px_0_rgba(26,26,46,0.8)] transition-all"
                        >
                            {playing ? '⏸ Jeda' : step >= total ? '↺ Ulangi' : '▶ Putar'}
                        </button>
                        <button
                            onClick={handleReset}
                            className="px-4 py-1.5 text-xs font-semibold rounded-sm border border-neutral-300 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 hover:-translate-y-0.5 hover:shadow-[-3px_3px_0_rgba(26,26,46,0.8)] transition-all"
                        >
                            Reset
                        </button>
                        <span className="text-[11px] text-neutral-500">
                            Langkah {step}/{total}
                        </span>
                    </div>

                    <div className="flex gap-4 text-[11px] text-neutral-500">
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-sm bg-neutral-900 inline-block" />
                            Piksel aktif
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-sm bg-neutral-300 border border-neutral-400 inline-block" />
                            Sudah dibaca
                        </div>
                    </div>
                </div>

                {/* Info panel */}
                <div className="text-sm leading-relaxed flex flex-col gap-4">
                    <div>
                        <div className="text-[11px] uppercase tracking-wide text-neutral-500 font-semibold mb-1">
                            {mode.axis === 'Baris' ? 'Pola berbasis baris' : 'Pola berbasis kolom'} · kanal {channel}
                        </div>
                        <div className="font-semibold text-neutral-900 mb-2">{mode.label}</div>
                        <p className="text-neutral-600 mb-2">{mode.desc}</p>
                        <p className="text-neutral-600">
                            Setiap piksel yang disinggahi diperlakukan sama: sistem mengambil bit LSB dari
                            kanal warna yang sedang diuji, lalu menambahkannya ke rangkaian bit. Karena
                            steganalisis tidak tahu pola mana yang dipakai saat penyisipan, kedelapan pola ini
                            dicoba satu per satu terhadap kombinasi kanal R, G, dan B — sampai ditemukan
                            rangkaian bit yang, setelah didekode ke ASCII, membentuk teks yang bermakna.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">

                        {/* Panel hasil ekstraksi */}
                        <div className="flex-1 border border-neutral-200 rounded-sm bg-white p-3">
                            <div className="text-[11px] uppercase tracking-wide text-neutral-500 font-semibold mb-2">
                                Hasil ekstraksi bit ({extractedBits.length}/{total} bit)
                            </div>

                            <div className="font-mono text-[11px] text-neutral-700 break-all mb-2">
                                {extractedBits.length > 0 ? extractedBits.join('') : '—'}
                            </div>

                            <div className="text-[11px] uppercase tracking-wide text-neutral-500 font-semibold mb-1">
                                Byte penuh terbentuk ({bytes.length})
                            </div>
                            <div className="flex flex-wrap gap-1 mb-2">
                                {bytes.length > 0 ? (
                                    bytes.map((b, i) => (
                                        <span
                                            key={i}
                                            className="px-1.5 py-0.5 rounded-sm border border-neutral-200 bg-neutral-50 text-[10px] font-mono text-neutral-700"
                                            title={`0x${b.toString(16).padStart(2, '0')} = ${b}`}
                                        >
                                            {byteToDisplayChar(b)}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-[11px] text-neutral-400">belum ada</span>
                                )}
                            </div>

                            <div className="text-[11px] uppercase tracking-wide text-neutral-500 font-semibold mb-1">
                                Dekode ASCII
                            </div>
                            <div className="font-mono text-sm text-neutral-900 mb-2">
                                {decodedText || '—'}
                            </div>

                            {finished && (
                                <div
                                    className={`text-[11px] font-semibold px-2 py-1 rounded-sm inline-block ${printableRatio >= 0.75
                                        ? 'bg-green-100 text-green-800 border border-green-300'
                                        : 'bg-red-100 text-red-800 border border-red-300'
                                        }`}
                                >
                                    {printableRatio >= 0.75
                                        ? `Kemungkinan pesan valid (${Math.round(printableRatio * 100)}% karakter tercetak)`
                                        : `Tidak bermakna (${Math.round(printableRatio * 100)}% karakter tercetak)`}
                                </div>
                            )}

                            {finished && isLikelyCorrect && (
                                <p className="text-[11px] text-neutral-500 mt-2">
                                    Kombinasi ini (pola {mode.label.toLowerCase()}, kanal {channel}) adalah kombinasi
                                    yang memang dipakai saat data disisipkan pada simulasi ini, sehingga hasilnya
                                    terbaca sebagai teks yang bermakna.
                                </p>
                            )}
                        </div>


                        {/* Log koordinat + bit, muncul baris demi baris seiring animasi berjalan */}
                        <div className="flex-1 w-full border border-neutral-200 rounded-sm bg-white">
                            <div className="text-[11px] uppercase tracking-wide text-neutral-500 font-semibold px-3 pt-2">
                                Log koordinat (animasi)
                            </div>
                            <div className="h-64 overflow-y-auto px-3 pb-2 pt-1 font-mono text-[11px] leading-relaxed text-neutral-700 scrollbar_y_custom">
                                {coordLog.length === 0 ? (
                                    <span className="text-neutral-400">
                                        Tekan &quot;Putar&quot; untuk mulai mengambil koordinat satu per satu…
                                    </span>
                                ) : (
                                    coordLog.map((row) => (
                                        <div
                                            key={row.i}
                                            className={`flex items-center gap-2 ${row.i === step ? 'text-neutral-900 font-semibold' : ''
                                                }`}
                                        >
                                            <span className="text-neutral-400 w-7 text-right shrink-0">#{row.i}</span>
                                            <span>{`(x=${row.x}, y=${row.y})`}</span>
                                            <span className="text-neutral-400">→</span>
                                            <span>
                                                LSB({channel})=<span className="text-neutral-900">{row.bit}</span>
                                            </span>
                                            {row.byteDone && (
                                                <span className="ml-1 px-1 rounded-sm bg-neutral-900 text-neutral-100 text-[9px]">
                                                    1 byte lengkap
                                                </span>
                                            )}
                                        </div>
                                    ))
                                )}
                                <div ref={logEndRef} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
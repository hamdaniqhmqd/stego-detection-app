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

const W = 6;
const H = 6;

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

export default function ForceDecodeSimulation() {
    const [modeIdx, setModeIdx] = useState(0);
    const [step, setStep] = useState(0);
    const [playing, setPlaying] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const mode = MODES[modeIdx];
    const coords = useMemo(() => mode.gen(W, H), [mode]);
    const total = W * H;

    useEffect(() => {
        setStep(0);
        setPlaying(false);
        if (timerRef.current) clearInterval(timerRef.current);
    }, [modeIdx]);

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
            <div className="mb-6">
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
                                    return (
                                        <div
                                            key={key}
                                            className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-[10px] font-semibold rounded-sm border transition-colors duration-150 ${isActive
                                                ? 'bg-neutral-900 text-neutral-100 border-neutral-900'
                                                : isVisited
                                                    ? 'bg-neutral-300 text-neutral-800 border-neutral-400'
                                                    : 'bg-white text-neutral-400 border-neutral-200'
                                                }`}
                                        >
                                            {idx + 1}
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
                <div className="text-sm leading-relaxed">
                    <div className="text-[11px] uppercase tracking-wide text-neutral-500 font-semibold mb-1">
                        {mode.axis === 'Baris' ? 'Pola berbasis baris' : 'Pola berbasis kolom'}
                    </div>
                    <div className="font-semibold text-neutral-900 mb-2">{mode.label}</div>
                    <p className="text-neutral-600 mb-4">{mode.desc}</p>
                    <p className="text-neutral-600">
                        Setiap piksel yang disinggahi diperlakukan sama: sistem mengambil bit LSB dari
                        kanal warna yang sedang diuji, lalu menambahkannya ke rangkaian bit. Karena
                        steganalisis tidak tahu pola mana yang dipakai saat penyisipan, kedelapan pola ini
                        dicoba satu per satu terhadap kombinasi kanal R, G, dan B — sampai ditemukan
                        rangkaian bit yang, setelah didekode ke ASCII, membentuk teks yang bermakna.
                    </p>
                </div>
            </div>
        </div>
    );
}
'use client';

import DashboardLayoutUsers from "@/components/Layouts/DashboardLayoutUsers";
import { Tooltip } from "@/components/Ui/ToolTip";
import { Channel } from "@/types/shared";
import { DEFAULT_MARKER, Mode, StegoConfig, TRAVERSAL_OPTIONS } from "@/types/Stego";
import { CHANNEL_META, CHANNEL_TOOLTIPS, CHANNELS, TRAVERSAL_TOOLTIPS } from "@/utils/Channel";
import { InfoIcon } from "@/utils/Icons";
import { decodeLSB } from "@/utils/stego/decodeLSB";
import { encodeLSB } from "@/utils/stego/encodeLSB";
import { useState, useRef, useCallback } from "react";

export default function BuatStegoPage() {
    const [mode, setMode] = useState<Mode>('encode');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    const [config, setConfig] = useState<StegoConfig>({
        channels: ['R', 'G', 'B'],
        traversal: 'top-bottom-left-right',
        marker: DEFAULT_MARKER,
    });
    const [result, setResult] = useState<string | null>(null);
    const [decodedMessage, setDecodedMessage] = useState<Record<Channel, string> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [dragging, setDragging] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = (file: File) => {
        if (!file.type.startsWith('image/')) { setError('File harus berupa gambar (PNG, JPG, dll)'); return; }
        setImageFile(file); setResult(null); setDecodedMessage(null); setError(null);
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault(); setDragging(false);
        const file = e.dataTransfer.files[0]; if (file) handleFile(file);
    }, []);

    const toggleChannel = (ch: Channel) => {
        setConfig(prev => {
            const has = prev.channels.includes(ch);
            if (has && prev.channels.length === 1) return prev;
            return { ...prev, channels: has ? prev.channels.filter(c => c !== ch) : [...prev.channels, ch] };
        });
    };

    const handleProcess = async () => {
        if (!imageFile) {
            setError('Pilih gambar terlebih dahulu');
            return;
        }

        if (mode === 'encode' && !message.trim()) {
            setError('Masukkan pesan yang ingin disisipkan');
            return;
        }

        if (!config.marker.trim()) {
            setError('Marker tidak boleh kosong');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);
        setDecodedMessage(null);

        try {
            if (mode === 'encode') {
                setResult(await encodeLSB(imageFile, message, config));
            } else {
                setDecodedMessage(await decodeLSB(imageFile, config));
            }
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const downloadResult = () => {
        if (!result) return;
        const a = document.createElement('a');
        a.href = result;
        a.download = `stego_${imageFile?.name?.replace(/\.[^.]+$/, '') ?? 'image'}.png`;
        a.click();
    };

    const copyMessage = () => {
        if (!decodedMessage) return;
        const text = Object.entries(decodedMessage)
            .map(([ch, msg]) => `[Kanal ${ch}]\n${msg}`)
            .join('\n\n');
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const switchMode = (m: Mode) => {
        setMode(m); setResult(null); setDecodedMessage(null); setError(null);
    };

    const isMarkerDefault = config.marker === DEFAULT_MARKER;

    return (
        <DashboardLayoutUsers>
            <main className="w-full min-h-screen">
                <div className="lg:pb-16 lg:pt-8 pb-10 pt-5">

                    {/* Header */}
                    <section className="text-center mb-10">
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-neutral-900 mb-2">
                            Buat Steganografi
                        </h1>
                        <p className="text-neutral-700 text-sm">
                            Sembunyikan pesan rahasia dalam gambar menggunakan metode Least Significant Bit
                        </p>
                    </section>

                    {/* Mode Toggle */}
                    <section className="max-w-5xl mx-auto mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(['encode', 'decode'] as Mode[]).map((m) => (
                                <Tooltip
                                    key={m}
                                    text={
                                        m === 'encode'
                                            ? 'Sisipkan pesan teks ke dalam piksel gambar menggunakan metode LSB (Least Significant Bit).'
                                            : 'Baca dan ekstrak pesan tersembunyi dari gambar stego yang sudah diproses sebelumnya.'
                                    }
                                >
                                    <button
                                        onClick={() => switchMode(m)}
                                        className={`w-full flex items-center justify-center gap-2 py-3 px-4 
                                                    rounded-sm font-bold text-sm border
                                                    transition-all duration-200 ease-in-out 
                                                    ${mode === m
                                                ? `bg-neutral-50 text-neutral-900 border-neutral-900 
                                                shadow-[-6px_7px_0_rgba(26,26,46,1)] -translate-y-0.5`
                                                : `text-neutral-900 border-neutral-100 hover:border-neutral-900 
                                                hover:shadow-[-6px_7px_0_rgba(26,26,46,1)] hover:-translate-y-0.5`
                                            }`}
                                    >
                                        {m === 'encode' ? 'Sisipkan Pesan' : 'Ekstrak Pesan'}
                                    </button>
                                </Tooltip>
                            ))}
                        </div>
                    </section>

                    {/* Main Grid */}
                    <section className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">

                        {/* ── Left Column ── */}
                        <div className="flex flex-col gap-5">

                            {/* Image Upload */}
                            <div className="bg-neutral-50 border border-neutral-900 rounded-sm p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <h2 className="text-sm tracking-widest uppercase font-semibold text-neutral-900">
                                        Gambar Input
                                    </h2>
                                    <Tooltip text={"Unggah gambar yang akan dijadikan wadah penyimpanan pesan. Gunakan PNG untuk hasil terbaik karena tidak menggunakan kompresi lossy."}>
                                        <span className="text-neutral-900 cursor-default">
                                            <InfoIcon />
                                        </span>
                                    </Tooltip>
                                    <div className="flex-1 h-px bg-neutral-500" />
                                </div>

                                {!imagePreview ? (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        onDrop={handleDrop}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDragEnter={() => setDragging(true)}
                                        onDragLeave={() => setDragging(false)}
                                        className={`border-2 border-dashed rounded-sm p-10 text-center cursor-pointer transition-all duration-200
                                                    ${dragging
                                                ? 'border-neutral-400 bg-neutral-200'
                                                : 'border-neutral-400 hover:border-neutral-600 hover:bg-neutral-200'
                                            }`}
                                    >
                                        <div className="flex justify-center mb-3">
                                            <svg className="h-12 w-12 text-neutral-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <p className="font-bold text-neutral-800 text-sm mb-1">Drag & drop gambar di sini</p>
                                        <p className="text-xs text-neutral-500">atau klik untuk memilih file</p>
                                        <p className="text-xs text-neutral-400 mt-1">PNG · JPG · WEBP · BMP</p>
                                    </div>
                                ) : (
                                    <div className="relative rounded-sm overflow-hidden border border-neutral-300">
                                        <img src={imagePreview} alt="Preview" className="w-full h-52 object-cover block" />
                                        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent px-4 py-3">
                                            <span className="text-xs text-neutral-300 truncate block">
                                                {imageFile?.name} · {(imageFile!.size / 1024).toFixed(1)} KB
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute top-3 right-3 bg-black/60 border border-white/20 text-white text-xs px-3 py-1 rounded-sm font-semibold hover:bg-black/80 transition-colors"
                                        >
                                            Ganti
                                        </button>
                                    </div>
                                )}

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                                />
                            </div>

                            {/* End Marker */}
                            <div className="bg-neutral-50 border border-neutral-900 rounded-sm p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <h2 className="text-sm tracking-widest uppercase font-semibold text-neutral-900">
                                        End Marker
                                    </h2>
                                    <Tooltip text="Penanda akhir pesan yang disisipkan ke dalam data bit. Wajib identik antara proses enkode dan dekode. Marker unik meningkatkan keamanan karena tanpanya pesan tidak bisa diekstrak." >
                                        <span className="text-neutral-900 cursor-default">
                                            <InfoIcon />
                                        </span>
                                    </Tooltip>
                                    <div className="flex-1 h-px bg-neutral-500" />
                                </div>

                                <div className="flex flex-col md:flex-row items-stretch justify-center gap-2">
                                    <input
                                        type="text"
                                        value={config.marker}
                                        onChange={(e) => setConfig(prev => ({ ...prev, marker: e.target.value }))}
                                        placeholder={DEFAULT_MARKER}
                                        className={`w-full md:flex-1 bg-white border rounded-sm text-neutral-800 px-4 py-2.5 text-sm font-mono
                                                    outline-none placeholder-neutral-400 transition-colors
                                                    ${config.marker.trim() === ''
                                                ? 'border-red-400 focus:border-red-500'
                                                : isMarkerDefault
                                                    ? 'border-neutral-400 focus:border-neutral-800'
                                                    : 'border-neutral-400 focus:border-neutral-600'
                                            }`}
                                    />
                                    <Tooltip text="Kembalikan marker ke nilai default bawaan sistem.">
                                        <button
                                            onClick={() => setConfig(prev => ({ ...prev, marker: DEFAULT_MARKER }))}
                                            disabled={isMarkerDefault}
                                            title="Reset ke marker default"
                                            className="w-full md:shrink-0 px-3 py-2.5 text-sm border border-neutral-900 text-neutral-900 rounded-sm font-semibold 
                                                    transition-all ease-in-out
                                                    hover:shadow-[-5px_5px_0_rgba(26,26,46,1)] hover:-translate-y-0.5
                                                    disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
                                        >
                                            Reset
                                        </button>
                                    </Tooltip>
                                </div>

                                {/* Status indicator */}
                                <div className="mt-2 flex items-center gap-1.5">
                                    {config.marker.trim() === '' ? (
                                        <span className="text-xs text-red-500">⚠ Marker tidak boleh kosong</span>
                                    ) : isMarkerDefault ? (
                                        <span className="text-xs text-neutral-500">Menggunakan marker default</span>
                                    ) : (
                                        <span className="text-xs text-blue-600 font-medium">✓ Marker kustom aktif</span>
                                    )}
                                </div>

                                <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                                    Marker menandai akhir pesan. Gunakan marker yang <strong className="text-neutral-800">sama persis</strong> saat enkripsi & dekripsi.
                                    Marker unik menambah lapisan keamanan ekstra.
                                </p>
                            </div>

                            {/* Message Input (encode only) */}
                            {mode === 'encode' && (
                                <div className="bg-neutral-50 border border-neutral-900 rounded-sm p-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <h2 className="text-sm tracking-widest uppercase font-semibold text-neutral-900">
                                            Pesan Rahasia
                                        </h2>
                                        <Tooltip text="Teks yang akan disembunyikan di dalam piksel gambar.">
                                            <span className="text-neutral-900 cursor-default">
                                                <InfoIcon />
                                            </span>
                                        </Tooltip>
                                        <div className="flex-1 h-px bg-neutral-500" />
                                    </div>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        rows={4}
                                        placeholder="Masukkan pesan yang ingin disembunyikan dalam gambar..."
                                        className="w-full bg-white border border-neutral-400 rounded-sm text-neutral-800 px-4 py-2.5 text-sm
                                                outline-none placeholder-neutral-400 focus:border-neutral-700 transition-colors"
                                    />
                                    <div className="text-right text-xs text-neutral-500 mt-1">
                                        {message.length} karakter
                                    </div>
                                </div>
                            )}

                            {/* Decode Info */}
                            {mode === 'decode' && (
                                <div className="bg-neutral-50 border border-neutral-900 rounded-sm p-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <h2 className="text-sm tracking-widest uppercase font-semibold text-neutral-900">
                                            Informasi Dekode
                                        </h2>
                                        <Tooltip text="Pastikan konfigurasi kanal, pola traversal, dan marker sama persis dengan yang digunakan saat menyisipkan pesan. Jika tidak cocok, pesan tidak akan bisa diekstrak." >
                                            <span className="text-neutral-900 cursor-default">
                                                <InfoIcon />
                                            </span>
                                        </Tooltip>
                                        <div className="flex-1 h-px bg-neutral-500" />
                                    </div>
                                    <p className="text-sm text-neutral-700 leading-relaxed">
                                        Pastikan konfigurasi{' '}
                                        <strong className="text-neutral-950">kanal</strong>,{' '}
                                        <strong className="text-neutral-950">pola traversal</strong>, dan{' '}
                                        <strong className="text-neutral-950">marker</strong>{' '}
                                        sama persis dengan yang digunakan saat menyisipkan pesan.
                                        Jika tidak cocok, pesan tidak akan bisa diekstrak.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* ── Right Column ── */}
                        <div className="flex flex-col gap-5">

                            {/* Channel Selector */}
                            <div className="bg-neutral-50 border border-neutral-900 rounded-sm p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <h2 className="text-sm tracking-widest uppercase font-semibold text-neutral-900">
                                        Kanal Warna
                                    </h2>
                                    <Tooltip text="Pilih kanal warna piksel (R/G/B) yang digunakan untuk menyimpan bit pesan. Lebih banyak kanal = kapasitas lebih besar, tapi wajib konsisten saat enkode & dekode." >
                                        <span className="text-neutral-900 cursor-default">
                                            <InfoIcon />
                                        </span>
                                    </Tooltip>
                                    <div className="flex-1 h-px bg-neutral-500" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    {CHANNELS.map((ch) => {
                                        const meta = CHANNEL_META[ch];
                                        const active = config.channels.includes(ch);
                                        return (
                                            <Tooltip key={ch} text={CHANNEL_TOOLTIPS[ch]}>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleChannel(ch)}
                                                    className={`relative flex flex-col items-center py-3 px-2 rounded-sm border-2 transition-all duration-200 w-full
                                                                ${active
                                                            ? `${meta.bg} ${meta.border}`
                                                            : 'border-neutral-300 bg-white hover:border-neutral-400'
                                                        }`}
                                                >
                                                    {active && (
                                                        <span className={`absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center ${meta.bg} ${meta.border} border`}>
                                                            <svg className={`w-2.5 h-2.5 ${meta.color}`} fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </span>
                                                    )}
                                                    <span className={`text-xl font-bold font-mono ${active ? meta.color : 'text-neutral-500'}`}>{ch}</span>
                                                    <span className={`text-xs mt-0.5 ${active ? meta.color : 'text-neutral-500'}`}>{meta.label}</span>
                                                </button>
                                            </Tooltip>
                                        );
                                    })}
                                </div>
                                <p className="text-xs text-neutral-500 mt-3">
                                    {config.channels.length} kanal aktif · kapasitas {config.channels.length}× lebih besar
                                </p>
                            </div>

                            {/* Traversal Mode */}
                            <div className="bg-neutral-50 border border-neutral-900 rounded-sm p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <h2 className="text-sm tracking-widest uppercase font-semibold text-neutral-900">
                                        Pola Traversal
                                    </h2>
                                    <Tooltip text="Urutan pembacaan piksel saat menyisipkan atau mengekstrak bit pesan. Pola yang berbeda menghasilkan distribusi bit yang berbeda — wajib sama antara enkode dan dekode." >
                                        <span className="text-neutral-900 cursor-default">
                                            <InfoIcon />
                                        </span>
                                    </Tooltip>
                                    <div className="flex-1 h-px bg-neutral-500" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {TRAVERSAL_OPTIONS.map(opt => (
                                        <Tooltip key={opt.value} text={TRAVERSAL_TOOLTIPS[opt.value] ?? opt.label}>
                                            <button
                                                onClick={() => setConfig(prev => ({ ...prev, traversal: opt.value }))}
                                                className={`flex items-center gap-4 px-3 py-2.5 rounded-sm text-xs font-semibold w-full
                                                            border-[1.5px] transition-all duration-200 text-left ease-in-out
                                                            ${config.traversal === opt.value
                                                        ? `border-neutral-900 bg-white
                                                        shadow-[-4px_5px_0_rgba(26,26,46,1)] -translate-y-0.5`
                                                        : `border-neutral-300 bg-white hover:border-neutral-500 
                                                        hover:shadow-[-4px_5px_0_rgba(26,26,46,1)] hover:-translate-y-0.5`
                                                    }`}
                                            >
                                                <span className="text-base text-neutral-700 w-6 text-center shrink-0">{opt.icon}</span>
                                                <span className="leading-tight text-neutral-800">{opt.label}</span>
                                            </button>
                                        </Tooltip>
                                    ))}
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="flex items-start gap-2 bg-red-50 border border-red-300 rounded-sm px-4 py-3 text-red-700 text-xs">
                                    <span className="shrink-0 mt-0.5">⚠</span>
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Process Button */}
                            <Tooltip
                                text={
                                    mode === 'encode'
                                        ? 'Mulai proses penyisipan pesan ke dalam piksel gambar menggunakan konfigurasi yang dipilih.'
                                        : 'Mulai proses ekstraksi pesan tersembunyi dari gambar menggunakan konfigurasi yang sama saat enkode.'
                                }
                            >
                                <button
                                    onClick={handleProcess}
                                    disabled={loading || !imageFile || (mode === 'encode' && !message.trim()) || !config.marker.trim()}
                                    className="w-full py-4 rounded-sm font-extrabold text-base tracking-wide
                                            transition-all duration-200 ease-in-out text-neutral-900
                                            bg-neutral-50 border border-neutral-900
                                            hover:shadow-[-6px_7px_0_rgba(26,26,46,1)] hover:-translate-y-0.5
                                            active:translate-y-0 active:shadow-none cursor-pointer
                                            disabled:opacity-40 disabled:cursor-not-allowed
                                            disabled:hover:shadow-none disabled:hover:translate-y-0"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="inline-block w-4 h-4 border-2 border-neutral-400 border-t-neutral-900 rounded-full animate-spin" />
                                            {mode === 'encode' ? 'Menyisipkan...' : 'Mengekstrak...'}
                                        </span>
                                    ) : (
                                        mode === 'encode' ? 'Sisipkan Pesan ke Gambar' : 'Ekstrak Pesan dari Gambar'
                                    )}
                                </button>
                            </Tooltip>
                        </div>
                    </section>

                    {/* ── Results ── */}
                    {(result || decodedMessage !== null) && (
                        <section className="max-w-5xl mx-auto mt-8">
                            <div className="h-px bg-linear-to-r from-transparent via-neutral-400 to-transparent my-6" />

                            {/* Encode Result */}
                            {result && (
                                <div className="bg-neutral-50 border border-neutral-900 rounded-sm p-6">
                                    <div className="inline-flex items-center gap-1.5 bg-green-100 border border-green-600 text-green-700 px-4 py-1.5 rounded-sm text-xs mb-4">
                                        ✓ Pesan berhasil disisipkan
                                    </div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <h2 className="text-sm tracking-widest uppercase font-semibold text-neutral-900">
                                            Gambar Stego (Hasil)
                                        </h2>
                                        <Tooltip text="Gambar ini sudah mengandung pesan tersembunyi. Simpan dalam format PNG agar tidak ada data bit yang hilang akibat kompresi." >
                                            <span className="text-neutral-900 cursor-default">
                                                <InfoIcon />
                                            </span>
                                        </Tooltip>
                                        <div className="flex-1 h-px bg-neutral-500" />
                                    </div>
                                    <div className="relative rounded-sm overflow-hidden border border-neutral-300">
                                        <img src={result} alt="Stego result" className="w-full max-h-72 object-cover block" />
                                    </div>
                                    <Tooltip text="Unduh gambar stego dalam format PNG tanpa kompresi lossy agar pesan tidak rusak.">
                                        <button
                                            onClick={downloadResult}
                                            className="relative mt-3 bg-neutral-50 border border-neutral-900 text-neutral-900
                                                            text-xs font-bold px-4 py-2 rounded-sm backdrop-blur-sm
                                                            transition-all ease-in-out duration-200 cursor-pointer
                                                            hover:shadow-[-4px_5px_0_rgba(26,26,46,1)] hover:-translate-y-0.5"
                                        >
                                            Unduh PNG
                                        </button>
                                    </Tooltip>
                                    <p className="text-xs text-neutral-500 mt-3">
                                        Simpan sebagai PNG untuk mencegah kompresi lossy. ·{' '}
                                        Kanal [{config.channels.join('+')}] · Traversal [{config.traversal}] · Marker [{config.marker}]
                                    </p>
                                </div>
                            )}

                            {/* Decode Result */}
                            {decodedMessage !== null && (
                                <div className="flex flex-col gap-4">
                                    <div className="inline-flex items-center gap-1.5 bg-green-100 border border-green-600 text-green-700 px-4 py-1.5 rounded-sm text-xs">
                                        ✓ Pesan berhasil diekstrak dari {Object.keys(decodedMessage).length} kanal
                                    </div>

                                    {(Object.entries(decodedMessage) as [Channel, string][]).map(([ch, msg]) => {
                                        const meta = CHANNEL_META[ch];
                                        return (
                                            <div
                                                key={ch}
                                                className="bg-neutral-50 border border-neutral-900 rounded-sm p-6"
                                            >
                                                {/* Header kanal */}
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-sm border ${meta.bg} ${meta.border} ${meta.color}`}>
                                                        Kanal {ch}
                                                    </span>
                                                    <h2 className="text-sm tracking-widest uppercase font-semibold text-neutral-900">
                                                        Pesan Tersembunyi
                                                    </h2>
                                                    <Tooltip text={`Pesan yang diekstrak dari kanal ${ch} (${meta.label}) menggunakan konfigurasi traversal dan marker yang dipilih.`}>
                                                        <span className="text-neutral-900 cursor-default">
                                                            <InfoIcon />
                                                        </span>
                                                    </Tooltip>
                                                    <div className="flex-1 h-px bg-neutral-500" />
                                                    <Tooltip text={`Salin pesan dari kanal ${ch} ke clipboard.`}>
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(msg);
                                                                setCopied(true);
                                                                setTimeout(() => setCopied(false), 2000);
                                                            }}
                                                            className="relative bg-neutral-50 border border-neutral-400 text-neutral-600
                                        hover:border-neutral-700 hover:text-neutral-900 text-xs font-semibold px-3 py-1 rounded-sm transition-all"
                                                        >
                                                            {copied ? '✓ Disalin!' : 'Salin'}
                                                        </button>
                                                    </Tooltip>
                                                </div>

                                                {/* Isi pesan */}
                                                <div className={`relative bg-white border rounded-sm p-5 ${meta.border}`}>
                                                    <pre className="text-sm text-neutral-800 whitespace-pre-wrap wrap-break-word leading-relaxed font-mono">
                                                        {msg}
                                                    </pre>
                                                </div>

                                                {/* Info karakter */}
                                                <p className="text-xs text-neutral-500 mt-2">
                                                    {msg.length.toLocaleString()} karakter · Kanal {ch} · Traversal [{config.traversal}]
                                                </p>
                                            </div>
                                        );
                                    })}

                                    {/* Tombol salin semua */}
                                    {Object.keys(decodedMessage).length > 1 && (
                                        <Tooltip text="Salin pesan dari semua kanal sekaligus ke clipboard.">
                                            <button
                                                onClick={copyMessage}
                                                className="self-start bg-neutral-50 border border-neutral-400 text-neutral-600
                            hover:border-neutral-700 hover:text-neutral-900 text-xs font-semibold px-4 py-2 rounded-sm transition-all"
                                            >
                                                {copied ? '✓ Disalin!' : 'Salin Semua Kanal'}
                                            </button>
                                        </Tooltip>
                                    )}
                                </div>
                            )}
                        </section>
                    )}
                </div>
            </main>
        </DashboardLayoutUsers >
    );
}
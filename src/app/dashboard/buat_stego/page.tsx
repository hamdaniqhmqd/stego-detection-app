'use client';

import DashboardLayoutUsers from "@/components/Layouts/DashboardLayoutUsers";
import { Channel } from "@/types/analysis";
import { CHANNEL_META, CHANNELS } from "@/utils/Channel";
import { CHANNEL_INFO, decodeLSB, DEFAULT_MARKER, encodeLSB, Mode, StegoConfig, TRAVERSAL_OPTIONS, TraversalMode } from "@/utils/Stego";
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
    const [decodedMessage, setDecodedMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [dragging, setDragging] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('File harus berupa gambar (PNG, JPG, dll)');
            return;
        }
        setImageFile(file);
        setResult(null);
        setDecodedMessage(null);
        setError(null);
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, []);

    const toggleChannel = (ch: Channel) => {
        setConfig(prev => {
            const has = prev.channels.includes(ch);
            if (has && prev.channels.length === 1) return prev;
            return { ...prev, channels: has ? prev.channels.filter(c => c !== ch) : [...prev.channels, ch] };
        });
    };

    const handleProcess = async () => {
        if (!imageFile) { setError('Pilih gambar terlebih dahulu'); return; }
        if (mode === 'encode' && !message.trim()) { setError('Masukkan pesan yang ingin disisipkan'); return; }
        if (!config.marker.trim()) { setError('Marker tidak boleh kosong'); return; }

        setLoading(true);
        setError(null);
        setResult(null);
        setDecodedMessage(null);

        try {
            if (mode === 'encode') {
                const dataUrl = await encodeLSB(imageFile, message, config);
                setResult(dataUrl);
            } else {
                const msg = await decodeLSB(imageFile, config);
                setDecodedMessage(msg);
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
        navigator.clipboard.writeText(decodedMessage);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <DashboardLayoutUsers>
            <main className="w-full min-h-screen">
                <div className="lg:pb-16 lg:pt-8 sm:pb-10 sm:pt-5">

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
                        <div className="flex gap-4">
                            <button
                                onClick={() => { setMode('encode'); setResult(null); setDecodedMessage(null); setError(null); }}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 
                                    rounded-sm font-bold text-sm border border-neutral-100
                                    transition-all duration-200 
                                    text-left ease-in-out 
                                        hover:shadow-[-6px_7px_0_rgba(26,26,46,1)] hover:-translate-y-0.5
                                    ${mode === 'encode'
                                        ? 'bg-neutral-100 text-neutral-900 border-neutral-900'
                                        : 'text-neutral-900 hover:border-neutral-900'
                                    }`}
                            >
                                Sisipkan Pesan
                            </button>
                            <button
                                onClick={() => { setMode('decode'); setResult(null); setDecodedMessage(null); setError(null); }}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 
                                    rounded-sm font-bold text-sm border border-neutral-100
                                    transition-all duration-200 
                                    text-left ease-in-out 
                                        hover:shadow-[-6px_7px_0_rgba(26,26,46,1)] hover:-translate-y-0.5
                                    ${mode === 'decode'
                                        ? 'bg-neutral-100 text-neutral-900 border-neutral-900'
                                        : 'text-neutral-900 hover:border-neutral-900'
                                    }`}
                            >
                                Ekstrak Pesan
                            </button>
                        </div>
                    </section>

                    {/* Main Grid */}
                    <section className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Left Column */}
                        <div className="flex flex-col gap-5">

                            {/* Image Upload */}
                            <div className="bg-neutral-100 border border-neutral-900 rounded-sm p-6 transition-all duration-300">
                                <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-neutral-900 mb-4">
                                    <span>Gambar Input</span>
                                    <div className="flex-1 h-px bg-neutral-900" />
                                </div>

                                {!imagePreview ? (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        onDrop={handleDrop}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDragEnter={() => setDragging(true)}
                                        onDragLeave={() => setDragging(false)}
                                        className={`border-2 border-dashed rounded-sm p-10 text-center cursor-pointer transition-all duration-300 ${dragging
                                            ? 'border-neutral-400 bg-neutral-500'
                                            : 'border-neutral-500 hover:border-neutral-400 hover:bg-neutral-200'
                                            }`}
                                    >
                                        <div className="text-4xl mb-3 w-full flex justify-center">
                                            <svg className="h-14 w-14 text-neutral-500" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <div className="font-bold text-neutral-800 text-sm mb-1">Drag & drop gambar di sini</div>
                                        <div className="text-xs text-neutral-500">atau klik untuk memilih file</div>
                                    </div>
                                ) : (
                                    <div className="relative rounded-sm overflow-hidden border border-white/10">
                                        <img src={imagePreview} alt="Preview" className="w-full h-52 object-cover block" />
                                        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent px-4 py-3">
                                            <span className="text-xs text-neutral-300">
                                                {imageFile?.name} · {(imageFile!.size / 1024).toFixed(1)} KB
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute top-3 right-3 bg-black/60 border border-white/15 text-white text-xs px-3 py-1 rounded-sm font-semibold hover:bg-black/80 transition-colors"
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

                            {/* Custom Marker */}
                            <div className="bg-neutral-100 border border-neutral-900 rounded-sm p-6 transition-all duration-300">
                                <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-neutral-900 mb-4">
                                    <span>End Marker</span>
                                    <div className="flex-1 h-px bg-neutral-900" />
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={config.marker}
                                        onChange={(e) => setConfig(prev => ({ ...prev, marker: e.target.value }))}
                                        placeholder={DEFAULT_MARKER}
                                        className="flex-1 bg-neutral-100 border border-neutral-600 rounded-sm text-neutral-800 px-4 py-2.5 text-sm 
                                        outline-none placeholder-neutral-600 focus:border-neutral-800 transition-colors"
                                    />
                                    <button
                                        onClick={() => setConfig(prev => ({ ...prev, marker: DEFAULT_MARKER }))}
                                        title="Reset ke default"
                                        className="shrink-0 bg-neutral-100 px-3 py-2.5 text-xs
                                        border border-neutral-900 text-neutral-900 rounded-sm font-semibold 
                                        transition-all ease-in-out hover:shadow-[-5px_5px_0_rgba(26,26,46,1)] hover:-translate-y-0.5
                                        "
                                    >
                                        Reset
                                    </button>
                                </div>
                                <p className="text-xs text-neutral-800 mt-3 leading-relaxed">
                                    Marker menandai akhir pesan. Gunakan marker yang sama saat enkripsi & dekripsi.
                                    Marker unik menambah lapisan keamanan ekstra.
                                </p>
                            </div>

                            {/* Message Input (encode only) */}
                            {mode === 'encode' && (
                                <div className="bg-neutral-100 border border-neutral-900 rounded-sm p-6 transition-all duration-300">
                                    <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-neutral-900 mb-4">
                                        <span>Pesan Rahasia</span>
                                        <div className="flex-1 h-px bg-neutral-900" />
                                    </div>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        rows={4}
                                        placeholder="Masukkan pesan yang ingin disembunyikan dalam gambar..."
                                        className="w-full bg-neutral-100 border border-neutral-600 rounded-sm text-neutral-800 px-4 py-2.5 text-sm 
                                        outline-none placeholder-neutral-600 focus:border-neutral-800 transition-colors"
                                    />
                                    <div className="text-right text-xs text-neutral-800 mt-2">
                                        {message.length} karakter
                                    </div>
                                </div>
                            )}

                            {/* Decode Info */}
                            {mode === 'decode' && (
                                <div className="bg-neutral-100 border border-neutral-900 rounded-sm p-6 transition-all duration-300">
                                    <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-neutral-900 mb-4">
                                        <span>Informasi Dekode</span>
                                        <div className="flex-1 h-px bg-neutral-900" />
                                    </div>
                                    <p className="text-sm text-neutral-800 leading-relaxed">
                                        Pastikan konfigurasi{' '}
                                        <strong className="text-neutral-950">kanal</strong>,{' '}
                                        <strong className="text-neutral-950">pola traversal</strong>, dan{' '}
                                        <strong className="text-neutral-950">marker</strong>{' '}
                                        sama dengan yang digunakan saat menyisipkan pesan. Jika tidak cocok,
                                        pesan tidak akan bisa diekstrak.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Right Column */}
                        <div className="flex flex-col gap-5">

                            {/* Channel Selector */}
                            <div className="bg-neutral-100 border border-neutral-900 rounded-sm p-6 transition-all duration-300">
                                <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-neutral-900 mb-4">
                                    <span>Kanal Warna</span>
                                    <div className="flex-1 h-px bg-neutral-900" />
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {CHANNELS.map((ch) => {
                                        const meta = CHANNEL_META[ch]
                                        const active = config.channels.includes(ch)
                                        return (
                                            <button
                                                key={ch}
                                                type="button"
                                                onClick={() => toggleChannel(ch)}
                                                className={`relative flex flex-col items-center py-3 px-2 rounded-sm border transition-all duration-200
                                                                        ${active
                                                        ? `${meta.bg} ${meta.border} shadow-sm`
                                                        : 'border-neutral-400 bg-neutral-100'
                                                    }`}
                                            >
                                                {active && (
                                                    <span className={`absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center ${meta.bg} ${meta.border} border`}>
                                                        <svg className={`w-2.5 h-2.5 ${meta.color}`} fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </span>
                                                )}
                                                <span className={`text-xl font-bold font-mono ${active ? meta.color : 'text-neutral-700'}`}>{ch}</span>
                                                <span className={`text-xs mt-0.5 ${active ? meta.color : 'text-neutral-700'}`}>{meta.label}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                                <p className="text-xs text-neutral-600 mt-3">
                                    {config.channels.length} kanal aktif
                                </p>
                            </div>

                            {/* Traversal Mode */}
                            <div className="bg-neutral-100 border border-neutral-900 rounded-sm p-6 transition-all duration-300">
                                <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-neutral-500 mb-4">
                                    <span>Pola Traversal</span>
                                    <div className="flex-1 h-px bg-white/5" />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {TRAVERSAL_OPTIONS.map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setConfig(prev => ({ ...prev, traversal: opt.value }))}
                                            className={`flex items-center gap-2 px-3 py-2.5 
                                                rounded-sm text-xs font-semibold 
                                                border-[1.5px] transition-all duration-200 text-left ease-in-out 
                                                hover:shadow-[-4px_5px_0_rgba(26,26,46,1)] hover:-translate-y-0.5
                                                ${config.traversal === opt.value
                                                    ? 'border-neutral-900 bg-neutral-100 shadow-md'
                                                    : 'border-neutral-400 bg-neutral-100'
                                                }`}
                                        >
                                            <span className="text-base text-neutral-900 w-6 text-center shrink-0">
                                                {opt.icon}
                                            </span>
                                            <span className="leading-tight text-neutral-900">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/25 rounded-sm px-4 py-3 text-red-300 text-xs">
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Process Button */}
                            <button
                                onClick={handleProcess}
                                disabled={loading || !imageFile || (mode === 'encode' && !message.trim())}
                                className="w-full py-4 rounded-sm font-extrabold text-base tracking-wide 
                                transition-all duration-300 ease-in-out text-neutral-900
                                disabled:bg-neutral-200 disabled:text-neutral-600 disabled:cursor-not-allowed 
                                bg-neutral-100 border border-neutral-900 p-6 active:translate-y-0
                                hover:shadow-[-6px_7px_0_rgba(26,26,46,1)] hover:-translate-y-0.5
                                "
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="inline-block w-4 h-4 border-2 border-neutral-900 border-t-neutral-100 rounded-full animate-spin" />
                                        {mode === 'encode' ? 'Menyisipkan...' : 'Mengekstrak...'}
                                    </span>
                                ) : (
                                    mode === 'encode' ? 'Sisipkan Pesan ke Gambar' : 'Ekstrak Pesan dari Gambar'
                                )}
                            </button>
                        </div>
                    </section>

                    {/* Result Section */}
                    {(result || decodedMessage) && (
                        <section className="max-w-5xl mx-auto mt-8">
                            <div className="h-0.5 bg-linear-to-r from-transparent via-neutral-950 to-transparent my-6" />

                            {result && (
                                <div className="bg-neutral-100 border border-neutral-900 rounded-sm p-6 transition-all duration-300">
                                    <div className="inline-flex items-center gap-1.5 
                                        bg-green-200 border border-green-700 text-green-700 px-4 py-1.5 
                                        rounded-sm text-xs mb-4">
                                        Pesan berhasil disisipkan
                                    </div>
                                    <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-neutral-900 mb-4">
                                        <span>Gambar Stego (Hasil)</span>
                                        <div className="flex-1 h-px bg-neutral-900" />
                                    </div>
                                    <div className="relative rounded-sm overflow-hidden border border-neutral-500 shadow-lg shadow-neutral-300">
                                        <img src={result} alt="Stego result" className="w-full max-h-72 object-cover block" />
                                        <button
                                            onClick={downloadResult}
                                            className="absolute bottom-4 right-4 flex items-center gap-1.5 
                                            bg-neutral-100 border border-neutral-900 text-neutral-900 
                                            text-xs font-bold px-4 py-2 rounded-sm backdrop-blur-sm shadow-md 
                                            transition-all ease-in-out duration-200
                                            hover:shadow-[-4px_5px_0_rgba(26,26,46,1)] hover:-translate-y-0.5"
                                        >
                                            Unduh PNG
                                        </button>
                                    </div>
                                    <p className="text-xs text-neutral-700 mt-3">
                                        Simpan sebagai PNG untuk mencegah kompresi lossy.
                                        Kanal [{config.channels.join('+')}] · Traversal [{config.traversal}] · Marker [{config.marker}].
                                    </p>
                                </div>
                            )}

                            {decodedMessage !== null && (
                                <div className="bg-neutral-100 border border-neutral-900 rounded-sm p-6 transition-all duration-300">
                                    <div className="inline-flex items-center gap-1.5 bg-green-500/10 border border-green-500/25 text-green-300 px-3.5 py-1.5 rounded-full text-xs mb-4">
                                        <span>✓</span> Pesan berhasil diekstrak
                                    </div>
                                    <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-neutral-500 mb-4">
                                        <span>Pesan Tersembunyi</span>
                                        <div className="flex-1 h-px bg-white/5" />
                                    </div>
                                    <div className="relative bg-black/50 border border-green-500/20 rounded-sm p-5">
                                        <button
                                            onClick={copyMessage}
                                            className="absolute top-4 right-4 bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:border-white/20 text-xs font-semibold px-3 py-1 rounded-sm transition-all"
                                        >
                                            {copied ? '✓ Disalin!' : 'Salin'}
                                        </button>
                                        <pre className="text-sm text-green-100 whitespace-pre-wrap wrap-break-words leading-relaxed">
                                            {decodedMessage}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </section>
                    )}
                </div>
            </main >
        </DashboardLayoutUsers >
    );
}
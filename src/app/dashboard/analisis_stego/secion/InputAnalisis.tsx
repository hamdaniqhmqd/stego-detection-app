'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type {
    Channel,
    TeknikArah,
    DecodeTeknik,
    Analysis,
    AnalysisResult,
} from '@/types/analysis'
import { TEKNIK_LABEL } from '@/types/analysis'
import { AuthUser } from '@/types/Users'
import { CHANNEL_META, CHANNELS, TEKNIK_KEYS } from '@/utils/Channel'

// Props
interface InputAnalisisProps {
    // Mode normal (halaman analisis baru)
    user?: AuthUser
    onLoading?: (loading: boolean, step: string) => void
    onResult?: (result: AnalysisResult) => void

    // Mode readOnly (halaman detail — semua input disabled)
    readOnly?: boolean
    readOnlyData?: {
        analysis: Analysis
        previewUrl?: string
        selectedChannels?: Set<Channel>
        selectedTeknik?: Set<TeknikArah>
        useAI?: boolean
    }
}

export default function InputAnalisis({
    user,
    onLoading,
    onResult,
    readOnly = false,
    readOnlyData,
}: InputAnalisisProps) {
    const router = useRouter()

    // State

    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string>(readOnlyData?.analysis.file_path ?? '')

    const [selectedChannels, setSelectedChannels] = useState<Set<Channel>>(
        readOnlyData?.selectedChannels ?? new Set(['R', 'G', 'B'])
    )
    const [selectedTeknik, setSelectedTeknik] = useState<Set<TeknikArah>>(
        readOnlyData?.selectedTeknik ?? new Set(TEKNIK_KEYS)
    )
    const [useAI, setUseAI] = useState<boolean>(readOnlyData?.useAI ?? false)
    const [isAnalyzing, setIsAnalyzing] = useState(false)

    // Helpers
    const toggleChannel = (ch: Channel) => {
        if (readOnly) return
        setSelectedChannels((prev) => {
            const next = new Set(prev)
            if (next.has(ch)) {
                if (next.size === 1) return prev
                next.delete(ch)
            } else {
                next.add(ch)
            }
            return next
        })
    }

    const toggleTeknik = (t: TeknikArah) => {
        if (readOnly) return
        setSelectedTeknik((prev) => {
            const next = new Set(prev)
            if (next.has(t)) {
                if (next.size === 1) return prev
                next.delete(t)
            } else {
                next.add(t)
            }
            return next
        })
    }

    const buildKombinasi = (): DecodeTeknik[] => {
        const list: DecodeTeknik[] = []
        for (const channel of CHANNELS) {
            if (!selectedChannels.has(channel)) continue
            for (const arah of TEKNIK_KEYS) {
                if (!selectedTeknik.has(arah)) continue
                list.push({ channel, arah })
            }
        }
        return list
    }

    const totalKombinasi = selectedChannels.size * selectedTeknik.size

    // Image handlers
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (readOnly) return
        const file = e.target.files?.[0]
        if (file) loadFile(file)
    }

    const handleDragOver = (e: React.DragEvent) => {
        if (readOnly) return
        e.preventDefault()
        e.stopPropagation()
    }

    const handleDrop = (e: React.DragEvent) => {
        if (readOnly) return
        e.preventDefault()
        e.stopPropagation()
        const file = e.dataTransfer.files?.[0]
        if (file && file.type.startsWith('image/')) loadFile(file)
    }

    const loadFile = (file: File) => {
        setSelectedImage(file)
        const reader = new FileReader()
        reader.onloadend = () => setPreviewUrl(reader.result as string)
        reader.readAsDataURL(file)
    }

    const handleReset = () => {
        if (readOnly) return
        setSelectedImage(null)
        setPreviewUrl('')
        setSelectedChannels(new Set(['R', 'G', 'B']))
        setSelectedTeknik(new Set(TEKNIK_KEYS))
        setUseAI(false)
    }

    // Analyze flow
    const handleAnalyze = async () => {
        if (readOnly || !selectedImage || !user) return

        setIsAnalyzing(true)
        onLoading?.(true, 'Mengunggah gambar...')

        try {
            const kombinasi = buildKombinasi()

            // 1. Upload gambar
            const fd = new FormData()
            fd.append('file', selectedImage)
            const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd })
            if (!uploadRes.ok) throw new Error(await uploadRes.text())
            const img = await uploadRes.json()
            console.log("Image uploaded:", img)

            // 2. Buat record analysis
            onLoading?.(true, 'Membuat record analisis...')
            const analysisRes = await fetch('/api/analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    file_path: img.url,
                    metode: 'force-decode',
                    teknik: kombinasi,
                    interpretasi_ai: useAI,
                }),
            })
            if (!analysisRes.ok) throw new Error(await analysisRes.text())
            const analysis = await analysisRes.json()

            // 3. Force decode
            onLoading?.(true, `Menjalankan force decode (${totalKombinasi} kombinasi)...`)
            const forceRes = await fetch('/api/force-decode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    analysis_id: analysis.id,
                    image_url: img.url,
                    teknik: kombinasi,
                }),
            })
            if (!forceRes.ok) throw new Error(await forceRes.text())
            const forceDecode = await forceRes.json()

            // 4. Jika useAI → kirim semua ke AI
            if (useAI && forceDecode.decoded_raw?.length) {
                onLoading?.(true, 'AI menganalisis semua hasil...')
                const aiRes = await fetch('/api/ai-interpretation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        analysis_id: analysis.id,
                        force_decode_id: forceDecode.id,
                        selected_items: forceDecode.decoded_raw,
                    }),
                })
                if (!aiRes.ok) throw new Error(await aiRes.text())
            }

            // Selesai → push ke detail page
            onLoading?.(false, '')
            router.push(`/dashboard/analisis_stego/${analysis.id}`)

        } catch (err: any) {
            alert(`Error: ${err.message}`)
            onLoading?.(false, '')
        } finally {
            setIsAnalyzing(false)
        }
    }

    // Render

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-w-7xl mx-auto">

            {/* Kiri: Upload Gambar */}
            <div className="bg-gray-900 rounded-md shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-normal text-gray-50">{
                        readOnly ? 'Preview Gambar' : 'Unggah Gambar'}
                    </h2>
                    {readOnly && (
                        <span className="text-xs px-2 py-0.5 rounded border border-gray-700 text-gray-500 font-mono">
                            readonly
                        </span>
                    )}
                </div>

                <div
                    className={`border-2 border-dashed border-gray-800 rounded-xl p-4 text-center transition-all duration-200 bg-gray-950
                        ${readOnly
                            ? 'cursor-default'
                            : 'hover:border-gray-700 hover:bg-gray-900 cursor-pointer group'
                        }`}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => !readOnly && document.getElementById('fileInput')?.click()}
                >
                    {previewUrl ? (
                        <div className="relative w-full h-72">
                            <img
                                src={previewUrl || ''}
                                alt="Preview"
                                className="w-full h-full object-contain rounded-xl"
                            />
                            {!readOnly && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleReset() }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg hover:scale-110 transform duration-200"
                                    title="Hapus gambar"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="py-8">
                            <div className="mb-4 flex justify-center">
                                <div className={`p-4 bg-gray-800 rounded-full ${!readOnly ? 'group-hover:bg-gray-700' : ''} transition-colors`}>
                                    <svg className="h-14 w-14 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                            {readOnly ? (
                                <p className="text-sm text-gray-600 italic">Tidak ada pratinjau gambar</p>
                            ) : (
                                <>
                                    <p className="text-base text-gray-500 mb-2">
                                        <span className="font-semibold text-gray-400">Klik untuk upload</span> atau drag and drop
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Direkomendasikan format <strong className="text-gray-500">PNG</strong>
                                    </p>
                                    <p className="text-xs text-gray-700 mt-1">(Maksimal 5MB)</p>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <input
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={readOnly}
                    className="hidden"
                />

                {/* Info metadata di mode readOnly */}
                {readOnly && readOnlyData?.analysis && (
                    <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-700 space-y-1.5">
                        <p className="text-xs text-gray-500">
                            <span className="text-gray-400">ID Analisis:</span>{' '}
                            <span className="font-mono text-gray-300 break-all">{readOnlyData.analysis.id}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                            <span className="text-gray-400">Dibuat:</span>{' '}
                            {new Date(readOnlyData.analysis.created_at).toLocaleString('id-ID', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                            })}
                        </p>
                        {readOnlyData.analysis.waktu_proses && (
                            <p className="text-xs text-gray-500">
                                <span className="text-gray-400">Waktu Proses:</span>{' '}
                                {readOnlyData.analysis.waktu_proses}
                            </p>
                        )}
                    </div>
                )}

                {/* Info file di mode normal */}
                {!readOnly && selectedImage && (
                    <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
                        <p className="text-sm font-medium text-gray-200 truncate">{selectedImage.name}</p>
                        <div className="flex gap-4 mt-1">
                            <p className="text-xs text-gray-500">
                                <span className="text-gray-400">Ukuran:</span> {(selectedImage.size / 1024).toFixed(2)} KB
                            </p>
                            <p className="text-xs text-gray-500">
                                <span className="text-gray-400">Tipe:</span> {selectedImage.type}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Kanan: Konfigurasi Analisis */}
            <div className={`bg-gray-900 rounded-md shadow-lg p-6 flex flex-col gap-5 ${readOnly ? 'opacity-60 pointer-events-none select-none' : ''}`}>

                {/* Pilih Channel */}
                <div>
                    <h2 className="text-base font-normal text-gray-50 mb-3">
                        Pilih Channel
                        <span className="ml-2 text-xs text-gray-500">({selectedChannels.size} dipilih)</span>
                    </h2>
                    <div className="grid grid-cols-3 gap-2">
                        {CHANNELS.map((ch) => {
                            const meta = CHANNEL_META[ch]
                            const active = selectedChannels.has(ch)
                            return (
                                <button
                                    key={ch}
                                    type="button"
                                    onClick={() => toggleChannel(ch)}
                                    disabled={readOnly}
                                    className={`relative flex flex-col items-center py-3 px-2 rounded-md border-2 transition-all duration-200
                                        ${active
                                            ? `${meta.bg} ${meta.border} shadow-md`
                                            : 'border-gray-800 bg-gray-950'
                                        }`}
                                >
                                    {active && (
                                        <span className={`absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center ${meta.bg} ${meta.border} border`}>
                                            <svg className={`w-2.5 h-2.5 ${meta.color}`} fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </span>
                                    )}
                                    <span className={`text-xl font-bold font-mono ${active ? meta.color : 'text-gray-600'}`}>{ch}</span>
                                    <span className={`text-xs mt-0.5 ${active ? 'text-gray-400' : 'text-gray-700'}`}>{meta.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Pilih Teknik */}
                <div>
                    <h2 className="text-base font-normal text-gray-50 mb-3">
                        Pilih Teknik Ekstraksi
                        <span className="ml-2 text-xs text-gray-500">({selectedTeknik.size} dipilih)</span>
                    </h2>
                    <div className="space-y-2">
                        {TEKNIK_KEYS.map((arah, idx) => {
                            const active = selectedTeknik.has(arah)
                            return (
                                <button
                                    key={arah}
                                    type="button"
                                    onClick={() => toggleTeknik(arah)}
                                    disabled={readOnly}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md border-2 transition-all duration-200 text-left
                                        ${active
                                            ? 'border-gray-500 bg-gray-950 shadow-md'
                                            : 'border-gray-800 bg-gray-950'
                                        }`}
                                >
                                    <span className={`shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center
                                        ${active ? 'bg-gray-500 border-gray-500' : 'border-gray-600'}`}>
                                        {active && (
                                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </span>
                                    <span className="flex-1">
                                        <span className={`text-xs font-mono ${active ? 'text-gray-400' : 'text-gray-600'} mr-2`}>T{idx + 1}</span>
                                        <span className={`text-sm ${active ? 'text-gray-200' : 'text-gray-600'}`}>{TEKNIK_LABEL[arah]}</span>
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Interpretasi AI */}
                <div>
                    <h2 className="text-base font-normal text-gray-50 mb-3">Interpretasi dengan AI?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {([true, false] as const).map((val) => {
                            const active = useAI === val
                            return (
                                <button
                                    key={String(val)}
                                    type="button"
                                    onClick={() => !readOnly && setUseAI(val)}
                                    disabled={readOnly}
                                    className={`flex items-center gap-2 px-4 py-3 rounded-md border-2 transition-all duration-200
                                        ${active
                                            ? 'border-gray-500 bg-gray-950 shadow-md'
                                            : 'border-gray-800 bg-gray-950'
                                        }`}
                                >
                                    <span className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center
                                        ${active ? 'border-gray-400' : 'border-gray-600'}`}>
                                        {active && <span className="w-2 h-2 rounded-full bg-gray-400" />}
                                    </span>
                                    <span className={`text-sm font-medium ${active ? 'text-gray-200' : 'text-gray-600'}`}>
                                        {val ? 'Ya, pakai AI' : 'Tidak, decode saja'}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Info kombinasi */}
                <div className="px-4 py-2.5 rounded-lg bg-gray-950 border border-gray-800 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Total kombinasi yang dijalankan</span>
                    <span className="text-sm font-mono font-bold text-gray-300">{totalKombinasi} kombinasi</span>
                </div>

                {/* Tombol Analisa / Mode Detail */}
                <button
                    onClick={handleAnalyze}
                    disabled={readOnly || !selectedImage || isAnalyzing}
                    className={`w-full py-3 px-4 rounded-xl font-semibold text-white text-base transition-all duration-200 shadow-lg
                        ${readOnly
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed shadow-none'
                            : !selectedImage || isAnalyzing
                                ? 'bg-gray-800 text-gray-600 cursor-not-allowed shadow-none'
                                : 'bg-gray-600 hover:bg-gray-500 active:scale-95 hover:shadow-xl cursor-pointer'
                        }`}
                >
                    {readOnly ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Mode Lihat Detail
                        </span>
                    ) : isAnalyzing ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            Menganalisis...
                        </span>
                    ) : (
                        'Analisa Gambar'
                    )}
                </button>
            </div>
        </div>
    )
}
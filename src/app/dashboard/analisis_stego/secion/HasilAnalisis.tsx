// src/app/dashboard/analisis_stego/secion/HasilAnalisis.tsx
'use client'

import { useState } from 'react'
import type {
    AnalysisResult,
    Channel,
    DecodedBitItem,
    DecodedRawItem,
    HasilInterpretasi,
} from '@/types/analysis'
import { CH_STYLE, CHANNELS } from '@/utils/Channel'
import DecodeCard from './DecodeCard'

function itemKey(item: DecodedRawItem) {
    return `${item.channel}__${item.arah}`
}

interface HasilAnalisisProps {
    result: AnalysisResult
}

export default function HasilAnalisis({ result }: HasilAnalisisProps) {
    const { analysis, forceDecode, aiInterpretasi } = result

    // Guard: forceDecode bisa null di detail page jika belum selesai proses
    if (!forceDecode) return null

    const decodedItems: DecodedRawItem[] = forceDecode.decoded_raw ?? []
    const decodedBits: DecodedBitItem[] = forceDecode.decoded_bit ?? []

    // Cari bit item yang bersesuaian dengan raw item
    const getBitItem = (item: DecodedRawItem): DecodedBitItem | undefined =>
        decodedBits.find((b) => b.channel === item.channel && b.arah === item.arah)

    // Multi-select untuk interpretasi AI
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
    const [isInterpreting, setIsInterpreting] = useState(false)
    const [interpretingKeys, setInterpretingKeys] = useState<Set<string>>(new Set())
    const [localAIResults, setLocalAIResults] = useState<HasilInterpretasi[]>(
        aiInterpretasi?.hasil ?? []
    )

    // Helpers
    const toggleSelect = (item: DecodedRawItem) => {
        const key = itemKey(item)
        setSelectedKeys((prev) => {
            const next = new Set(prev)
            next.has(key) ? next.delete(key) : next.add(key)
            return next
        })
    }

    const toggleSelectAll = () => {
        if (selectedKeys.size === decodedItems.length) {
            setSelectedKeys(new Set())
        } else {
            setSelectedKeys(new Set(decodedItems.map(itemKey)))
        }
    }

    const getInterpretation = (item: DecodedRawItem): HasilInterpretasi | undefined =>
        localAIResults.find((r) => r.channel === item.channel && r.arah === item.arah)

    // Interpretasi AI untuk yang dipilih
    const handleInterpretSelected = async () => {
        if (selectedKeys.size === 0) return

        const itemsToInterpret = decodedItems.filter((i) => selectedKeys.has(itemKey(i)))
        const keys = new Set(itemsToInterpret.map(itemKey))

        setIsInterpreting(true)
        setInterpretingKeys(keys)

        try {
            const res = await fetch('/api/ai-interpretation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    analysis_id: analysis.id,
                    force_decode_id: forceDecode.id,
                    selected_items: itemsToInterpret,
                }),
            })
            if (!res.ok) throw new Error(await res.text())
            const data = await res.json()

            // Gabungkan hasil baru dengan yang sudah ada
            const newHasil: HasilInterpretasi[] = data.hasil ?? []
            setLocalAIResults((prev) => {
                const merged = [...prev]
                for (const item of newHasil) {
                    const idx = merged.findIndex(
                        (r) => r.channel === item.channel && r.arah === item.arah
                    )
                    if (idx >= 0) merged[idx] = item
                    else merged.push(item)
                }
                return merged
            })

            setSelectedKeys(new Set())
        } catch (err: any) {
            alert(`Gagal interpretasi AI: ${err.message}`)
        } finally {
            setIsInterpreting(false)
            setInterpretingKeys(new Set())
        }
    }

    // ─── Grup items per channel ──────────────────────────────────────────────

    const grouped: Record<Channel, DecodedRawItem[]> = { R: [], G: [], B: [] }
    for (const item of decodedItems) grouped[item.channel].push(item)

    const allSelected = selectedKeys.size === decodedItems.length && decodedItems.length > 0
    const someSelected = selectedKeys.size > 0

    return (
        <div className="max-w-7xl mx-auto mt-3 space-y-4">

            {/* ── Header ── */}
            <div className="bg-gray-900 rounded-xl px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1">
                    <h2 className="text-base font-normal text-gray-50">Hasil Analisis</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {decodedItems.length} kombinasi &nbsp;·&nbsp;
                        Metode: <span className="text-gray-400">force-decode</span> &nbsp;·&nbsp;
                        {forceDecode.waktu_proses && (
                            <>Waktu: <span className="text-gray-400">{forceDecode.waktu_proses}</span></>
                        )}
                    </p>
                </div>

                {/* Action bar */}
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        type="button"
                        onClick={toggleSelectAll}
                        className="text-xs px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200 transition-colors"
                    >
                        {allSelected ? 'Batal Semua' : 'Pilih Semua'}
                    </button>

                    {someSelected && (
                        <button
                            type="button"
                            onClick={handleInterpretSelected}
                            disabled={isInterpreting}
                            className={`text-xs px-4 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5
                                ${isInterpreting
                                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                    : 'bg-gray-600 hover:bg-gray-500 text-white'
                                }`}
                        >
                            {isInterpreting ? (
                                <>
                                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Menganalisis...
                                </>
                            ) : (
                                <>
                                    Interpretasi AI
                                    <span className="bg-gray-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
                                        {selectedKeys.size}
                                    </span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* ── Grid 3 kolom per channel ── */}
            <div className="grid grid-cols-1 gap-3">
                {CHANNELS.map((ch) => {
                    const items = grouped[ch]
                    const style = CH_STYLE[ch]
                    if (items.length === 0) return null

                    return (
                        <div key={ch} className="flex flex-col gap-2">
                            {/* Column header */}
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 border ${style.header}`}>
                                <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                                <span className={`text-xs font-mono font-bold ${style.badge.split(' ')[1]}`}>
                                    Channel {ch}
                                </span>
                                <span className="text-xs text-gray-600 ml-auto">{items.length} teknik</span>
                            </div>

                            {/* Cards */}
                            {items.map((item, idx) => (
                                <DecodeCard
                                    key={itemKey(item)}
                                    item={item}
                                    bitItem={getBitItem(item)}
                                    index={idx}
                                    isSelected={selectedKeys.has(itemKey(item))}
                                    onToggleSelect={() => toggleSelect(item)}
                                    interpretation={getInterpretation(item)}
                                    isInterpretingThis={interpretingKeys.has(itemKey(item))}
                                />
                            ))}
                        </div>
                    )
                })}
            </div>

            {/* ── Info pilih untuk AI (jika belum ada yang dipilih & belum ada AI result) ── */}
            {!someSelected && localAIResults.length === 0 && (
                <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-gray-900 border border-gray-800">
                    <svg className="h-4 w-4 text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-gray-500">
                        Centang card yang ingin diinterpretasi AI, lalu klik <span className="text-gray-400">Interpretasi AI</span>.
                    </p>
                </div>
            )}
        </div>
    )
}
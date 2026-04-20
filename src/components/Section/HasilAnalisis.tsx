// src/app/dashboard/analisis_stego/secion/HasilAnalisis.tsx
'use client'

import { useState } from 'react'
import type { AnalysisResult, HasilInterpretasi } from '@/types/analysis'
import { CHANNEL_COLOR, ANCAMAN_STYLE } from '@/utils/Channel'
import DecodeCard from '../Card/DecodeCard'
import { DecodedRawItem, DecodedBitItem, TEKNIK_LABEL, type TeknikArah, type Channel } from '@/types/shared'
import { buildTeknikStatusMap, makeTeknikKey, type TeknikStatusMap } from '@/hooks/useInterpretasiAI'
import { Tooltip } from '@/components/Ui/ToolTip'
import { StatusAncaman } from '@/types/aiInterpretasi'
import { methodToBitItem, methodToRawItem } from '@/utils/forceDecode/method'
import { processAIInterpretation } from '@/services/aiService'

interface HasilAnalisisProps {
    result: AnalysisResult
}

function useAccordion(keys: TeknikArah[]) {
    const [openSet, setOpenSet] = useState<Set<TeknikArah>>(() => new Set(keys))
    const toggle = (arah: TeknikArah) =>
        setOpenSet(prev => {
            const next = new Set(prev)
            next.has(arah) ? next.delete(arah) : next.add(arah)
            return next
        })
    const isOpen = (arah: TeknikArah) => openSet.has(arah)
    return { toggle, isOpen }
}

export default function HasilAnalisis({ result }: HasilAnalisisProps) {
    const { analysis, forceDecode, methodForceDecodes, aiInterpretasi } = result

    if (!forceDecode) return null

    // Sumber data: prioritaskan methodForceDecodes
    const decodedItems: DecodedRawItem[] = methodForceDecodes && methodForceDecodes.length > 0
        ? methodForceDecodes.map(methodToRawItem).filter((x): x is DecodedRawItem => x !== null)
        : []

    const decodedBits: DecodedBitItem[] = methodForceDecodes && methodForceDecodes.length > 0
        ? methodForceDecodes.map(methodToBitItem).filter((x): x is DecodedBitItem => x !== null)
        : []

    const getBitItem = (item: DecodedRawItem): DecodedBitItem | undefined =>
        decodedBits.find((b) => b.channel === item.channel && b.arah === item.arah)

    // Build teknikByArah
    const teknikByArah = new Map<TeknikArah, Channel[]>()
    for (const t of (analysis.teknik ?? [])) {
        const existing = teknikByArah.get(t.arah)
        if (existing) {
            if (!existing.includes(t.channel)) existing.push(t.channel)
        } else {
            teknikByArah.set(t.arah, [t.channel])
        }
    }
    if (teknikByArah.size === 0) {
        for (const r of decodedItems) {
            const existing = teknikByArah.get(r.arah)
            if (existing) {
                if (!existing.includes(r.channel)) existing.push(r.channel)
            } else {
                teknikByArah.set(r.arah, [r.channel])
            }
        }
    }

    const arahKeys = [...teknikByArah.keys()]
    const { toggle: toggleAccordion, isOpen } = useAccordion(arahKeys)

    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
    const [isInterpreting, setIsInterpreting] = useState(false)
    const [interpretingKeys, setInterpretingKeys] = useState<Set<string>>(new Set())
    const [localAIResults, setLocalAIResults] = useState<HasilInterpretasi[]>(
        aiInterpretasi?.hasil ?? []
    )

    const teknikMap: TeknikStatusMap = localAIResults.length > 0
        ? buildTeknikStatusMap(localAIResults as any)
        : {} as TeknikStatusMap

    const isInterpreted = (item: DecodedRawItem): boolean =>
        localAIResults.some(r => r.channel === item.channel && r.arah === item.arah)

    const selectableItems = decodedItems.filter(i => !isInterpreted(i))

    const toggleSelect = (item: DecodedRawItem) => {
        if (isInterpreted(item)) return
        const key = `${item.channel}__${item.arah}`
        setSelectedKeys(prev => {
            const next = new Set(prev)
            next.has(key) ? next.delete(key) : next.add(key)
            return next
        })
    }

    const toggleSelectAll = () => {
        setSelectedKeys(
            selectedKeys.size === selectableItems.length && selectableItems.length > 0
                ? new Set()
                : new Set(selectableItems.map(
                    item => `${item.channel}__${item.arah}`,
                ))
        )
    }

    const getInterpretation = (item: DecodedRawItem): HasilInterpretasi | undefined =>
        localAIResults.find(r => r.channel === item.channel && r.arah === item.arah)

    const handleInterpretSelected = async () => {
        if (selectedKeys.size === 0) return
        const itemsToInterpret = decodedItems.filter(i => selectedKeys.has(
            `${i.channel}__${i.arah}`,
        ))
        const keys = new Set(itemsToInterpret.map(
            item => `${item.channel}__${item.arah}`,
        ))
        setIsInterpreting(true)
        setInterpretingKeys(keys)
        try {
            // Gunakan processAIInterpretation dari aiService
            const newHasil = await processAIInterpretation(
                analysis.id,
                forceDecode.id,
                itemsToInterpret,
            )

            setLocalAIResults(prev => {
                const merged = [...prev]
                for (const item of newHasil) {
                    const idx = merged.findIndex(r => r.channel === item.channel && r.arah === item.arah)
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

    const allSelectableSelected = selectableItems.length > 0 && selectedKeys.size === selectableItems.length
    const someSelected = selectedKeys.size > 0

    // Indikator sumber data
    const usingMethodTable = methodForceDecodes && methodForceDecodes.length > 0

    return (
        <div className="max-w-7xl mx-auto mt-3 space-y-4">

            {/* Header */}
            <div className="bg-neutral-100 rounded-sm px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3
                border border-neutral-900">
                <div className="flex-1">
                    <h2 className="text-base font-normal text-neutral-900">Hasil Analisis</h2>
                    <p className="text-xs text-neutral-600 mt-0.5 flex items-center gap-1 flex-wrap">
                        <Tooltip text="Jumlah kombinasi channel × arah scan yang diekstrak dan ditampilkan di bawah.">
                            <span className="cursor-default underline decoration-dotted decoration-neutral-400">
                                {decodedItems.length} kombinasi
                            </span>
                        </Tooltip>
                        <span>&nbsp;·&nbsp;</span>
                        <Tooltip text="Force-decode: semua kombinasi channel dan arah diekstrak secara paksa tanpa memerlukan parameter tersembunyi dari pengirim.">
                            <span className="cursor-default">
                                Metode: <span className="text-neutral-800 font-semibold">force-decode</span>
                            </span>
                        </Tooltip>
                        {forceDecode.waktu_proses && (
                            <>
                                <span>&nbsp;·&nbsp;</span>
                                <Tooltip text="Waktu yang dibutuhkan server untuk menyelesaikan seluruh proses force decode.">
                                    <span className="cursor-default">
                                        Waktu: <span className="text-neutral-800 font-semibold">{forceDecode.waktu_proses}</span>
                                    </span>
                                </Tooltip>
                            </>
                        )}
                        {usingMethodTable && (
                            <>
                                <span>&nbsp;·&nbsp;</span>
                                <Tooltip text="Data dibaca dari tabel method_forcedecode — setiap kombinasi channel × teknik disimpan sebagai baris terpisah.">
                                    <span className="cursor-default text-violet-600 font-mono text-[10px] border border-violet-300 bg-violet-50 px-1 py-0.5 rounded">
                                        per-method
                                    </span>
                                </Tooltip>
                            </>
                        )}
                    </p>
                </div>

                {/* Action bar */}
                {selectableItems.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <Tooltip text={allSelectableSelected
                            ? 'Batalkan semua pilihan.'
                            : `Pilih semua ${selectableItems.length} kombinasi yang belum diinterpretasi AI sekaligus.`}>
                            <button
                                type="button"
                                onClick={toggleSelectAll}
                                className="text-xs px-3 py-1.5 text-neutral-900 rounded-sm border border-neutral-800
                                    hover:border-neutral-500 transition-all duration-200
                                    hover:shadow-[-4px_5px_0_rgba(26,26,46,1)] hover:-translate-y-0.5"
                            >
                                {allSelectableSelected ? 'Batal Semua' : `Pilih Semua (${selectableItems.length})`}
                            </button>
                        </Tooltip>

                        {someSelected && (
                            <Tooltip text={`Kirim ${selectedKeys.size} kombinasi terpilih ke AI untuk dianalisis.`}>
                                <button
                                    type="button"
                                    onClick={handleInterpretSelected}
                                    disabled={isInterpreting}
                                    className={`text-xs px-4 py-1.5 rounded-sm font-medium flex items-center gap-1.5
                                        border border-neutral-800 transition-all duration-200
                                        hover:shadow-[-4px_5px_0_rgba(26,26,46,1)] hover:-translate-y-0.5
                                        ${isInterpreting
                                            ? 'bg-neutral-100 text-neutral-700 cursor-not-allowed'
                                            : 'bg-neutral-100 text-neutral-900'
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
                                            <span className="bg-neutral-800 text-white rounded-full w-4 h-4
                                                flex items-center justify-center text-[10px] font-bold">
                                                {selectedKeys.size}
                                            </span>
                                        </>
                                    )}
                                </button>
                            </Tooltip>
                        )}
                    </div>
                )}
            </div>

            {/* Accordion list */}
            <div className="space-y-3">
                {[...teknikByArah.entries()].map(([arah, channels], arahIdx) => {
                    const open = isOpen(arah)

                    const SEV: Record<StatusAncaman, number> = { Aman: 0, Mencurigakan: 1, Berbahaya: 2 }
                    let worstStatus: StatusAncaman | undefined
                    for (const ch of channels) {
                        const st = teknikMap[makeTeknikKey(ch, arah)]
                        if (st && (!worstStatus || SEV[st] > SEV[worstStatus])) worstStatus = st
                    }

                    const arahItems = decodedItems.filter(i => i.arah === arah)
                    const uninterpretedCount = arahItems.filter(i => !isInterpreted(i)).length

                    return (
                        <div key={arah} className="pb-1.5">
                            <button
                                type="button"
                                onClick={() => toggleAccordion(arah)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5
                                    rounded-sm bg-neutral-100 border border-neutral-900 text-left
                                    transition-all duration-200 ease-in-out
                                    hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[-5px_5px_0_rgba(26,26,46,1)]
                                    ${open ? '-translate-y-0.5 -translate-x-0.5 shadow-[-5px_5px_0_rgba(26,26,46,1)]' : ''}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                                    fill="currentColor" viewBox="0 0 256 256"
                                    className={`text-neutral-600 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
                                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
                                </svg>
                                <div className="flex flex-col md:flex-row items-start md:items-cente gap-1.5">
                                    <div className="flex-1 flex items-center gap-1.5">
                                        <span className="text-xs font-semibold text-neutral-900 flex-1 text-left">{TEKNIK_LABEL[arah]}</span>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        <div className="flex gap-0.5 shrink-0">
                                            {channels.map(ch => (
                                                <Tooltip key={ch} text={`Channel ${ch === 'R' ? 'Red' : ch === 'G' ? 'Green' : ch === 'B' ? 'Blue' : ch} — data diekstrak dari komponen warna ini.`}>
                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border leading-none
                                                ${CHANNEL_COLOR[ch] ?? 'bg-neutral-100 text-neutral-500 border-neutral-200'}`}>
                                                        {ch}
                                                    </span>
                                                </Tooltip>
                                            ))}
                                        </div>
                                        {worstStatus && (
                                            <Tooltip text={
                                                worstStatus === 'Aman' ? 'Semua channel pada teknik ini dinilai aman oleh AI.'
                                                    : worstStatus === 'Mencurigakan' ? 'Setidaknya satu channel dinilai mencurigakan.'
                                                        : 'Setidaknya satu channel dinilai berbahaya.'
                                            }>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-sm font-semibold border shrink-0 ${ANCAMAN_STYLE[worstStatus] ?? ''}`}>
                                                    {worstStatus}
                                                </span>
                                            </Tooltip>
                                        )}
                                        {uninterpretedCount > 0 && (
                                            <Tooltip text={`${uninterpretedCount} dari ${arahItems.length} channel belum diinterpretasi AI.`}>
                                                <span className="text-[10px] px-2 py-0.5 rounded-sm border border-neutral-400 text-neutral-500 shrink-0 font-mono">
                                                    {uninterpretedCount} belum AI
                                                </span>
                                            </Tooltip>
                                        )}
                                        <Tooltip text={`Teknik ini memiliki ${arahItems.length} kanal warna yang diekstrak.`}>
                                            <span className="text-xs text-neutral-400 shrink-0 cursor-default">{arahItems.length} kanal</span>
                                        </Tooltip>
                                    </div>
                                </div>
                            </button>

                            {open && (
                                <div className="bg-neutral-50">
                                    {channels.map((ch, chIdx) => {
                                        const item = arahItems.find(i => i.channel === ch)
                                        if (!item) return null

                                        const interpreted = isInterpreted(item)

                                        return (
                                            <div key={ch} className="py-2 space-y-2">

                                                <DecodeCard
                                                    item={item}
                                                    bitItem={getBitItem(item)}
                                                    index={arahIdx * channels.length + chIdx}
                                                    isSelected={!interpreted && selectedKeys.has(`${item.channel}__${item.arah}`)}
                                                    onToggleSelect={interpreted ? () => { } : () => toggleSelect(item)}
                                                    interpretation={getInterpretation(item)}
                                                    isInterpretingThis={interpretingKeys.has(`${item.channel}__${item.arah}`)}
                                                    hideCheckbox={interpreted}
                                                />
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )
                })}

                {teknikByArah.size === 0 && (
                    <div className="flex items-center justify-center py-12 text-neutral-400 text-sm">
                        Tidak ada data ekstraksi
                    </div>
                )}
            </div>

            {!someSelected && localAIResults.length === 0 && selectableItems.length > 0 && (
                <div className="flex items-center gap-3 px-5 py-3 rounded-sm bg-neutral-50 border border-neutral-800">
                    <svg className="h-4 w-4 text-neutral-900 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-neutral-700">
                        Centang card yang ingin diinterpretasi AI, lalu klik{' '}
                        <span className="text-neutral-950 font-semibold">Interpretasi AI</span>.
                    </p>
                </div>
            )}
        </div>
    )
}
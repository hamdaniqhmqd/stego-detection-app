// src/app/admin/analisis/[id]/HasilAnalisisAdmin.tsx
'use client'

import { useState, useCallback } from 'react'
import type { AnalysisResult, HasilInterpretasi } from '@/types/analysis'
import type { DecodedRawItem, DecodedBitItem } from '@/types/shared'
import { TEKNIK_LABEL, type TeknikArah, type Channel } from '@/types/shared'
import { CH_STYLE, CHANNEL_COLOR, STATUS_COLOR, STATUS_DOT } from '@/utils/Channel'
import { decodeRawText } from '@/utils/Decode'
import { formatBitPreview } from '@/utils/Bit'
import type { StatusAncaman, TeknikStatusMap } from '@/hooks/useInterpretasiAI'
import { buildTeknikStatusMap, makeTeknikKey } from '@/hooks/useInterpretasiAI'
import { AIInterpretationText } from '../Ui/AIInterpretationFormatter'
import { Tooltip } from '../Ui/ToolTip'

// Props

interface HasilAnalisisAdminProps {
    result: AnalysisResult
    filePath?: string
}

// Copy hook

function useCopy() {
    const [copiedKey, setCopiedKey] = useState<string | null>(null)
    const copy = useCallback(async (text: string, key: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedKey(key)
            setTimeout(() => setCopiedKey(null), 2000)
        } catch {
            const ta = document.createElement('textarea')
            ta.value = text
            document.body.appendChild(ta)
            ta.select()
            document.execCommand('copy')
            document.body.removeChild(ta)
            setCopiedKey(key)
            setTimeout(() => setCopiedKey(null), 2000)
        }
    }, [])
    return { copy, copiedKey }
}

// Copy button

function CopyBtn({ text, copyKey, onCopy, isCopied }: {
    text: string; copyKey: string
    onCopy: (text: string, key: string) => void; isCopied: boolean
}) {
    return (
        <Tooltip text={isCopied ? 'Tersalin!' : 'Salin ke clipboard'}>
            {/* Animasi lift pada tombol salin */}
            <button
                type="button"
                onClick={() => onCopy(text, copyKey)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium
                    border transition-all duration-150 shrink-0
                    hover:-translate-y-0.5 hover:shadow-[-2px_2px_0_rgba(26,26,46,0.15)]
                    active:translate-y-0 active:shadow-none
                    ${isCopied
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200 -translate-y-0.5 shadow-[-2px_2px_0_rgba(16,185,129,0.3)]'
                        : 'bg-neutral-50 text-neutral-500 border-neutral-200 hover:bg-neutral-100 hover:text-neutral-700'
                    }`}
            >
                {isCopied ? (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z" />
                        </svg>
                        Tersalin
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z" />
                        </svg>
                        Salin
                    </>
                )}
            </button>
        </Tooltip>
    )
}

// Stat pill

export function StatPill({ label, value, tooltip, colorClass = 'text-neutral-700' }: {
    label: string; value: string | number; tooltip: string; colorClass?: string
}) {
    return (
        <Tooltip text={tooltip}>
            {/* Animasi lift pada stat pill */}
            <div className="flex flex-col items-center px-3 py-1.5 rounded-sm bg-neutral-50
                border border-neutral-100 cursor-default select-none min-w-14
                transition-all duration-150 ease-in-out 
                hover:-translate-y-0.5 hover:shadow-[-3px_3px_0_rgba(163,163,163,1)] hover:border-neutral-400">
                <span className={`text-sm font-mono font-bold leading-tight ${colorClass}`}>{value}</span>
                <span className="text-[9px] text-neutral-400 font-medium uppercase tracking-wide mt-0.5">{label}</span>
            </div>
        </Tooltip>
    )
}

// AI Interpretation block

function AIInterpretationBlock({ interpretation }: { interpretation: HasilInterpretasi }) {
    const status = interpretation.status_ancaman as StatusAncaman

    const containerColor: Record<StatusAncaman, string> = {
        Aman: 'border-emerald-200 bg-emerald-50/60',
        Mencurigakan: 'border-amber-200 bg-amber-50/60',
        Berbahaya: 'border-red-200 bg-red-50/60',
    }
    const labelColor: Record<StatusAncaman, string> = {
        Aman: 'text-emerald-700',
        Mencurigakan: 'text-amber-700',
        Berbahaya: 'text-red-700',
    }

    return (
        <div className={`rounded-md border px-3.5 py-3 space-y-2 ${containerColor[status] ?? 'border-neutral-200 bg-neutral-50'}`}>
            <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11"
                    fill="currentColor" viewBox="0 0 256 256"
                    className={`shrink-0 ${labelColor[status] ?? 'text-neutral-500'}`}>
                    <path d="M232,128a104,104,0,1,1-104-104A104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128ZM96,112a12,12,0,1,0-12-12A12,12,0,0,0,96,112Zm64,0a12,12,0,1,0-12-12A12,12,0,0,0,160,112Zm4.44,56.06a8,8,0,0,0-11-2.66,52.06,52.06,0,0,1-50.88,0,8,8,0,1,0-7.84,13.94,68,68,0,0,0,66.56,0A8,8,0,0,0,164.44,168.06Z" />
                </svg>
                <span className={`text-[10px] font-semibold uppercase tracking-wide ${labelColor[status] ?? 'text-neutral-500'}`}>
                    Interpretasi AI
                </span>
                <span className={`ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full
                    text-[10px] font-medium border ${STATUS_COLOR[status]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />
                    {status}
                </span>
            </div>
            <p className={`text-xs leading-relaxed ${labelColor[status] ?? 'text-neutral-600'}`}>
                <AIInterpretationText text={interpretation.interpretation} />
            </p>
        </div>
    )
}

// Channel decode block

interface ChannelBlockProps {
    ch: Channel
    rawItem?: DecodedRawItem
    bitItem?: DecodedBitItem
    status?: StatusAncaman
    interpretation?: HasilInterpretasi
    hasAI: boolean
    copy: (text: string, key: string) => void
    copiedKey: string | null
    arah: TeknikArah
}

function ChannelBlock({ ch, rawItem, bitItem, status, interpretation, hasAI, copy, copiedKey, arah }: ChannelBlockProps) {
    const [expandedBit, setExpandedBit] = useState(false)
    const [expandedRaw, setExpandedRaw] = useState(false)

    const chStyle = CH_STYLE[ch]
    const rawText = rawItem ? decodeRawText(rawItem) : ''

    const BIT_PREVIEW = 320
    const bitPreviewStr = bitItem ? formatBitPreview(bitItem.bits, BIT_PREVIEW) : ''
    const bitFullStr = bitItem ? formatBitPreview(bitItem.bits, bitItem.bits.length) : ''
    const bitHasMore = (bitItem?.total_bits ?? 0) > BIT_PREVIEW

    const RAW_PREVIEW = 200
    const rawHasMore = rawText.length > RAW_PREVIEW

    const printablePercent = rawItem ? Math.round(rawItem.printable_ratio * 100) : 0
    const printableColor = printablePercent >= 70 ? 'text-emerald-600' : printablePercent >= 40 ? 'text-amber-600' : 'text-red-600'
    const printableBarColor = printablePercent >= 70 ? 'bg-emerald-500' : printablePercent >= 40 ? 'bg-amber-400' : 'bg-red-500'

    const bitCopyKey = `bit-${ch}-${arah}`
    const rawCopyKey = `raw-${ch}-${arah}`

    return (
        // Hapus overflow-hidden agar shadow tidak terpotong
        // Gunakan overflow-visible + rounded border secara eksplisit
        <div className="rounded-sm border border-neutral-200 bg-neutral-50">

            {/* Channel header */}
            <div className={`flex items-center justify-between px-3.5 py-2.5 border-b rounded-t-sm ${chStyle.header} bg-neutral-50`}>
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${chStyle.dot}`} />
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${chStyle.pill}`}>
                        CH-{ch}
                    </span>
                </div>
                {status ? (
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${STATUS_COLOR[status]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />
                        {status}
                    </span>
                ) : hasAI ? (
                    <Tooltip text="Teknik ini belum diinterpretasi oleh AI">
                        <span className="text-[10px] text-neutral-300 italic cursor-default">Belum diinterpretasi</span>
                    </Tooltip>
                ) : null}
            </div>

            {/* Stats row */}
            {rawItem && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-neutral-100 flex-wrap">
                    <Tooltip text="Persentase karakter yang dapat dicetak (printable ASCII) dari total data yang diekstrak. Nilai tinggi mengindikasikan kemungkinan pesan tersembunyi berupa teks.">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden min-w-16">
                                <div className={`h-full rounded-full transition-all ${printableBarColor}`} style={{ width: `${printablePercent}%` }} />
                            </div>
                            <span className={`text-xs font-mono font-bold shrink-0 ${printableColor}`}>{printablePercent}% printable</span>
                        </div>
                    </Tooltip>
                    <div className="flex items-center gap-1.5 shrink-0">
                        {bitItem && (
                            <StatPill label="Bit" value={bitItem.total_bits.toLocaleString()}
                                tooltip={`Total bit LSB yang diekstrak dari channel ${ch} dengan arah ${TEKNIK_LABEL[arah]}. Setiap piksel menyumbangkan 1 bit dari LSB nilai warnanya.`} />
                        )}
                        <StatPill label="Karakter" value={rawItem.total_chars.toLocaleString()}
                            tooltip={`Total karakter hasil decode dari ${bitItem?.total_bits.toLocaleString() ?? '?'} bit. Setiap 8 bit dikonversi menjadi 1 karakter (byte).`} />
                        {rawItem.base64_encoded && (
                            <Tooltip text="Data ini telah dienkode Base64 sebelum disembunyikan. Teks yang ditampilkan adalah hasil decode Base64.">
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-violet-50 text-violet-600 border border-violet-200 cursor-default">
                                    base64
                                </span>
                            </Tooltip>
                        )}
                    </div>
                </div>
            )}

            <div className="p-3.5 space-y-3">

                {/* Bit LSB */}
                {bitItem && (
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <Tooltip text={`Rangkaian bit (0 dan 1) yang diekstrak dari LSB (Least Significant Bit) setiap piksel channel ${ch}. Dibaca dengan arah ${TEKNIK_LABEL[arah]}.`}>
                                    <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide cursor-default flex items-center gap-1">
                                        Bit LSB
                                        <span className="ml-0.5 text-neutral-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
                                                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z" />
                                            </svg>
                                        </span>
                                    </span>
                                </Tooltip>
                                {expandedBit && (
                                    <button type="button" onClick={() => setExpandedBit(v => !v)}
                                        className="block text-neutral-500 hover:text-neutral-700 transition-colors text-[10px]">
                                        {expandedBit ? 'Sembunyikan' : `··· +${(bitItem.total_bits - BIT_PREVIEW).toLocaleString()} bit lagi`}
                                    </button>
                                )}
                            </div>
                            <CopyBtn text={bitItem.bits} copyKey={bitCopyKey} onCopy={copy} isCopied={copiedKey === bitCopyKey} />
                        </div>
                        <div className="rounded-sm bg-neutral-50 border border-neutral-200 px-3 py-2.5
                            font-mono text-[10px] text-neutral-700 leading-relaxed break-all overflow-hidden">
                            {expandedBit ? bitFullStr : bitPreviewStr}
                            {bitHasMore && (
                                <button type="button" onClick={() => setExpandedBit(v => !v)}
                                    className="block mt-2 text-neutral-500 hover:text-neutral-700 transition-colors text-[10px]">
                                    {expandedBit ? 'Sembunyikan' : `··· +${(bitItem.total_bits - BIT_PREVIEW).toLocaleString()} bit lagi`}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Raw Text */}
                {rawItem && (
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <Tooltip text={`Teks hasil konversi bit LSB menjadi karakter. ${rawItem.base64_encoded ? 'Data asli ter-encode Base64, ini adalah hasil decode-nya.' : 'Karakter non-printable ditampilkan apa adanya.'} Printable ratio ${printablePercent}% menunjukkan seberapa banyak karakter yang dapat dibaca.`}>
                                    <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide cursor-default flex items-center gap-1">
                                        Raw Text
                                        <span className="ml-0.5 text-neutral-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
                                                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z" />
                                            </svg>
                                        </span>
                                    </span>
                                </Tooltip>
                                {expandedRaw && (
                                    <button type="button" onClick={() => setExpandedRaw(v => !v)}
                                        className="block text-neutral-500 hover:text-neutral-700 transition-colors text-[10px]">
                                        {expandedRaw ? 'Sembunyikan' : `··· +${(rawText.length - RAW_PREVIEW).toLocaleString()} char lagi`}
                                    </button>
                                )}
                            </div>
                            <CopyBtn text={rawText} copyKey={rawCopyKey} onCopy={copy} isCopied={copiedKey === rawCopyKey} />
                        </div>
                        <div className="rounded-sm bg-neutral-50 border border-neutral-200 px-3 py-2.5
                            font-mono text-[10px] text-neutral-700 leading-relaxed overflow-hidden">
                            {rawText.length === 0 ? (
                                <span className="text-neutral-300 italic">tidak ada data</span>
                            ) : (
                                <>
                                    <span>{expandedRaw ? rawText : rawText.slice(0, RAW_PREVIEW)}</span>
                                    {rawHasMore && (
                                        <button type="button" onClick={() => setExpandedRaw(v => !v)}
                                            className="block mt-2 text-neutral-500 hover:text-neutral-700 transition-colors text-[10px]">
                                            {expandedRaw ? 'Sembunyikan' : `··· +${(rawText.length - RAW_PREVIEW).toLocaleString()} char lagi`}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Interpretasi AI */}
                {interpretation ? (
                    <AIInterpretationBlock interpretation={interpretation} />
                ) : hasAI && (rawItem || bitItem) ? (
                    <div className="rounded-md border border-dashed border-neutral-200
                        px-3 py-2 flex items-center gap-2 text-neutral-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11"
                            fill="currentColor" viewBox="0 0 256 256" className="shrink-0">
                            <path d="M232,128a104,104,0,1,1-104-104A104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128ZM96,112a12,12,0,1,0-12-12A12,12,0,0,0,96,112Zm64,0a12,12,0,1,0-12-12A12,12,0,0,0,160,112Zm4.44,56.06a8,8,0,0,0-11-2.66,52.06,52.06,0,0,1-50.88,0,8,8,0,1,0-7.84,13.94,68,68,0,0,0,66.56,0A8,8,0,0,0,164.44,168.06Z" />
                        </svg>
                        <span className="text-[10px] italic">Teknik ini belum diinterpretasi AI</span>
                    </div>
                ) : null}

                {!bitItem && !rawItem && (
                    <p className="text-[10px] text-neutral-300 italic text-center py-2">Data decode tidak tersedia</p>
                )}
            </div>
        </div>
    )
}

// Teknik accordion

export interface TeknikBlockProps {
    arah: TeknikArah
    channels: Channel[]
    decodedRaw: DecodedRawItem[]
    decodedBit: DecodedBitItem[]
    teknikMap: TeknikStatusMap
    hasilAI: HasilInterpretasi[]
    hasAI: boolean
    copy: (text: string, key: string) => void
    copiedKey: string | null
    index: number
}

export function TeknikBlock({ arah, channels, decodedRaw, decodedBit, teknikMap, hasilAI, hasAI, copy, copiedKey, index }: TeknikBlockProps) {
    const [open, setOpen] = useState(true)

    const SEV: Record<StatusAncaman, number> = { Aman: 0, Mencurigakan: 1, Berbahaya: 2 }
    let worstStatus: StatusAncaman | undefined
    for (const ch of channels) {
        const st = teknikMap[makeTeknikKey(ch, arah)]
        if (st && (!worstStatus || SEV[st] > SEV[worstStatus])) worstStatus = st
    }

    const totalBits = channels.reduce((sum, ch) => {
        const b = decodedBit.find(b => b.channel === ch && b.arah === arah)
        return sum + (b?.total_bits ?? 0)
    }, 0)

    return (
        <div className="relative pb-1.5 pl-1.5">
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                className={`w-full relative flex items-center border border-neutral-200 rounded-sm gap-3 px-4 py-3 text-left
                    bg-neutral-50 transition-all ease-in-out duration-200
                    ${open
                        ? '-translate-y-0.5 -translate-x-0.5 shadow-[-5px_5px_0_rgba(26,26,46,1)] border-neutral-400'
                        : 'hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[-5px_5px_0_rgba(26,26,46,1)] hover:border-neutral-400'
                    }`}
            >
                <span className="text-xs font-mono font-bold text-neutral-800 shrink-0 w-5">T{index + 1}</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256"
                    className={`text-neutral-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                >
                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
                </svg>
                <span className="text-xs font-semibold text-neutral-800 flex-1">{TEKNIK_LABEL[arah]}</span>
                <div className="flex gap-0.5 shrink-0">
                    {channels.map(ch => (
                        <span key={ch} className={`px-1.5 py-0.5 rounded text-[10px] font-bold border leading-none
                            ${CHANNEL_COLOR[ch] ?? 'bg-neutral-100 text-neutral-500 border-neutral-200'}`}>
                            {ch}
                        </span>
                    ))}
                </div>
                {totalBits > 0 && (
                    <Tooltip text={`Total bit LSB dari semua channel pada arah ${TEKNIK_LABEL[arah]}`}>
                        <span className="relative text-[10px] font-mono text-neutral-400 shrink-0 cursor-default">
                            {totalBits.toLocaleString()} bit
                        </span>
                    </Tooltip>
                )}
                {worstStatus ? (
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border shrink-0 ${STATUS_COLOR[worstStatus]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[worstStatus]}`} />
                        {worstStatus}
                    </span>
                ) : hasAI ? (
                    <span className="text-[10px] text-neutral-300 italic shrink-0">Belum diinterpretasi</span>
                ) : null}
            </button>

            {open && (
                <div className="divide-y">
                    {channels.map(ch => {
                        const rawItem = decodedRaw.find(r => r.channel === ch && r.arah === arah)
                        const bitItem = decodedBit.find(b => b.channel === ch && b.arah === arah)
                        const status = teknikMap[makeTeknikKey(ch, arah)]
                        const interpretation = hasilAI.find(h => h.channel === ch && h.arah === arah)
                        return (
                            <div key={ch} className="py-3">
                                <ChannelBlock ch={ch} arah={arah} rawItem={rawItem} bitItem={bitItem}
                                    status={status} interpretation={interpretation}
                                    hasAI={hasAI} copy={copy} copiedKey={copiedKey} />
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

// Main component

export default function HasilAnalisisAdmin({ result, filePath }: HasilAnalisisAdminProps) {
    const { analysis, forceDecode, aiInterpretasi } = result
    const { copy, copiedKey } = useCopy()

    if (!forceDecode) return null

    const decodedRaw: DecodedRawItem[] = forceDecode.decoded_raw ?? []
    const decodedBit: DecodedBitItem[] = forceDecode.decoded_bit ?? []
    const hasAI = analysis.interpretasi_ai
    const hasilAI: HasilInterpretasi[] = aiInterpretasi?.hasil ?? []

    const teknikMap: TeknikStatusMap = hasilAI.length > 0
        ? buildTeknikStatusMap(hasilAI)
        : {} as TeknikStatusMap

    const teknikByArah = new Map<TeknikArah, Channel[]>()
    for (const t of (analysis.teknik ?? [])) {
        const existing = teknikByArah.get(t.arah)
        if (existing) { if (!existing.includes(t.channel)) existing.push(t.channel) }
        else teknikByArah.set(t.arah, [t.channel])
    }
    if (teknikByArah.size === 0) {
        for (const r of decodedRaw) {
            const existing = teknikByArah.get(r.arah)
            if (existing) { if (!existing.includes(r.channel)) existing.push(r.channel) }
            else teknikByArah.set(r.arah, [r.channel])
        }
    }

    const totalKombinasi = decodedRaw.length
    const totalBit = decodedBit.reduce((s, b) => s + b.total_bits, 0)

    return (
        <div className="space-y-4">

            {/* Header ringkasan */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3
                px-5 py-4 rounded-sm bg-neutral-50 border border-neutral-200">
                <div className="flex-1">
                    <h2 className="text-sm font-semibold text-neutral-900">Hasil Ekstraksi LSB</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                        <Tooltip text="Jumlah kombinasi channel × arah yang diekstrak">
                            <span className="cursor-default underline decoration-dotted decoration-neutral-300">{totalKombinasi} kombinasi</span>
                        </Tooltip>
                        {' '}&nbsp;·&nbsp;Metode: <span className="font-semibold text-neutral-800">force-decode</span>
                        {forceDecode.waktu_proses && (
                            <> &nbsp;·&nbsp;{' '}
                                <Tooltip text="Waktu yang dibutuhkan untuk menyelesaikan proses force decode">
                                    <span className="cursor-default underline decoration-dotted decoration-neutral-300">{forceDecode.waktu_proses}</span>
                                </Tooltip>
                            </>
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {/* Animasi lift pada stat card header */}
                    <Tooltip text="Total bit yang diekstrak dari seluruh kombinasi channel dan arah">
                        <div className="px-3 py-1.5 rounded-sm bg-neutral-50 border border-neutral-200 text-center cursor-default
                            transition-all duration-150
                            hover:-translate-y-0.5 hover:shadow-[-3px_3px_0_rgba(163,163,163,1)] hover:border-neutral-400">
                            <p className="text-xs font-mono font-bold text-neutral-800">{totalBit.toLocaleString()}</p>
                            <p className="text-[9px] text-neutral-600 uppercase tracking-wide">total bit</p>
                        </div>
                    </Tooltip>
                    <Tooltip text="Jumlah arah scan yang digunakan dalam analisis">
                        <div className="px-3 py-1.5 rounded-sm bg-neutral-50 border border-neutral-200 text-center cursor-default
                            transition-all duration-150
                            hover:-translate-y-0.5 hover:shadow-[-3px_3px_0_rgba(163,163,163,1)] hover:border-neutral-400">
                            <p className="text-xs font-mono font-bold text-neutral-800">{teknikByArah.size}</p>
                            <p className="text-[9px] text-neutral-600 uppercase tracking-wide">arah scan</p>
                        </div>
                    </Tooltip>
                </div>
            </div>

            {/* Read-only notice */}
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-sm bg-neutral-50 border border-neutral-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13"
                    fill="currentColor" viewBox="0 0 256 256" className="text-neutral-500 shrink-0">
                    <path d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Zm-80-40a12,12,0,1,0-12-12A12,12,0,0,0,128,168Z" />
                </svg>
                <p className="text-xs text-neutral-600">
                    Mode tampilan admin. data hanya bisa dipantau dan disalin, tidak dapat dimodifikasi.
                    Gunakan fitur <span className="text-neutral-900 font-semibold">Salin</span> untuk mengekstrak data.
                </p>
            </div>

            {/* Teknik blocks */}
            {/*
             * space-y-4 + py-2 memberi ruang cukup agar shadow tiap TeknikBlock
             * tidak overlap dengan elemen di bawahnya dan tidak terpotong.
             */}
            <div className="space-y-4 py-2">
                {[...teknikByArah.entries()].map(([arah, channels], i) => (
                    <TeknikBlock key={arah} index={i} arah={arah} channels={channels}
                        decodedRaw={decodedRaw} decodedBit={decodedBit}
                        teknikMap={teknikMap} hasilAI={hasilAI} hasAI={hasAI}
                        copy={copy} copiedKey={copiedKey} />
                ))}
                {teknikByArah.size === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 gap-2 text-neutral-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z" />
                        </svg>
                        <p className="text-sm">Tidak ada data ekstraksi</p>
                    </div>
                )}
            </div>
        </div>
    )
}
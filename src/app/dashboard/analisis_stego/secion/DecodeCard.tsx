// src/app/dashboard/analisis_stego/secion/DecodeCard.tsx
'use client'

import { useState } from 'react'
import type {
    DecodedBitItem,
    DecodedRawItem,
    HasilInterpretasi,
} from '@/types/analysis'
import { TEKNIK_LABEL } from '@/types/analysis'
import { AIInterpretationText } from '@/components/Ui/AIInterpretationFormatter'
import { ANCAMAN_STYLE, CH_STYLE } from '@/utils/Channel'
import { decodeRawText } from '@/utils/Decode'
import { formatBitPreview } from '@/utils/Bit'

interface DecodeCardProps {
    item: DecodedRawItem
    bitItem?: DecodedBitItem
    index: number
    isSelected: boolean
    onToggleSelect: () => void
    interpretation?: HasilInterpretasi
    isInterpretingThis: boolean
}

export default function DecodeCard({
    item,
    bitItem,
    index,
    isSelected,
    onToggleSelect,
    interpretation,
    isInterpretingThis,
}: DecodeCardProps) {
    const [expandedBit, setExpandedBit] = useState(false)
    const [expandedRaw, setExpandedRaw] = useState(false)
    const style = CH_STYLE[item.channel]

    // Decode base64 → teks asli (semua byte 0x00–0xFF)
    const rawText = decodeRawText(item)

    const printablePercent = Math.round(item.printable_ratio * 100)
    const printableColor =
        printablePercent >= 70
            ? 'text-emerald-400'
            : printablePercent >= 40
                ? 'text-amber-400'
                : 'text-red-400'

    // Bit preview — tampilkan 320 bit pertama (40 byte) sebagai default
    const BIT_PREVIEW = 320
    const bitPreviewStr = bitItem ? formatBitPreview(bitItem.bits, BIT_PREVIEW) : ''
    const bitHasMore = (bitItem?.total_bits ?? 0) > BIT_PREVIEW
    const bitFullStr = bitItem ? formatBitPreview(bitItem.bits, bitItem.bits.length) : ''

    // Raw text preview — tampilkan 200 karakter pertama
    const RAW_PREVIEW = 200
    const rawHasMore = rawText.length > RAW_PREVIEW

    return (
        <div
            className={`relative flex flex-col rounded-sm border bg-neutral-100 transition-all duration-200
                ${isSelected ? `${style.ring} ring` : `ring ${style.ring}`}
            `}
        >


            {/* Header */}
            <div className={`flex items-center justify-between gap-2 px-4 pt-4 pb-3 border-b ${style.header}`}>
                <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${style.dot} shrink-0`} />
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${style.pill}`}>
                        CH-{item.channel}
                    </span>
                </span>
                <span className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500 ml-auto">
                        T{index + 1}
                    </span>
                    {/* Checkbox select */}
                    <button
                        type="button"
                        onClick={onToggleSelect}
                        title={isSelected ? 'Batal pilih' : 'Pilih untuk interpretasi AI'}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-all z-10
                    ${isSelected
                                ? 'bg-neutral-900 border-neutral-800'
                                : 'border-neutral-800 bg-neutral-100'
                            }`}
                    >
                        {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                    </button>
                </span>
            </div>

            {/* Teknik label */}
            <div className="px-4 pt-2 pb-1">
                <p className="text-xs text-neutral-600 leading-relaxed">{TEKNIK_LABEL[item.arah]}</p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 px-4 py-2">
                <div className="flex flex-col">
                    <span className="text-xs text-neutral-700">Printable</span>
                    <span className={`text-sm font-mono font-bold ${printableColor}`}>
                        {printablePercent}%
                    </span>
                </div>
                <div className="w-px h-6 bg-neutral-800" />
                <div className="flex flex-col">
                    <span className="text-xs text-neutral-700">Bit</span>
                    <span className="text-sm font-mono font-bold text-neutral-800">
                        {(bitItem?.total_bits ?? 0).toLocaleString()}
                    </span>
                </div>
                <div className="w-px h-6 bg-neutral-800" />
                <div className="flex flex-col">
                    <span className="text-xs text-neutral-700">Karakter</span>
                    <span className="text-sm font-mono font-bold text-neutral-800">
                        {item.total_chars.toLocaleString()}
                    </span>
                </div>

                {/* Printable bar */}
                <div className="flex-1 h-1.5 bg-neutral-300 rounded-full overflow-hidden ml-1">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${printablePercent >= 70
                            ? 'bg-emerald-500'
                            : printablePercent >= 40
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`}
                        style={{ width: `${printablePercent}%` }}
                    />
                </div>
            </div>

            {/* ── Bit String ── */}
            {bitItem && (
                <div className="px-4 pb-2">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-neutral-950 font-medium tracking-wide uppercase">
                            Bit LSB
                        </span>
                        <span className="text-xs text-neutral-900 font-mono">
                            {bitItem.total_bits.toLocaleString()} bit
                        </span>
                    </div>
                    <div className="rounded-sm bg-neutral-100 border border-neutral-800 p-3 font-mono text-xs text-neutral-800 leading-relaxed break-all overflow-hidden">
                        {expandedBit ? bitFullStr : bitPreviewStr}
                        {bitHasMore && (
                            <button
                                onClick={() => setExpandedBit((v) => !v)}
                                className="block mt-1.5 text-neutral-600 hover:text-neutral-800 transition-colors"
                            >
                                {expandedBit
                                    ? '↑ Sembunyikan'
                                    : `... +${(bitItem.total_bits - BIT_PREVIEW).toLocaleString()} bit lagi`}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* ── Raw Text (semua byte 0–255) ── */}
            <div className="px-4 pb-3">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-neutral-950 font-medium tracking-wide uppercase">
                        Raw Text
                    </span>
                    <span className="text-xs text-neutral-800 font-mono">
                        {item.total_chars.toLocaleString()} char
                    </span>
                </div>
                <div className="rounded-sm bg-neutral-100 border border-neutral-800 p-3 font-mono text-xs text-neutral-800 leading-relaxed break-all overflow-hidden">
                    {rawText.length === 0 ? (
                        <span className="text-neutral-700 italic">(tidak ada data)</span>
                    ) : (
                        <>
                            <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                {expandedRaw ? rawText : rawText.slice(0, RAW_PREVIEW)}
                            </span>
                            {rawHasMore && (
                                <button
                                    onClick={() => setExpandedRaw((v) => !v)}
                                    className="block mt-1.5 text-neutral-600 hover:text-neutral-800 transition-colors"
                                >
                                    {expandedRaw
                                        ? '↑ Sembunyikan'
                                        : `... +${(rawText.length - RAW_PREVIEW).toLocaleString()} char lagi`}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
            {/* AI Interpretation result (jika ada) */}
            {isInterpretingThis && !interpretation && (
                <div className="mx-4 mb-4 px-3 py-2 rounded-sm bg-neutral-100 border border-neutral-800 flex items-center gap-2">
                    <svg className="animate-spin h-3.5 w-3.5 text-neutral-500 shrink-0" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <span className="text-xs text-neutral-600">AI sedang menganalisis...</span>
                </div>
            )}

            {interpretation && (
                <div className="mx-4 mb-4 rounded-sm bg-neutral-100 border border-neutral-800 overflow-hidden">
                    {/* Header: label + badge status ancaman */}
                    <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-800">
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs text-neutral-800 font-medium">Interpretasi AI</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-sm font-semibold border ${ANCAMAN_STYLE[interpretation.status_ancaman] ?? 'bg-neutral-900 text-neutral-500 border-neutral-700'
                            }`}>
                            {interpretation.status_ancaman}
                        </span>
                    </div>

                    {/* Body: rendered markdown */}
                    <div className="px-3 py-3 max-h-64 overflow-y-auto
                                    scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
                        <AIInterpretationText text={interpretation.interpretation} />
                    </div>
                </div>
            )}
        </div>
    )
}
// src/app/dashboard/analisis_stego/secion/DecodeCard.tsx
'use client'

import { useState } from 'react'
import type { HasilInterpretasi } from '@/types/analysis'
import { DecodedBitItem, DecodedRawItem, TEKNIK_LABEL } from '@/types/shared'
import { AIInterpretationText } from '@/components/Ui/AIInterpretationFormatter'
import { ANCAMAN_STYLE, CH_STYLE } from '@/utils/Channel'
import { decodeRawText } from '@/utils/Decode'
import { formatBitPreview } from '@/utils/Bit'
import { Tooltip } from '@/components/Ui/ToolTip'

interface DecodeCardProps {
    item: DecodedRawItem
    bitItem?: DecodedBitItem
    index: number
    isSelected: boolean
    onToggleSelect: () => void
    interpretation?: HasilInterpretasi
    isInterpretingThis: boolean
    hideCheckbox?: boolean
}

export default function DecodeCard({
    item,
    bitItem,
    index,
    isSelected,
    onToggleSelect,
    interpretation,
    isInterpretingThis,
    hideCheckbox,
}: DecodeCardProps) {
    const [expandedBit, setExpandedBit] = useState(false)
    const [expandedRaw, setExpandedRaw] = useState(false)
    const style = CH_STYLE[item.channel]

    const rawText = decodeRawText(item)

    const printablePercent = Math.round(item.printable_ratio * 100)
    const printableColor =
        printablePercent >= 70
            ? 'text-emerald-400'
            : printablePercent >= 40
                ? 'text-amber-400'
                : 'text-red-400'

    const BIT_PREVIEW = 320
    const bitPreviewStr = bitItem ? formatBitPreview(bitItem.bits, BIT_PREVIEW) : ''
    const bitHasMore = (bitItem?.total_bits ?? 0) > BIT_PREVIEW
    const bitFullStr = bitItem ? formatBitPreview(bitItem.bits, bitItem.bits.length) : ''

    const RAW_PREVIEW = 200
    const rawHasMore = rawText.length > RAW_PREVIEW

    const chName =
        item.channel === 'R' ? 'Red (Merah)'
            : item.channel === 'G' ? 'Green (Hijau)'
                : item.channel === 'B' ? 'Blue (Biru)'
                    : item.channel

    const printableTooltip =
        printablePercent >= 70
            ? `${printablePercent}% karakter dapat dibaca sebagai teks — indikasi tinggi mengandung pesan tersembunyi.`
            : printablePercent >= 40
                ? `${printablePercent}% karakter dapat dibaca — kemungkinan data campuran, perlu diperiksa lebih lanjut.`
                : `${printablePercent}% karakter dapat dibaca — kemungkinan rendah berupa teks, mungkin data biner acak.`

    return (
        <div className={`relative flex flex-col rounded-sm border bg-neutral-100 transition-all duration-200
            ${isSelected ? `${style.ring} ring` : `ring ${style.ring}`}`}
        >
            {/* ── Header ── */}
            <div className={`flex items-center justify-between gap-2 px-4 pt-4 pb-3 border-b ${style.header}`}>
                <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${style.dot} shrink-0`} />
                    <Tooltip text={`Channel warna ${chName}. Bit LSB diekstrak dari nilai piksel channel ini.`}>
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${style.pill}`}>
                            CH-{item.channel}
                        </span>
                    </Tooltip>
                </span>

                <span className="flex items-center gap-2">
                    <Tooltip text={`Kombinasi ke-${index + 1}: Channel ${chName} dengan arah baca ${TEKNIK_LABEL[item.arah]}.`}>
                        <span className="text-xs text-neutral-500 cursor-default">
                            T{index + 1}
                        </span>
                    </Tooltip>

                    {!hideCheckbox && (
                        <Tooltip text={isSelected ? 'Klik untuk batal memilih — card ini tidak akan diinterpretasi AI.' : 'Pilih card ini lalu klik "Interpretasi AI" di atas untuk menganalisis data ini.'}>
                            <button
                                type="button"
                                onClick={onToggleSelect}
                                className={`w-5 h-5 rounded border flex items-center justify-center transition-all z-10
                                    ${isSelected
                                        ? 'bg-neutral-900 border-neutral-800'
                                        : 'border-neutral-800 bg-neutral-100 hover:bg-neutral-200'
                                    }`}
                            >
                                {isSelected && (
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>
                        </Tooltip>
                    )}
                </span>
            </div>

            {/* ── Teknik label ── */}
            <div className="px-4 pt-2 pb-1">
                <Tooltip text={`Arah baca piksel: ${TEKNIK_LABEL[item.arah]}. Urutan piksel yang berbeda menghasilkan rangkaian bit yang berbeda.`}>
                    <p className="text-xs text-neutral-600 leading-relaxed cursor-default inline-block">
                        {TEKNIK_LABEL[item.arah]}
                    </p>
                </Tooltip>
            </div>

            {/* ── Stats ── */}
            <div className="flex items-center gap-3 px-4 py-2">
                <Tooltip text={printableTooltip}>
                    <div className="flex flex-col cursor-default">
                        <span className="text-xs text-neutral-700">Printable</span>
                        <span className={`text-sm font-mono font-bold ${printableColor}`}>
                            {printablePercent}%
                        </span>
                    </div>
                </Tooltip>

                <div className="w-px h-6 bg-neutral-800" />

                <Tooltip text={`Total ${(bitItem?.total_bits ?? 0).toLocaleString()} bit diekstrak dari LSB (Least Significant Bit) setiap piksel pada channel ${item.channel} dengan arah ${TEKNIK_LABEL[item.arah]}.`}>
                    <div className="flex flex-col cursor-default">
                        <span className="text-xs text-neutral-700">Bit</span>
                        <span className="text-sm font-mono font-bold text-neutral-800">
                            {(bitItem?.total_bits ?? 0).toLocaleString()}
                        </span>
                    </div>
                </Tooltip>

                <div className="w-px h-6 bg-neutral-800" />

                <Tooltip text={`Total ${item.total_chars.toLocaleString()} karakter hasil konversi bit. Setiap 8 bit dikonversi menjadi 1 karakter (1 byte).`}>
                    <div className="flex flex-col cursor-default">
                        <span className="text-xs text-neutral-700">Karakter</span>
                        <span className="text-sm font-mono font-bold text-neutral-800">
                            {item.total_chars.toLocaleString()}
                        </span>
                    </div>
                </Tooltip>

                <div className="flex-1 h-1.5 bg-neutral-300 rounded-full overflow-hidden ml-1 cursor-default min-w-10"
                    title={`Proporsi karakter printable: ${printablePercent}% dari ${item.total_chars.toLocaleString()} karakter dapat dibaca sebagai teks biasa.`}>
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${printablePercent >= 70
                            ? 'bg-emerald-500'
                            : printablePercent >= 40
                                ? 'bg-amber-500'
                                : 'bg-red-500'}`}
                        style={{ width: `${printablePercent}%` }}
                    />
                </div>
            </div>

            {/* ── Bit LSB ── */}
            {bitItem && (
                <div className="px-4 pb-2">
                    <div className="flex items-center justify-between mb-1.5">
                        <Tooltip text="Rangkaian bit (0 dan 1) hasil ekstraksi LSB dari setiap piksel. Ini adalah data mentah sebelum dikonversi menjadi karakter.">
                            <span className="text-xs text-neutral-950 font-medium tracking-wide uppercase cursor-default">
                                Bit LSB
                            </span>
                        </Tooltip>
                        <Tooltip text={`${bitItem.total_bits.toLocaleString()} bit ÷ 8 = ${item.total_chars.toLocaleString()} karakter.`}>
                            <span className="text-xs text-neutral-900 font-mono cursor-default">
                                {bitItem.total_bits.toLocaleString()} bit
                            </span>
                        </Tooltip>
                    </div>
                    <div className="rounded-sm bg-neutral-100 border border-neutral-800 p-3 font-mono text-xs text-neutral-800 leading-relaxed break-all overflow-hidden">
                        {expandedBit ? bitFullStr : bitPreviewStr}
                        {bitHasMore && (
                            <button
                                onClick={() => setExpandedBit(v => !v)}
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

            {/* ── Raw Text ── */}
            <div className="px-4 pb-3">
                <div className="flex items-center justify-between mb-1.5">
                    <Tooltip text={`Teks hasil konversi bit LSB menjadi karakter.${item.base64_encoded ? ' Data asli ter-encode Base64 — ini sudah di-decode.' : ' Karakter non-printable ditampilkan apa adanya.'} Printable ratio ${printablePercent}% menunjukkan keterbacaan data.`}>
                        <span className="text-xs text-neutral-950 font-medium tracking-wide uppercase cursor-default flex items-center gap-1.5">
                            Raw Text
                            {item.base64_encoded && (
                                <span className="text-[10px] font-normal normal-case text-violet-600 border border-violet-300 bg-violet-50 px-1 py-0.5 rounded">
                                    base64
                                </span>
                            )}
                        </span>
                    </Tooltip>
                    <Tooltip text={`${item.total_chars.toLocaleString()} karakter total — ${printablePercent}% printable, ${100 - printablePercent}% non-printable.`}>
                        <span className="text-xs text-neutral-800 font-mono cursor-default">
                            {item.total_chars.toLocaleString()} char
                        </span>
                    </Tooltip>
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
                                    onClick={() => setExpandedRaw(v => !v)}
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

            {/* ── AI loading ── */}
            {isInterpretingThis && !interpretation && (
                <div className="mx-4 mb-4 px-3 py-2 rounded-sm bg-neutral-100 border border-neutral-800 flex items-center gap-2">
                    <svg className="animate-spin h-3.5 w-3.5 text-neutral-500 shrink-0" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <span className="text-xs text-neutral-600">AI sedang menganalisis...</span>
                </div>
            )}

            {/* ── AI Interpretation result ── */}
            {interpretation && (
                <div className="mx-4 mb-4 rounded-sm bg-neutral-100 border border-neutral-800 overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-800">
                        <Tooltip text="Hasil analisis AI — AI membaca data yang diekstrak dan menilai apakah mengandung pesan tersembunyi, seberapa jelas teks-nya, dan seberapa berbahaya kontennya.">
                            <span className="text-xs text-neutral-800 font-medium cursor-default">
                                Interpretasi AI
                            </span>
                        </Tooltip>
                        <Tooltip text={
                            interpretation.status_ancaman === 'Aman'
                                ? 'Aman — tidak ada indikasi steganografi atau konten berbahaya yang terdeteksi.'
                                : interpretation.status_ancaman === 'Mencurigakan'
                                    ? 'Mencurigakan — terdapat pola tidak biasa yang perlu diperiksa lebih lanjut.'
                                    : 'Berbahaya — kemungkinan kuat terdapat pesan tersembunyi atau konten berbahaya.'
                        }>
                            <span className={`text-xs px-2 py-0.5 rounded-sm font-semibold border cursor-default
                                ${ANCAMAN_STYLE[interpretation.status_ancaman] ?? 'bg-neutral-900 text-neutral-500 border-neutral-700'}`}>
                                {interpretation.status_ancaman}
                            </span>
                        </Tooltip>
                    </div>
                    <div className="px-3 py-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
                        <AIInterpretationText text={interpretation.interpretation} />
                    </div>
                </div>
            )}
        </div>
    )
}
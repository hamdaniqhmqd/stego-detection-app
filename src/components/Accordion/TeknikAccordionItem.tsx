// src/components/Accordion/TeknikAccordionItem.tsx

import { useState } from "react"
import { makeTeknikKey, TeknikStatusMap } from "@/hooks/useInterpretasiAI"
import { StatusAncaman } from "@/types/aiInterpretasi"
import { DecodedBitItem, DecodedRawItem, TEKNIK_LABEL, TeknikArah } from "@/types/shared"
import { CH_STYLE, CHANNEL_COLOR, STATUS_COLOR, STATUS_DOT } from "@/utils/Channel"
import { truncateBin, truncateText } from "@/utils/Truncate"
import { StatusBadge } from "../Badge/StatusBadge"

export interface TeknikAccordionItemProps {
    arah: TeknikArah
    channels: string[]
    teknikMap: TeknikStatusMap
    decodedRaw: DecodedRawItem[]
    decodedBit: DecodedBitItem[]
    hasAI: boolean
}

export function TeknikAccordionItem({
    arah,
    channels,
    teknikMap,
    decodedRaw,
    decodedBit,
    hasAI,
}: TeknikAccordionItemProps) {
    const [open, setOpen] = useState(true)

    // Worst status across all channels for this arah
    const SEV: Record<StatusAncaman, number> = { Aman: 0, Mencurigakan: 1, Berbahaya: 2 }
    let worstStatus: StatusAncaman | undefined
    for (const ch of channels) {
        const st = teknikMap[makeTeknikKey(ch, arah)]
        if (st && (!worstStatus || SEV[st] > SEV[worstStatus])) worstStatus = st
    }

    return (
        <div className="rounded-xl border border-neutral-100 overflow-hidden">

            {/* ── Accordion header ── */}
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5
                    bg-neutral-50 hover:bg-neutral-100/80 transition-colors text-left"
            >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {/* Chevron */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                        fill="currentColor" viewBox="0 0 256 256"
                        className={`text-neutral-400 shrink-0 transition-transform duration-200
                            ${open ? 'rotate-180' : ''}`}
                    >
                        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
                    </svg>

                    {/* Arah label — from TEKNIK_LABEL record */}
                    <span className="text-xs font-semibold text-neutral-700 truncate">
                        {TEKNIK_LABEL[arah]}
                    </span>

                    {/* Channel pills */}
                    <div className="flex gap-0.5 shrink-0">
                        {channels.map(ch => (
                            <span
                                key={ch}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold border leading-none
                                    ${CHANNEL_COLOR[ch] ?? 'bg-neutral-100 text-neutral-500 border-neutral-200'}`}
                            >
                                {ch}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Worst status badge */}
                {worstStatus ? (
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full
                        text-[10px] font-medium border shrink-0 ${STATUS_COLOR[worstStatus]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[worstStatus]}`} />
                        {worstStatus}
                    </span>
                ) : hasAI ? (
                    <span className="text-[10px] text-neutral-300 italic shrink-0">
                        Belum diinterpretasi
                    </span>
                ) : null}
            </button>

            {/* ── Channel sub-rows ── */}
            {open && (
                <div className="divide-y divide-neutral-100">
                    {channels.map(ch => {
                        const status = teknikMap[makeTeknikKey(ch, arah)]
                        const rawItem = decodedRaw.find(r => r.channel === ch && r.arah === arah)
                        const bitItem = decodedBit.find(b => b.channel === ch && b.arah === arah)
                        const chStyle = CH_STYLE[ch as keyof typeof CH_STYLE]

                        return (
                            <div key={ch} className="px-4 py-3 bg-white space-y-2.5">

                                {/* Channel label + AI status */}
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full shrink-0
                                            ${chStyle?.dot ?? 'bg-neutral-400'}`}
                                        />
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border
                                            ${CHANNEL_COLOR[ch] ?? 'bg-neutral-100 text-neutral-500 border-neutral-200'}`}>
                                            Channel {ch}
                                        </span>
                                    </div>
                                    {status ? (
                                        <StatusBadge status={status} />
                                    ) : hasAI ? (
                                        <span className="text-[10px] text-neutral-300 italic">
                                            Belum diinterpretasi
                                        </span>
                                    ) : null}
                                </div>

                                {/* Decoded data */}
                                {(bitItem || rawItem) ? (
                                    <div className="ml-4 space-y-2">

                                        {/* Bit LSB — bits: string, total_bits: number */}
                                        {bitItem && bitItem.bits.length > 0 && (
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">
                                                        Bit LSB
                                                    </span>
                                                    <span className="text-[10px] font-mono text-neutral-400">
                                                        {bitItem.total_bits.toLocaleString()} bit
                                                    </span>
                                                </div>
                                                <div className="px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800">
                                                    <code className="text-[10px] font-mono text-emerald-400 break-all leading-relaxed">
                                                        {truncateBin(bitItem.bits)}
                                                    </code>
                                                </div>
                                            </div>
                                        )}

                                        {/* Raw Text — text: string, base64_encoded?: boolean (flag only), printable_ratio: number, total_chars: number */}
                                        {rawItem && (
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">
                                                            Raw Text
                                                        </span>
                                                        {rawItem.base64_encoded && (
                                                            <span className="px-1 py-0.5 rounded text-[9px] font-semibold leading-none
                                                                bg-violet-50 text-violet-600 border border-violet-200">
                                                                base64
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] font-mono text-neutral-400 shrink-0">
                                                        {rawItem.total_chars.toLocaleString()} char
                                                    </span>
                                                </div>
                                                <div className="px-2.5 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200">
                                                    <code className="text-[10px] font-mono text-neutral-700 break-all
                                                        leading-relaxed whitespace-pre-wrap">
                                                        {truncateText(rawItem.text)}
                                                    </code>
                                                </div>
                                                {/* Printable ratio bar */}
                                                <div className="flex items-center gap-2 pt-0.5">
                                                    <div className="flex-1 h-1 bg-neutral-200 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all ${rawItem.printable_ratio >= 0.7
                                                                ? 'bg-emerald-500'
                                                                : rawItem.printable_ratio >= 0.4
                                                                    ? 'bg-amber-400'
                                                                    : 'bg-red-500'
                                                                }`}
                                                            style={{ width: `${Math.round(rawItem.printable_ratio * 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className={`text-[10px] font-mono font-semibold shrink-0 ${rawItem.printable_ratio >= 0.7
                                                        ? 'text-emerald-600'
                                                        : rawItem.printable_ratio >= 0.4
                                                            ? 'text-amber-600'
                                                            : 'text-red-600'
                                                        }`}>
                                                        {Math.round(rawItem.printable_ratio * 100)}% printable
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                ) : (
                                    <p className="ml-4 text-[10px] text-neutral-300 italic">
                                        Data decode belum tersedia
                                    </p>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
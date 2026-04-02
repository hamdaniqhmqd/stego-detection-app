import { makeTeknikKey, TeknikStatusMap } from "@/hooks/useInterpretasiAI"
import { HasilInterpretasi, StatusAncaman } from "@/types/aiInterpretasi"
import { TokenUsageSummary } from "@/types/analysis"
import { Channel, TEKNIK_LABEL, TeknikArah } from "@/types/shared"
import { useState } from "react"
import { Tooltip } from "../Ui/ToolTip"
import { CHANNEL_TOOLTIP, ChannelBlock } from "../Ui/ChannelBlock"
import { fmtTokens } from "@/utils/format"
import { CHANNEL_COLOR, STATUS_COLOR, STATUS_DOT } from "@/utils/Channel"

export interface TeknikAccordionProps {
    arah: TeknikArah
    channels: Channel[]
    hasilAI: HasilInterpretasi[]
    teknikMap: TeknikStatusMap
    index: number
    tokenUsage?: TokenUsageSummary | null
}

export const ARAH_TOOLTIP: Record<TeknikArah, string> = {
    'atas-bawah-kiri-kanan-col': 'Piksel dibaca per kolom (column-major): dari atas ke bawah dalam satu kolom, lalu lanjut ke kolom berikutnya dari kiri ke kanan.',
    'atas-bawah-kanan-kiri-col': 'Piksel dibaca per kolom (column-major): dari atas ke bawah dalam satu kolom, lalu lanjut ke kolom berikutnya dari kanan ke kiri.',
    'bawah-atas-kiri-kanan-col': 'Piksel dibaca per kolom (column-major): dari bawah ke atas dalam satu kolom, lalu lanjut ke kolom berikutnya dari kiri ke kanan.',
    'bawah-atas-kanan-kiri-col': 'Piksel dibaca per kolom (column-major): dari bawah ke atas dalam satu kolom, lalu lanjut ke kolom berikutnya dari kanan ke kiri.',
    'kiri-kanan-atas-bawah-row': 'Piksel dibaca per baris (row-major): dari kiri ke kanan dalam satu baris, lalu lanjut ke baris berikutnya dari atas ke bawah. Pola standar paling umum.',
    'kanan-kiri-atas-bawah-row': 'Piksel dibaca per baris (row-major): dari kanan ke kiri dalam satu baris, lalu lanjut ke baris berikutnya dari atas ke bawah.',
    'kiri-kanan-bawah-atas-row': 'Piksel dibaca per baris (row-major): dari kiri ke kanan dalam satu baris, lalu lanjut ke baris berikutnya dari bawah ke atas.',
    'kanan-kiri-bawah-atas-row': 'Piksel dibaca per baris (row-major): dari kanan ke kiri dalam satu baris, lalu lanjut ke baris berikutnya dari bawah ke atas.',
};

export function TeknikAccordion({ arah, channels, hasilAI, teknikMap, index, tokenUsage }: TeknikAccordionProps) {
    const [open, setOpen] = useState(true)

    const SEV: Record<StatusAncaman, number> = { Aman: 0, Mencurigakan: 1, Berbahaya: 2 }
    let worstStatus: StatusAncaman | undefined
    for (const ch of channels) {
        const st = teknikMap[makeTeknikKey(ch, arah)]
        if (st && (!worstStatus || SEV[st] > SEV[worstStatus])) worstStatus = st
    }

    // Jumlah token untuk teknik (arah) ini
    const arahTokens = tokenUsage?.per_item
        .filter(p => p.arah === arah)
        .reduce((sum, p) => sum + p.total_tokens, 0) ?? 0

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
                <Tooltip text={`Teknik ke-${index + 1}: ekstraksi LSB dengan arah baca "${TEKNIK_LABEL[arah]}"`}>
                    <span className="text-xs font-mono font-bold text-neutral-800 shrink-0 w-5 cursor-default">
                        T{index + 1}
                    </span>
                </Tooltip>

                <svg
                    xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                    fill="currentColor" viewBox="0 0 256 256"
                    className={`text-neutral-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                >
                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
                </svg>

                <Tooltip text={ARAH_TOOLTIP[arah]}>
                    <span className="text-xs font-semibold text-neutral-800 flex-1 cursor-default">
                        {TEKNIK_LABEL[arah]}
                    </span>
                </Tooltip>

                <div className="flex gap-0.5 shrink-0">
                    {channels.map(ch => (
                        <Tooltip key={ch} text={`Channel ${ch} — ${CHANNEL_TOOLTIP[ch]?.split(':')[1]?.trim() ?? ''}`}>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border leading-none cursor-default
                                ${CHANNEL_COLOR[ch] ?? 'bg-neutral-100 text-neutral-500 border-neutral-200'}`}>
                                {ch}
                            </span>
                        </Tooltip>
                    ))}
                </div>

                <Tooltip text="Jumlah channel warna (R/G/B) yang dianalisis pada arah scan ini">
                    <span className="text-[10px] font-mono text-neutral-400 shrink-0 cursor-default">
                        {channels.length} kanal
                    </span>
                </Tooltip>

                {/* Token badge per arah */}
                {arahTokens > 0 && (
                    <Tooltip text={`Total token AI yang dikonsumsi untuk teknik arah ini: ${arahTokens.toLocaleString()} token`}>
                        <span className="flex items-center gap-1 text-[10px] font-mono
                            text-violet-600 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-sm
                            shrink-0 cursor-default">
                            <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9"
                                fill="currentColor" viewBox="0 0 256 256">
                                <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z" />
                            </svg>
                            {fmtTokens(arahTokens)}
                        </span>
                    </Tooltip>
                )}

                {worstStatus ? (
                    <Tooltip text="Status terparah dari seluruh channel pada arah ini">
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]
                            font-medium border shrink-0 cursor-default ${STATUS_COLOR[worstStatus]}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[worstStatus]}`} />
                            {worstStatus}
                        </span>
                    </Tooltip>
                ) : (
                    <Tooltip text="Belum ada hasil interpretasi AI untuk teknik ini">
                        <span className="text-[10px] text-neutral-300 italic shrink-0 cursor-default">
                            Belum diinterpretasi
                        </span>
                    </Tooltip>
                )}
            </button>

            {open && (
                <div className="divide-y divide-neutral-100">
                    {channels.map(ch => {
                        const h = hasilAI.find(x => x.channel === ch && x.arah === arah)
                        const perItemUsage = tokenUsage?.per_item.find(
                            p => p.channel === ch && p.arah === arah
                        )
                        return (
                            <div key={ch} className="py-3">
                                <ChannelBlock ch={ch} h={h} arah={arah} perItemUsage={perItemUsage} />
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
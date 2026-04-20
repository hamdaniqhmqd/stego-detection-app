import { HasilInterpretasi, StatusAncaman } from "@/types/aiInterpretasi"
import { Channel, TEKNIK_LABEL, TeknikArah } from "@/types/shared"
import { CH_STYLE, STATUS_COLOR, STATUS_DOT } from "@/utils/Channel"
import { Tooltip } from "./ToolTip"
import { AIInterpretationBlock } from "./AIInterpretationBlock"
import { PerItemTokenUsage } from "@/types/GeminiToken"

export const CHANNEL_TOOLTIP: Record<string, string> = {
    R: 'Channel Merah (Red): menyimpan nilai intensitas merah setiap piksel. LSB dari channel ini yang diekstrak dan dianalisis.',
    G: 'Channel Hijau (Green): menyimpan nilai intensitas hijau setiap piksel. Channel paling sensitif terhadap mata manusia.',
    B: 'Channel Biru (Blue): menyimpan nilai intensitas biru setiap piksel. Sering digunakan sebagai media steganografi karena perubahan tidak mudah terdeteksi.',
}

export function ChannelBlock({
    ch, h, arah, perItemUsage,
}: {
    ch: Channel
    h?: HasilInterpretasi
    arah: TeknikArah
    perItemUsage?: PerItemTokenUsage
}) {
    const chStyle = CH_STYLE[ch]
    const status = h?.status_ancaman as StatusAncaman | undefined

    return (
        <div className="rounded-sm border border-neutral-200 bg-neutral-50">
            {/* Channel header */}
            <div className={`flex items-center justify-between px-3.5 py-2.5 border-b rounded-t-sm ${chStyle.header} bg-neutral-50`}>
                <Tooltip text={CHANNEL_TOOLTIP[ch] ?? `Channel ${ch}`}>
                    <div className="flex items-center gap-2 cursor-default">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${chStyle.dot}`} />
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${chStyle.pill}`}>
                            CH-{ch}
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11"
                            fill="currentColor" viewBox="0 0 256 256" className="opacity-40">
                            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z" />
                        </svg>
                    </div>
                </Tooltip>

                <div className="flex items-center gap-2 shrink-0">
                    {/* Token usage per channel (jika ada) */}
                    {perItemUsage && perItemUsage.total_tokens > 0 && (
                        <Tooltip text={`Token dipakai: ${perItemUsage.prompt_tokens.toLocaleString()} prompt + ${perItemUsage.candidates_tokens.toLocaleString()} respons`}>
                            <span className="flex items-center gap-1 text-[10px] font-mono
                                text-violet-600 bg-violet-50 border border-violet-200
                                px-1.5 py-0.5 rounded cursor-default">
                                <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9"
                                    fill="currentColor" viewBox="0 0 256 256" className="shrink-0">
                                    <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z" />
                                </svg>
                                {perItemUsage.total_tokens.toLocaleString()} tok
                            </span>
                        </Tooltip>
                    )}

                    {status ? (
                        <Tooltip text={`Hasil penilaian AI untuk channel ${ch} dengan arah "${TEKNIK_LABEL[arah]}"`}>
                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]
                                font-medium border cursor-default ${STATUS_COLOR[status]}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />
                                {status}
                            </span>
                        </Tooltip>
                    ) : (
                        <Tooltip text="Kombinasi channel dan arah ini tidak memiliki data interpretasi dari model AI">
                            <span className="text-[10px] text-neutral-300 italic cursor-default">Belum diinterpretasi</span>
                        </Tooltip>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className="p-3.5">
                {h ? (
                    <AIInterpretationBlock h={h} />
                ) : (
                    <div className="rounded-md border border-dashed border-neutral-200
                        px-3 py-2 flex items-center gap-2 text-neutral-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11"
                            fill="currentColor" viewBox="0 0 256 256" className="shrink-0">
                            <path d="M232,128a104,104,0,1,1-104-104A104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128ZM96,112a12,12,0,1,0-12-12A12,12,0,0,0,96,112Zm64,0a12,12,0,1,0-12-12A12,12,0,0,0,160,112Zm4.44,56.06a8,8,0,0,0-11-2.66,52.06,52.06,0,0,1-50.88,0,8,8,0,1,0-7.84,13.94,68,68,0,0,0,66.56,0A8,8,0,0,0,164.44,168.06Z" />
                        </svg>
                        <span className="text-[10px] italic">Channel ini belum diinterpretasi AI</span>
                    </div>
                )}
            </div>
        </div>
    )
}
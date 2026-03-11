import { HasilInterpretasi, TokenUsageSummary } from "@/types/analysis"
import { Channel, type TeknikArah } from "@/types/shared"
import { Tooltip } from "../Ui/ToolTip"
import { TeknikAccordion } from '@/components/Accordion/TeknikAccordion'
import { fmtTokens } from "@/utils/format"
import { type TeknikStatusMap } from "@/hooks/useInterpretasiAI"

export function HasilInterpretasiSection({
    hasilAI,
    teknikByArah,
    teknikMap,
    waktuProses,
    tokenUsage,
}: {
    hasilAI: HasilInterpretasi[]
    teknikByArah: Map<TeknikArah, Channel[]>
    teknikMap: TeknikStatusMap
    waktuProses?: string | null
    tokenUsage?: TokenUsageSummary | null
}) {
    const totalKombinasi = hasilAI.length

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3
                px-5 py-4 rounded-sm bg-neutral-50 border border-neutral-200">
                <div className="flex-1">
                    <h2 className="text-sm font-semibold text-neutral-900">Hasil Interpretasi AI</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                        <Tooltip text="Jumlah pasangan channel × arah yang berhasil diinterpretasi oleh model AI">
                            <span className="cursor-default underline decoration-dotted decoration-neutral-300">
                                {totalKombinasi} kombinasi kanal
                            </span>
                        </Tooltip>
                        {' '}&nbsp;·&nbsp;Metode:{' '}
                        <Tooltip text="Proses analisis teks menggunakan Large Language Model (LLM) untuk menilai apakah data LSB mengandung pesan tersembunyi">
                            <span className="font-semibold text-neutral-800 cursor-default underline decoration-dotted decoration-neutral-400">
                                interpretasi-ai
                            </span>
                        </Tooltip>
                        {waktuProses && (
                            <>
                                {' '}&nbsp;·&nbsp;
                                <Tooltip text="Total waktu yang dibutuhkan model AI untuk memproses seluruh kombinasi channel dan arah">
                                    <span className="cursor-default underline decoration-dotted decoration-neutral-300">
                                        {waktuProses}
                                    </span>
                                </Tooltip>
                            </>
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Tooltip text="Jumlah total pasangan channel × arah yang diinterpretasi oleh model AI dalam satu sesi ini">
                        <div className="px-3 py-1.5 rounded-sm bg-neutral-50 border border-neutral-200 text-center cursor-default
                            transition-all duration-150
                            hover:-translate-y-0.5 hover:shadow-[-3px_3px_0_rgba(163,163,163,1)] hover:border-neutral-400">
                            <p className="text-xs font-mono font-bold text-neutral-800">{totalKombinasi}</p>
                            <p className="text-[9px] text-neutral-600 uppercase tracking-wide">kombinasi</p>
                        </div>
                    </Tooltip>
                    <Tooltip text="Jumlah arah baca piksel yang digunakan">
                        <div className="px-3 py-1.5 rounded-sm bg-neutral-50 border border-neutral-200 text-center cursor-default
                            transition-all duration-150
                            hover:-translate-y-0.5 hover:shadow-[-3px_3px_0_rgba(163,163,163,1)] hover:border-neutral-400">
                            <p className="text-xs font-mono font-bold text-neutral-800">{teknikByArah.size}</p>
                            <p className="text-[9px] text-neutral-600 uppercase tracking-wide">arah scan</p>
                        </div>
                    </Tooltip>
                    {/* Total token ringkas di header */}
                    {tokenUsage && (
                        <Tooltip text={`Total seluruh token Gemini API yang dikonsumsi: ${tokenUsage.total_tokens.toLocaleString()} token`}>
                            <div className="px-3 py-1.5 rounded-sm bg-violet-50 border border-violet-200 text-center cursor-default
                                transition-all duration-150
                                hover:-translate-y-0.5 hover:shadow-[-3px_3px_0_rgba(139,92,246,0.3)] hover:border-violet-400">
                                <p className="text-xs font-mono font-bold text-violet-700">
                                    {fmtTokens(tokenUsage.total_tokens)}
                                </p>
                                <p className="text-[9px] text-violet-500 uppercase tracking-wide">token</p>
                            </div>
                        </Tooltip>
                    )}
                </div>
            </div>

            <div className="space-y-4 py-2">
                {[...teknikByArah.entries()].map(([arah, channels], i) => (
                    <TeknikAccordion
                        key={arah}
                        index={i}
                        arah={arah}
                        channels={channels}
                        hasilAI={hasilAI}
                        teknikMap={teknikMap}
                        tokenUsage={tokenUsage}
                    />
                ))}
                {teknikByArah.size === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 gap-2 text-neutral-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"
                            fill="currentColor" viewBox="0 0 256 256">
                            <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z" />
                        </svg>
                        <p className="text-sm">Belum ada hasil interpretasi</p>
                    </div>
                )}
            </div>
        </div>
    )
}
import { TokenUsageSummary } from "@/types/analysis";
import { Tooltip } from "./ToolTip";
import { fmtTokens } from "@/utils/format";
import { TEKNIK_LABEL, TeknikArah } from "@/types/shared";

export function TokenBar({ value, max }: { value: number; max: number }) {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0
    const color =
        pct >= 60 ? 'bg-neutral-500' :
            pct >= 30 ? 'bg-neutral-400' : 'bg-neutral-300'

    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${color}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-[10px] font-mono text-neutral-400 w-8 text-right shrink-0">
                {pct}%
            </span>
        </div>
    )
}

export function TokenUsageSection({ usage }: { usage: TokenUsageSummary }) {
    const maxPerItem = Math.max(...usage.per_item.map(p => p.total_tokens), 1)

    // Hitung berapa item yang tidak 0
    const activeItems = usage.per_item.filter(p => p.total_tokens > 0)

    return (
        <div className="space-y-4">
            {/* Ringkasan total (3 stat cards) */}
            <div className="grid grid-cols-3 gap-3">
                {/* Total keseluruhan */}
                <Tooltip text="Total seluruh token yang dikonsumsi pada sesi interpretasi ini (prompt + respons AI)">
                    <div className="relative px-4 py-3 rounded-sm border border-neutral-200 bg-neutral-50
                        hover:-translate-y-0.5 hover:shadow-[-4px_4px_0_rgba(163,163,163,1)]
                        hover:border-neutral-400 transition-all duration-150 cursor-default overflow-hidden">
                        {/* Dekoratif dot pojok */}
                        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-violet-300 opacity-60" />
                        <p className="text-[10px] font-medium text-violet-500 uppercase tracking-wide mb-1">
                            Total Token
                        </p>
                        <p className="text-xl font-mono font-bold text-violet-700 leading-none">
                            {usage.total_tokens.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-violet-400 mt-1 font-mono">
                            ≈ {fmtTokens(usage.total_tokens)}
                        </p>
                    </div>
                </Tooltip>

                {/* Prompt tokens */}
                <Tooltip text="Token yang dipakai untuk teks input (prompt) yang dikirim ke model AI, termasuk instruksi sistem dan data LSB">
                    <div className="relative px-4 py-3 rounded-sm border border-neutral-200 bg-neutral-50
                        hover:-translate-y-0.5 hover:shadow-[-4px_4px_0_rgba(163,163,163,1)]
                        hover:border-neutral-400 transition-all duration-150 cursor-default overflow-hidden">
                        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-300 opacity-60" />
                        <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide mb-1">
                            Prompt
                        </p>
                        <p className="text-xl font-mono font-bold text-neutral-800 leading-none">
                            {usage.total_prompt_tokens.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-neutral-400 mt-1 font-mono">
                            {usage.total_tokens > 0
                                ? `${Math.round((usage.total_prompt_tokens / usage.total_tokens) * 100)}% dari total`
                                : '—'
                            }
                        </p>
                    </div>
                </Tooltip>

                {/* Candidates tokens */}
                <Tooltip text="Token yang dihasilkan oleh model AI sebagai respons/interpretasi, mencerminkan panjang teks analisis yang diberikan">
                    <div className="relative px-4 py-3 rounded-sm border border-neutral-200 bg-neutral-50
                        hover:-translate-y-0.5 hover:shadow-[-4px_4px_0_rgba(163,163,163,1)]
                        hover:border-neutral-400 transition-all duration-150 cursor-default overflow-hidden">
                        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-300 opacity-60" />
                        <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide mb-1">
                            Respons AI
                        </p>
                        <p className="text-xl font-mono font-bold text-neutral-800 leading-none">
                            {usage.total_candidates_tokens.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-neutral-400 mt-1 font-mono">
                            {usage.total_tokens > 0
                                ? `${Math.round((usage.total_candidates_tokens / usage.total_tokens) * 100)}% dari total`
                                : '—'
                            }
                        </p>
                    </div>
                </Tooltip>
            </div>

            {/* Detail per-item */}
            {activeItems.length > 0 && (
                <div className="space-y-1">
                    <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-wide mb-2">
                        Rincian per Kombinasi ({activeItems.length} request)
                    </p>
                    <div className="divide-y divide-neutral-100 rounded-sm border border-neutral-200 overflow-hidden">
                        {usage.per_item.map((item, i) => (
                            <div key={i} className={`px-3 py-2.5 ${item.total_tokens === 0 ? 'opacity-40 bg-neutral-50' : 'bg-white'}`}>
                                {/* Baris atas: channel, arah, total token */}
                                <div className="flex items-center gap-2 mb-1.5">
                                    {/* Channel pill */}
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border leading-none shrink-0
                                        ${item.channel === 'R' ? 'bg-red-100 text-red-600 border-red-200 ring-1 ring-red-200' :
                                            item.channel === 'G' ? 'bg-emerald-100 text-emerald-600 border-emerald-200 ring-1 ring-emerald-200' :
                                                'bg-blue-100 text-blue-600 border-blue-200 ring-1 ring-blue-200'}`}>
                                        {item.channel}
                                    </span>

                                    {/* Arah */}
                                    <span className="text-[11px] text-neutral-600 font-medium truncate flex-1 min-w-0">
                                        {TEKNIK_LABEL[item.arah as TeknikArah] ?? item.arah}
                                    </span>

                                    {/* Total token item ini */}
                                    {item.total_tokens > 0 ? (
                                        <span className="text-[11px] font-mono font-semibold text-neutral-700 shrink-0">
                                            {item.total_tokens.toLocaleString()}
                                            <span className="text-[9px] font-normal text-neutral-400 ml-0.5">tok</span>
                                        </span>
                                    ) : (
                                        <span className="text-[10px] text-neutral-300 italic shrink-0">
                                            Dilewati
                                        </span>
                                    )}
                                </div>

                                {/* Bar proporsional */}
                                {item.total_tokens > 0 && (
                                    <TokenBar value={item.total_tokens} max={maxPerItem} />
                                )}

                                {/* Breakdown prompt / candidates */}
                                {item.total_tokens > 0 && (
                                    <div className="flex items-center gap-4 mt-1.5 text-[10px] text-neutral-400 font-mono">
                                        <span className="flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-300 shrink-0" />
                                            Prompt: {item.prompt_tokens.toLocaleString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 shrink-0" />
                                            Respons: {item.candidates_tokens.toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
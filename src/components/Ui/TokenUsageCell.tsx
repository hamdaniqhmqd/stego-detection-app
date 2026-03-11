import { TokenUsageSummary } from "@/types/analysis"
import { fmtTokens } from "@/utils/format"

export function TokenUsageCell({ usage }: { usage?: TokenUsageSummary | null }) {
    if (!usage) return <span className="text-[11px] text-neutral-300 italic">—</span>

    const total = usage.total_tokens
    const label = usage.gemini_token_label
    const tokenColor =
        total >= 50_000 ? 'text-red-600 bg-red-50 border-red-200' :
            total >= 20_000 ? 'text-amber-600 bg-amber-50 border-amber-200' :
                'text-neutral-700 bg-neutral-50 border-neutral-200'

    return (
        <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-1 min-w-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 256 256" className="text-violet-400 shrink-0">
                    <path d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208Z" />
                </svg>
                <span className="text-[10px] text-violet-600 font-medium truncate max-w-28" title={label}>{label}</span>
            </div>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm border text-[11px] font-mono font-semibold w-fit ${tokenColor}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" fill="currentColor" viewBox="0 0 256 256" className="opacity-60 shrink-0">
                    <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z" />
                </svg>
                <span className="text-nowrap">{fmtTokens(total)} token</span>
            </span>
        </div>
    )
}
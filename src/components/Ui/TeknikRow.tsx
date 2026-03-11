import { StatusAncaman } from "@/types/aiInterpretasi"
import { CHANNEL_COLOR, STATUS_BG, STATUS_DOT, STATUS_RING, STATUS_TEXT } from "@/utils/Channel"
import { formatArah } from "@/utils/format"

export function TeknikRow({
    arah,
    channels,
    status,
}: {
    arah: string
    channels: string[]
    status?: StatusAncaman
}) {
    return (
        <div
            className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-sm border text-xs w-fit
                ${status
                    ? `${STATUS_BG[status]} ring-1 ${STATUS_RING[status]} border-transparent`
                    : 'bg-neutral-50 border-neutral-200'
                }`}
        >
            {/* Arah scan */}
            <span className={`font-medium whitespace-nowrap ${status ? STATUS_TEXT[status] : 'text-neutral-600'}`}>
                {formatArah(arah)}
            </span>

            {/* Channel badges */}
            <div className="flex items-center gap-0.5">
                {channels.map(ch => (
                    <span
                        key={ch}
                        className={`px-1 py-0.5 rounded text-[10px] font-bold ring-1 leading-none
                            ${CHANNEL_COLOR[ch] ?? 'bg-neutral-100 text-neutral-500 ring-neutral-200'}`}
                    >
                        {ch}
                    </span>
                ))}
            </div>

            {/* Status dot + label */}
            <span className={`flex items-center gap-1 font-medium whitespace-nowrap
                ${status ? STATUS_TEXT[status] : 'text-neutral-400'}`}>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0
                    ${status ? STATUS_DOT[status] : 'bg-neutral-400'}`}
                />
                {status ?? 'Belum dianalisis'}
            </span>
        </div>
    )
}
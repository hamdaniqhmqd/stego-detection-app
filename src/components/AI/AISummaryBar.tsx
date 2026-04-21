import { buildTeknikStatusMap } from "@/hooks/useInterpretasiAI"
import { StatusAncaman } from "@/types/aiInterpretasi"
import { HasilInterpretasi } from "@/types/analysis"
import { Tooltip } from "../Ui/ToolTip"
import { STATUS_COLOR, STATUS_DOT } from "@/utils/Channel"

// AI Summary bar
export function AISummaryBar({ hasil }: { hasil: HasilInterpretasi[] }) {
    const teknikMap = buildTeknikStatusMap(hasil)
    const counts: Record<StatusAncaman, number> = { Aman: 0, Mencurigakan: 0, Berbahaya: 0 }
    for (const st of Object.values(teknikMap)) counts[st as StatusAncaman]++
    const total = Object.values(counts).reduce((a, b) => a + b, 0)
    if (total === 0) return null

    const worstStatus: StatusAncaman =
        counts.Berbahaya > 0 ? 'Berbahaya' :
            counts.Mencurigakan > 0 ? 'Mencurigakan' : 'Aman'

    const statusTooltip: Record<StatusAncaman, string> = {
        Aman: 'Semua kombinasi channel & arah dinilai tidak mengandung konten berbahaya oleh model AI',
        Mencurigakan: 'Terdapat satu atau lebih kombinasi yang mengandung pola atau konten yang perlu diperiksa lebih lanjut',
        Berbahaya: 'Terdapat satu atau lebih kombinasi yang dinilai mengandung konten berbahaya atau steganografi aktif',
    }

    return (
        <Tooltip text={statusTooltip[worstStatus]}>
            <div className={`flex items-center gap-4 px-4 py-3 rounded-sm border cursor-default ${STATUS_COLOR[worstStatus]}`}>
                <div className="flex items-center gap-2 flex-1">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[worstStatus]}`} />
                    <span className="text-xs font-semibold">Status Keseluruhan: {worstStatus}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                    {(['Aman', 'Mencurigakan', 'Berbahaya'] as StatusAncaman[]).map(s =>
                        counts[s] > 0 ? (
                            <span key={s} className="flex items-center gap-1 opacity-80">
                                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[s]}`} />
                                {counts[s]} {s}
                            </span>
                        ) : null
                    )}
                </div>
            </div>
        </Tooltip>
    )
}
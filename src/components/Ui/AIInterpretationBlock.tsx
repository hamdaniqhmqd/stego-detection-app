import { HasilInterpretasi, StatusAncaman } from "@/types/aiInterpretasi"
import { Tooltip } from "./ToolTip"
import { AIInterpretationText } from "./AIInterpretationFormatter"
import { STATUS_COLOR, STATUS_DOT } from "@/utils/Channel"

// AI Interpretation block─
export function AIInterpretationBlock({ h }: { h: HasilInterpretasi }) {
    const status = h.status_ancaman as StatusAncaman

    const containerColor: Record<StatusAncaman, string> = {
        Aman: 'border-emerald-200 bg-emerald-50/60',
        Mencurigakan: 'border-amber-200 bg-amber-50/60',
        Berbahaya: 'border-red-200 bg-red-50/60',
    }
    const labelColor: Record<StatusAncaman, string> = {
        Aman: 'text-emerald-700',
        Mencurigakan: 'text-amber-700',
        Berbahaya: 'text-red-700',
    }
    const statusTooltip: Record<StatusAncaman, string> = {
        Aman: 'Model AI menilai data pada kombinasi channel & arah ini tidak mengandung pesan tersembunyi yang berbahaya',
        Mencurigakan: 'Model AI menemukan pola yang tidak biasa. Perlu pemeriksaan manual lebih lanjut untuk memastikan',
        Berbahaya: 'Model AI mendeteksi indikasi kuat adanya pesan tersembunyi (steganografi aktif) pada kombinasi ini',
    }

    return (
        <div className={`rounded-md border px-3.5 py-3 space-y-2 ${containerColor[status]}`}>
            <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11"
                    fill="currentColor" viewBox="0 0 256 256"
                    className={`shrink-0 ${labelColor[status]}`}>
                    <path d="M232,128a104,104,0,1,1-104-104A104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128ZM96,112a12,12,0,1,0-12-12A12,12,0,0,0,96,112Zm64,0a12,12,0,1,0-12-12A12,12,0,0,0,160,112Zm4.44,56.06a8,8,0,0,0-11-2.66,52.06,52.06,0,0,1-50.88,0,8,8,0,1,0-7.84,13.94,68,68,0,0,0,66.56,0A8,8,0,0,0,164.44,168.06Z" />
                </svg>
                <Tooltip text="Hasil analisis teks oleh model AI terhadap data LSB yang diekstrak dari kombinasi channel dan arah ini">
                    <span className={`text-[10px] font-semibold uppercase tracking-wide cursor-default ${labelColor[status]}`}>
                        Interpretasi AI
                    </span>
                </Tooltip>
                <Tooltip text={statusTooltip[status]}>
                    <span className={`ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full
                        text-[10px] font-medium border cursor-default ${STATUS_COLOR[status]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />
                        {status}
                    </span>
                </Tooltip>
            </div>
            <div className={`text-xs leading-relaxed ${labelColor[status]}`}>
                <AIInterpretationText text={h.interpretation} />
            </div>
        </div>
    )
}
interface MiniStatProps {
    label: string
    value: number | string
    color: string
    bg: string
    border: string
}

export function MiniStat({ label, value, color, bg, border }: MiniStatProps) {
    return (
        <div className={`${bg} rounded-md px-4 py-3 border ${border} shadow-sm`}>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
        </div>
    )
}
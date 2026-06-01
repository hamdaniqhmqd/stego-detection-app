interface SkeletonRowsProps {
    cols: number
    rows?: number
}

export function SkeletonRows({ cols, rows = 4 }: SkeletonRowsProps) {
    return (
        <>
            {Array(rows).fill(0).map((_, r) => (
                <tr key={r}>
                    {Array(cols).fill(0).map((_, c) => (
                        <td key={c} className="px-4 py-3">
                            <div className={`h-4 bg-neutral-100 rounded animate-pulse
                                ${c === 0 ? 'w-32' : c === cols - 1 ? 'w-16' : 'w-24'}`}
                            />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    )
}
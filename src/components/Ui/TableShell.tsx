// components/Dashboard/ui/TableShell.tsx
'use client'

interface TableShellProps {
    title: string
    subtitle?: string
    badge?: number | string
    actions?: React.ReactNode
    headers: string[]
    children: React.ReactNode
    hasMore?: boolean
    isLoadingMore?: boolean
    onLoadMore?: () => void
    isEmpty?: boolean
    emptyText?: string
}

export function TableShell({
    title,
    subtitle,
    badge,
    actions,
    headers,
    children,
    hasMore,
    isLoadingMore,
    onLoadMore,
    isEmpty,
    emptyText = 'Tidak ada data.',
}: TableShellProps) {
    return (
        <div className="bg-white rounded-sm border border-neutral-100 shadow-sm overflow-hidden">

            <div className="px-6 py-4 border-b border-neutral-100
                flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
                        {badge !== undefined && (
                            <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600
                                rounded-full text-xs font-medium">
                                {badge}
                            </span>
                        )}
                    </div>
                    {subtitle && (
                        <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>
                    )}
                </div>
                {actions && (
                    <div className="flex items-center gap-2">{actions}</div>
                )}
            </div>


            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-neutral-50 border-b border-neutral-100">
                            {headers.map((h, i) => (
                                <th
                                    key={i}
                                    className="px-4 py-3 text-left text-xs font-semibold
                                        text-neutral-500 uppercase tracking-wider whitespace-nowrap"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50">
                        {isEmpty ? (
                            <tr>
                                <td
                                    colSpan={headers.length}
                                    className="px-4 py-10 text-center text-sm text-neutral-400"
                                >
                                    {emptyText}
                                </td>
                            </tr>
                        ) : children}
                    </tbody>
                </table>
            </div>


            {hasMore && onLoadMore && (
                <div className="px-6 py-3 border-t border-neutral-100 flex justify-center">
                    <button
                        onClick={onLoadMore}
                        disabled={isLoadingMore}
                        className="text-sm text-neutral-500 hover:text-neutral-900 font-medium
                            flex items-center gap-2 disabled:opacity-50 transition-colors"
                    >
                        {isLoadingMore ? (
                            <>
                                <span className="w-4 h-4 border-2 border-neutral-300
                                    border-t-neutral-600 rounded-full animate-spin inline-block" />
                                Memuat…
                            </>
                        ) : 'Muat lebih banyak ↓'}
                    </button>
                </div>
            )}
        </div>
    )
}

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
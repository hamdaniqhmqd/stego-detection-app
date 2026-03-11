// src/components/Table/Pagination.tsx

export function Pagination({
    currentPage,
    totalPages,
    isLoading,
    onGoToPage,
}: {
    currentPage: number
    totalPages: number
    isLoading: boolean
    onGoToPage: (page: number) => void
}) {
    if (totalPages <= 1) return null

    // Hitung range halaman yang ditampilkan (max 5 tombol)
    const delta = 2
    const left = Math.max(1, currentPage - delta)
    const right = Math.min(totalPages, currentPage + delta)
    const pages: (number | '...')[] = []

    if (left > 1) { pages.push(1); if (left > 2) pages.push('...') }
    for (let i = left; i <= right; i++) pages.push(i)
    if (right < totalPages) { if (right < totalPages - 1) pages.push('...'); pages.push(totalPages) }

    const btnBase = 'inline-flex items-center justify-center min-w-8 h-8 px-2 rounded-sm border border-neutral-400 text-xs font-medium transition-all duration-300 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed'
    const btnActive = 'bg-neutral-50 text-neutral-900 pointer-events-none -translate-y-0.5 shadow-[-3px_4px_0_rgba(26,26,46,1)] border-neutral-700'
    const btnInactive = 'text-neutral-700 hover:text-neutral-900 hover:border-neutral-700 hover:-translate-y-0.5 hover:shadow-[-3px_4px_0_rgba(26,26,46,1)]'

    return (
        <div className="flex items-center justify-between px-1 pt-2">
            {/* Info */}
            <p className="text-xs text-neutral-400">
                Halaman <span className="font-medium text-neutral-600">{currentPage}</span> dari{' '}
                <span className="font-medium text-neutral-600">{totalPages}</span>
            </p>

            {/* Tombol */}
            <div className="flex items-center gap-1">
                {/* Prev */}
                <button
                    className={`${btnBase} ${btnInactive}`}
                    onClick={() => onGoToPage(currentPage - 1)}
                    disabled={currentPage <= 1 || isLoading}
                    aria-label="Halaman sebelumnya"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z" />
                    </svg>
                </button>

                {/* Page numbers */}
                {pages.map((p, i) =>
                    p === '...' ? (
                        <span key={`ellipsis-${i}`} className="inline-flex items-center justify-center min-w-8 h-8 text-xs text-neutral-400">
                            …
                        </span>
                    ) : (
                        <button
                            key={p}
                            className={`${btnBase} ${p === currentPage ? btnActive : btnInactive}`}
                            onClick={() => onGoToPage(p as number)}
                            disabled={isLoading}
                        >
                            {p}
                        </button>
                    )
                )}

                {/* Next */}
                <button
                    className={`${btnBase} ${btnInactive}`}
                    onClick={() => onGoToPage(currentPage + 1)}
                    disabled={currentPage >= totalPages || isLoading}
                    aria-label="Halaman berikutnya"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
                    </svg>
                </button>
            </div>
        </div>
    )
}
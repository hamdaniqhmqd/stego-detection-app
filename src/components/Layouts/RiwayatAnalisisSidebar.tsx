// components/Sidebar/RiwayatAnalisisSidebar.tsx

'use client'

import { useRiwayatAnalisis } from '@/hooks/useRiwayatAnalisis'
import { formatDateTime } from '@/utils/format'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { SkeletonItem } from '../Ui/SkeletonItem'
import { RiwayatItemRow } from '../Ui/RiwayatItemRow'

// Komponen Utama
interface RiwayatAnalisisSidebarProps {
    userId: string | undefined
    isCollapsed: boolean
}

export default function RiwayatAnalisisSidebar({
    userId,
    isCollapsed,
}: RiwayatAnalisisSidebarProps) {
    const pathname = usePathname()
    const { items, isLoading, isLoadingMore, hasMore, loadMore, error } =
        useRiwayatAnalisis(userId)

    // Infinite scroll sentinel
    const sentinelRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!sentinelRef.current || !hasMore) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isLoadingMore) {
                    loadMore()
                }
            },
            { threshold: 0.1 }
        )

        observer.observe(sentinelRef.current)
        return () => observer.disconnect()
    }, [hasMore, isLoadingMore, loadMore])

    // Collapsed mode: hanya tampilkan titik indicator
    if (isCollapsed) {
        return (
            <ul className="relative group my-2relative group my-2">
                {isLoading ? (
                    <>
                        {[...Array(3)].map((_, i) => (
                            <li key={i} className="w-6 h-1.5 bg-neutral-600 rounded-full animate-pulse" />
                        ))}
                    </>
                ) : (
                    items.slice(0, 5).map((item) => {
                        const isActive = pathname === `/dashboard/analisis_stego/${item.id}`
                        return (
                            <li className="">
                                <Link
                                    key={item.id}
                                    href={`/dashboard/analisis_stego/${item.id}`}
                                    title={`${formatDateTime(item.created_at)} · ${item.teknik_count} kombinasi`}
                                    className={`w-6 h-1.5 rounded-sm transition-all duration-300 ease-in-out
                                    border border-neutral-900
                                    ${isActive ? 'bg-neutral-400 hover:-translate-y-0.5 hover:shadow-[-5px_5px_0_rgba(26,26,46,1)]'
                                            : 'bg-neutral-700 hover:bg-neutral-500'}`}
                                />
                            </li>
                        )
                    })
                )}
                {items.length > 5 && (
                    <span className="text-[10px] text-neutral-700">+{items.length - 5}</span>
                )}
            </ul>
        )
    }

    // Full mode
    return (
        <div className="flex flex-col h-full">
            {/* Error */}
            {error && (
                <p className="text-xs text-red-500 px-3.5 py-2">{error}</p>
            )}

            {/* Loading skeleton */}
            {isLoading && (
                <div className="space-y-0.5">
                    {[...Array(5)].map((_, i) => (
                        <SkeletonItem key={i} />
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!isLoading && items.length === 0 && (
                <div className="px-3.5 py-4 text-center">
                    <p className="text-xs text-neutral-600">Belum ada riwayat analisis</p>
                </div>
            )}

            {/* List */}
            {!isLoading && items.length > 0 && (
                <ul className="space-y-2">
                    {items.map((item) => {
                        const isActive = pathname === `/dashboard/analisis_stego/${item.id}`
                        return (
                            <RiwayatItemRow
                                key={item.id}
                                item={item}
                                isActive={isActive}
                            />
                        )
                    })}

                    {/* Sentinel untuk infinite scroll */}
                    {hasMore && (
                        <div ref={sentinelRef} className="py-1">
                            {isLoadingMore && (
                                <div className="flex justify-center py-2">
                                    <svg className="animate-spin h-3.5 w-3.5 text-neutral-600" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    )}
                </ul>
            )}
        </div>
    )
}
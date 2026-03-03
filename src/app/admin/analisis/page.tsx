// app/admin/analisis/page.tsx
'use client'

import DashboardLayoutAdmins from '@/components/Layouts/DashboardLayoutAdmins'
import { SectionAnalisis } from './section/SectionAnalisis'
import { useRouter } from 'next/navigation'
import { useAnalysis } from '@/hooks/useAnalysis'

export default function AnalisisPage() {
    const router = useRouter()

    const {
        items: analysis,
        isLoading: analysisLoading,
        isLoadingMore: analysisLoadingMore,
        hasMore: analysisHasMore,
        loadMore: analysisLoadMore,
        softDelete: analysisSoftDelete,
        restore: analysisRestore,
        hardDelete: analysisHardDelete,
    } = useAnalysis()

    return (
        <DashboardLayoutAdmins>
            <div className="w-full min-h-screen bg-neutral-50">
                <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-10">

                    <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-neutral-600 mb-4">
                        <h2>Kelola Analisis</h2>
                        <div className="flex-1 h-px bg-neutral-300" />
                    </div>

                    <SectionAnalisis
                        items={analysis}
                        isLoading={analysisLoading}
                        hasMore={analysisHasMore}
                        isLoadingMore={analysisLoadingMore}
                        onLoadMore={analysisLoadMore}
                        onSoftDelete={analysisSoftDelete}
                        onRestore={analysisRestore}
                        onHardDelete={analysisHardDelete}
                        onDetail={(item) => router.push(`/admin/analisis/${item.id}`)}
                    />

                </div>
            </div>
        </DashboardLayoutAdmins>
    )
}
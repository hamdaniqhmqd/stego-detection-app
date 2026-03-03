// app/admin/analisis/page.tsx
'use client'

import DashboardLayoutAdmins from '@/components/Layouts/DashboardLayoutAdmins'
import { SectionInterpretasiAI } from './section/SectionInterpretasiAI'
import { useRouter } from 'next/navigation'
import { useInterpretasiAI } from '@/hooks/useInterpretasiAI'

export default function InterpretasiAIPage() {
    const router = useRouter()

    const {
        items: interpretasi,
        isLoading: interpretasiLoading,
        isLoadingMore: interpretasiLoadingMore,
        hasMore: interpretasiHasMore,
        loadMore: onInterpretasiLoadMore,
        softDelete: interpretasiSoftDelete,
        restore: interpretasiRestore,
        hardDelete: interpretasiHardDelete,
    } = useInterpretasiAI()

    return (
        <DashboardLayoutAdmins>
            <div className="w-full min-h-screen bg-neutral-50">
                <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-10">

                    <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-neutral-600 mb-4">
                        <h2>Kelola Interpretasi AI</h2>
                        <div className="flex-1 h-px bg-neutral-300" />
                    </div>

                    <SectionInterpretasiAI
                        items={interpretasi}
                        isLoading={interpretasiLoading}
                        hasMore={interpretasiHasMore}
                        isLoadingMore={interpretasiLoadingMore}
                        onLoadMore={onInterpretasiLoadMore}
                        onSoftDelete={interpretasiSoftDelete}
                        onRestore={interpretasiRestore}
                        onHardDelete={interpretasiHardDelete}
                        onDetail={(item) => router.push(`/admin/interpretasi/${item.id}`)}
                    />

                </div>
            </div>
        </DashboardLayoutAdmins>
    )
}
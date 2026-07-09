// app/admin/page.tsx

'use client'

import DashboardLayoutAdmins from '@/components/Layouts/DashboardLayoutAdmins'
import { DashboardOverview } from '../../components/Section/DashboardOverview'
import { useUsers } from '@/hooks/useUsers'
import { useAnalysis } from '@/hooks/useAnalysis'
import { useInterpretasiAI } from '@/hooks/useInterpretasiAI'

export default function DashboardAdminPage() {
    const {
        items: users,
        totalPengguna,
        totalSuperadmin,
        totalVerified
    } = useUsers()

    const {
        items: analysis,
    } = useAnalysis()
    const activeAnalysis = useAnalysis(false)
    const deletedAnalysis = useAnalysis(true)
    const totalAnalysis = activeAnalysis.total + deletedAnalysis.total

    const {
        items: interpretasi,
    } = useInterpretasiAI()
    const activeInterpretasi = useInterpretasiAI({ includeDeleted: false })
    const deletedInterpretasi = useInterpretasiAI({ includeDeleted: true })
    const { counts: globalCountsActive } = activeInterpretasi.globalStats
    const { counts: globalCountsDeleted } = deletedInterpretasi.globalStats
    const totalInterpretasi = (globalCountsActive.Aman + globalCountsActive.Mencurigakan + globalCountsActive.Berbahaya) + (globalCountsDeleted.Aman + globalCountsDeleted.Mencurigakan + globalCountsDeleted.Berbahaya)

    return (
        <DashboardLayoutAdmins>
            <div className="w-full min-h-screen bg-neutral-50">
                <div className="max-w-6xl mx-auto px-px md:px-2 lg:px-4 py-8 space-y-10">

                    <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-neutral-700 mb-4">
                        <h2 className='font-semibold'>Dashboard</h2>
                        <div className="flex-1 h-px bg-neutral-500" />
                    </div>

                    <DashboardOverview
                        // Users
                        users={users}
                        totalPengguna={totalPengguna}
                        totalSuperadmin={totalSuperadmin}
                        totalVerified={totalVerified}
                        // Analysis
                        analysis={analysis}
                        totalAnalysis={totalAnalysis}
                        // Interpretasi
                        interpretasi={interpretasi}
                        totalInterpretasi={totalInterpretasi}
                    />
                </div>
            </div>
        </DashboardLayoutAdmins>
    )
}
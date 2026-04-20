// app/admin/page.tsx

'use client'

import DashboardLayoutAdmins from '@/components/Layouts/DashboardLayoutAdmins'
import { DashboardOverview } from './section/DashboardOverview'
import { useUsers } from '@/hooks/useUsers'
import { useAnalysis } from '@/hooks/useAnalysis'
import { useInterpretasiAI } from '@/hooks/useInterpretasiAI'

export default function DashboardAdminPage() {
    const {
        items: users, total: usersTotal,
    } = useUsers()

    const {
        items: analysis, total: analysisTotal,
    } = useAnalysis()

    const {
        items: interpretasi, total: interpretasiTotal,
    } = useInterpretasiAI()

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
                        usersTotal={usersTotal}

                        // Analysis
                        analysis={analysis}
                        analysisTotal={analysisTotal}

                        // Interpretasi
                        interpretasi={interpretasi}
                        interpretasiTotal={interpretasiTotal}
                    />
                </div>
            </div>
        </DashboardLayoutAdmins>
    )
}
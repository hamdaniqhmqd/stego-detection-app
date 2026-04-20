// app/admin/analisis/page.tsx
'use client'

import DashboardLayoutAdmins from '@/components/Layouts/DashboardLayoutAdmins'
import { SectionAnalisis } from '../../../components/Section/SectionAnalisis'

export default function AnalisisPage() {
    return (
        <DashboardLayoutAdmins>
            <div className="w-full min-h-screen bg-neutral-50">
                <div className="max-w-6xl mx-auto px-px md:px-2 lg:px-4 py-8 space-y-10">

                    <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-neutral-600 mb-4">
                        <h2>Kelola Analisis</h2>
                        <div className="flex-1 h-px bg-neutral-300" />
                    </div>

                    <SectionAnalisis />

                </div>
            </div>
        </DashboardLayoutAdmins>
    )
}
// app/admin/interpretasi/page.tsx
'use client'

import DashboardLayoutAdmins from '@/components/Layouts/DashboardLayoutAdmins'
import { SectionInterpretasiAI } from '../../../components/Section/SectionInterpretasiAI'
export default function InterpretasiAIPage() {

    return (
        <DashboardLayoutAdmins>
            <div className="w-full min-h-screen bg-neutral-50">
                <div className="max-w-6xl mx-auto px-px md:px-2 lg:px-4 py-8 space-y-10">

                    <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-neutral-600 mb-4">
                        <h2>Kelola Interpretasi AI</h2>
                        <div className="flex-1 h-px bg-neutral-300" />
                    </div>

                    <SectionInterpretasiAI />

                </div>
            </div>
        </DashboardLayoutAdmins>
    )
}
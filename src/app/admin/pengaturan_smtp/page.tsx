// app/admin/pengaturan_smtp/page.tsx
'use client'

import DashboardLayoutAdmins from '@/components/Layouts/DashboardLayoutAdmins'
import { SectionEmailConfig } from '@/components/Section/SectionEmailConfig'

export default function EmailConfigPage() {
    return (
        <DashboardLayoutAdmins>
            <div className="w-full min-h-screen bg-neutral-50">
                <div className="max-w-6xl mx-auto px-px md:px-2 lg:px-4 py-8 space-y-10">

                    <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-neutral-600 mb-4">
                        <h2>Kelola Konfigurasi Email</h2>
                        <div className="flex-1 h-px bg-neutral-300" />
                    </div>

                    {/* Hook dipakai langsung di dalam komponen */}
                    <SectionEmailConfig />

                </div>
            </div>
        </DashboardLayoutAdmins>
    )
}
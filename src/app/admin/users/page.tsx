'use client'

import DashboardLayoutAdmins from '@/components/Layouts/DashboardLayoutAdmins'
import { SectionPengguna } from '../../../components/Section/SectionPengguna'
import { useState } from 'react'
import { User } from '@/types/Users'
import { ModalDetailUser } from '@/components/Modal/ModalDetailUser'

export default function UserAdminPage() {
    const [selectedUser, setSelectedUser] = useState<User | null>(null)

    return (
        <DashboardLayoutAdmins>
            <div className="w-full min-h-screen bg-neutral-50">
                <div className="max-w-6xl mx-auto px-px md:px-2 lg:px-4 py-8 space-y-10">

                    <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-neutral-600 mb-4">
                        <h2>Kelola Pengguna</h2>
                        <div className="flex-1 h-px bg-neutral-300" />
                    </div>

                    <SectionPengguna onDetail={setSelectedUser} />

                    <ModalDetailUser
                        user={selectedUser}
                        open={!!selectedUser}
                        onClose={() => setSelectedUser(null)}
                    />
                </div>
            </div>
        </DashboardLayoutAdmins>
    )
}
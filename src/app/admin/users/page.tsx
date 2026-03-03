// app/admin/page.tsx

'use client'

import DashboardLayoutAdmins from '@/components/Layouts/DashboardLayoutAdmins'
import { useUsers } from '@/hooks/useUsers'
import { SectionPengguna } from './section/SectionPengguna'
import { useState } from 'react'
import { ModalDetailUser } from '@/components/Modal/DetailModals'
import { User } from '@/types/Users'

export default function DashboardAdminPage() {
    const {
        items: users, total: usersTotal,
        isLoading: usersLoading, isLoadingMore: usersLoadingMore, hasMore: usersHasMore,
        loadMore: usersLoadMore,
        softDelete: userSoftDelete, restore: userRestore, hardDelete: userHardDelete,
    } = useUsers()

    const [selectedUser, setSelectedUser] = useState<User | null>(null)

    return (
        <DashboardLayoutAdmins>
            <div className="w-full min-h-screen bg-neutral-50">
                <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-10">

                    <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-neutral-600 mb-4">
                        <h2>Kelola Pengguna</h2>
                        <div className="flex-1 h-px bg-neutral-300" />
                    </div>

                    <SectionPengguna
                        items={users}
                        isLoading={usersLoading}
                        hasMore={usersHasMore}
                        isLoadingMore={usersLoadingMore}
                        onLoadMore={usersLoadMore}
                        onSoftDelete={userSoftDelete}
                        onRestore={userRestore}
                        onHardDelete={userHardDelete}
                        onDetail={(user) => setSelectedUser(user as unknown as User)}
                    />

                    <ModalDetailUser
                        user={selectedUser as unknown as User}
                        open={!!selectedUser}
                        onClose={() => setSelectedUser(null)}
                    />
                </div>
            </div>
        </DashboardLayoutAdmins>
    )
}
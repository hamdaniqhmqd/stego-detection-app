// components/Ui/Badge.tsx
'use client'

import { StatusAncaman } from "@/types/aiInterpretasi"
import { Channel } from "@/types/shared"
import { UserRole } from "@/types/Users"
import { STATUS_COLOR, STATUS_DOT } from "@/utils/Channel"

interface BadgeProps {
    status: StatusAncaman
    count?: number
}

export function Badge({ status, count }: BadgeProps) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full
                text-xs font-medium border ${STATUS_COLOR[status]}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[status]}`} />
            {count !== undefined ? `${count}× ` : ''}{status}
        </span>
    )
}

interface RoleBadgeProps { role: UserRole }

export function RoleBadge({ role }: RoleBadgeProps) {
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium
            ${role === 'superadmin'
                ? 'bg-violet-50 text-violet-700 border border-violet-200'
                : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
            }`}>
            {role}
        </span>
    )
}

interface VerifBadgeProps {
    deleted: boolean
    verified: boolean
}

export function VerifBadge({ deleted, verified }: VerifBadgeProps) {
    if (deleted)
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200">Dihapus</span>
    if (verified)
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Aktif</span>
    return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200">Belum verifikasi</span>
}

interface ChannelBadgeProps { channel: Channel }

export function ChannelBadge({ channel }: ChannelBadgeProps) {
    const style = {
        R: 'bg-red-50 text-red-600',
        G: 'bg-emerald-50 text-emerald-600',
        B: 'bg-blue-50 text-blue-600',
    }[channel]
    return (
        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${style}`}>
            {channel}
        </span>
    )
}
import supabaseAnonKey from "@/libs/supabase/anon_key"
import { useEffect, useState } from "react"
import { SkeletonBlock } from "./Skeleton"
import { User } from "@/types/Users"

export function UserCard({ userId }: { userId: string }) {
    const [user, setUser] = useState<User | null | undefined>(undefined)

    useEffect(() => {
        supabaseAnonKey
            .from('users')
            .select('id, username, fullname, photo, email, role, is_verified, created_at, updated_at, deleted_at, verified_at')
            .eq('id', userId)
            .single()
            .then(({ data }) => setUser((data as User) ?? null))
    }, [userId])

    if (user === undefined) {
        return (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50
                border border-neutral-100 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-neutral-200 shrink-0" />
                <div className="space-y-1.5 flex-1">
                    <SkeletonBlock className="w-28 h-3" />
                    <SkeletonBlock className="w-20 h-2.5" />
                </div>
            </div>
        )
    }
    if (!user) return (
        <p className="text-xs text-neutral-400 italic px-1">Data pengguna tidak ditemukan</p>
    )

    const displayName = user.fullname ?? user.username
    return (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
            <img
                src={user.photo ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&color=fff&size=64`}
                alt={displayName}
                className="w-10 h-10 rounded-full object-cover shrink-0 border border-neutral-200"
            />
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-neutral-800 truncate">{displayName}</p>
                <p className="text-xs text-neutral-400 truncate">@{user.username}</p>
            </div>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0
                ${user.role === 'superadmin'
                    ? 'bg-violet-50 text-violet-700 border-violet-200'
                    : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                }`}>
                {user.role}
            </span>
        </div>
    )
}
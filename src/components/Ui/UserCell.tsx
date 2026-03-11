// src/components/Ui/UserCell.tsx

import { User } from "@/types/Users"

export default function UserCell({ user }: { user: User | undefined }) {
    if (!user) {
        return (
            <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-neutral-100 shrink-0 animate-pulse" />
                <div className="space-y-1">
                    <div className="w-16 h-2.5 bg-neutral-100 rounded animate-pulse" />
                    <div className="w-10 h-2 bg-neutral-100 rounded animate-pulse" />
                </div>
            </div>
        )
    }
    return (
        <div className="flex items-center gap-2 min-w-0">
            <img
                src={user.photo ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname ?? user.username)}&background=random&color=fff&size=64`}
                alt={user.fullname ?? user.username}
                className="w-7 h-7 rounded-full object-cover shrink-0 border border-neutral-100"
            />
            <div className="min-w-0">
                <p className="text-xs font-medium text-neutral-800 truncate leading-tight max-w-32">
                    {user.fullname ?? user.username}
                </p>
                <p className="text-[10px] text-neutral-400 truncate max-w-32">@{user.username}</p>
            </div>
        </div>
    )
}
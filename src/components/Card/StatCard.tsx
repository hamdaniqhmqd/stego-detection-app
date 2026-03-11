// components/Dashboard/ui/StatCard.tsx
'use client'

export type StatAccent = 'blue' | 'violet' | 'emerald' | 'amber' | 'red'

const ACCENT: Record<StatAccent, { bg: string; icon: string; bar: string; border: string }> = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', bar: 'bg-blue-500', border: 'border-blue-100' },
    violet: { bg: 'bg-violet-50', icon: 'text-violet-600', bar: 'bg-violet-500', border: 'border-violet-100' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', bar: 'bg-emerald-500', border: 'border-emerald-100' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', bar: 'bg-amber-500', border: 'border-amber-100' },
    red: { bg: 'bg-red-50', icon: 'text-red-600', bar: 'bg-red-500', border: 'border-red-100' },
}

interface StatCardProps {
    icon: React.ReactNode
    label: string
    value: number | string
    sub: string
    accent: StatAccent
    fill?: number
}

export function StatCard({ icon, label, value, sub, accent, fill = 60 }: StatCardProps) {
    const c = ACCENT[accent]
    return (
        <div className="bg-neutral-50 rounded-sm border border-neutral-200 hover:border-neutral-500 p-5 shadow-sm
            hover:shadow-[-8px_8px_0_rgba(26,26,46,1)] hover:-translate-y-0.5 transition-all duration-200 ease-in-out">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-sm flex items-center justify-center ${c.bg} ${c.icon}`}>
                    <span className={`text-lg ${c.icon}`}>
                        {icon}
                    </span>
                </div>
                <span className="text-xs text-neutral-400 font-medium tracking-wide uppercase">{label}</span>
            </div>
            <p className="text-3xl font-bold text-neutral-900 tracking-tight">{value}</p>
            <p className="text-sm text-neutral-500 mt-1">{sub}</p>
        </div>
    )
}
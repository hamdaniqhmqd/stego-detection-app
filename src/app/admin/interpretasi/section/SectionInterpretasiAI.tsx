'use client'

// app/admin/analisis/section/SectionInterpretasiAI.tsx

import { useState, useMemo } from 'react'
import { TableShell, SkeletonRows } from '@/components/Ui/TableShell'
import { ActionBtn } from '@/components/Ui/ActionBtn'
import { ConfirmModal } from '@/components/Ui/ConfirmModal'
import { ToggleSwitch } from '@/components/Ui/ToggleSwitch'
import { MiniStat } from '@/components/Card/StatCard'
import { Badge, ChannelBadge } from '@/components/Ui/Badge'
import { AIInterpretationText } from '@/components/Ui/AIInterpretationFormatter'
import type { StatusAncaman } from '@/components/Ui/Badge'
import type { InterpretasiAIWithUser } from '@/hooks/useInterpretasiAI'
import type { TokenUsageSummary } from '@/types/analysis'

interface SectionInterpretasiAIProps {
    items: InterpretasiAIWithUser[]
    isLoading?: boolean
    hasMore?: boolean
    isLoadingMore?: boolean
    onLoadMore?: () => void
    onSoftDelete?: (id: string) => Promise<void>
    onRestore?: (id: string) => Promise<void>
    onHardDelete?: (id: string) => Promise<void>
    onDetail?: (item: InterpretasiAIWithUser) => void
}

const fmt = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
const fmtTime = (d: string) =>
    new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

/** Format angka token: 1500 → "1.5k", 12000 → "12k", 999 → "999" */
function fmtTokens(n: number): string {
    if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`
    return String(n)
}

type ConfirmState = { type: 'soft' | 'hard'; id: string } | null

function summarizeStatus(hasil: InterpretasiAIWithUser['hasil']): Partial<Record<StatusAncaman, number>> {
    return (hasil ?? []).reduce<Partial<Record<StatusAncaman, number>>>((acc, h) => {
        const s = h.status_ancaman as StatusAncaman
        acc[s] = (acc[s] ?? 0) + 1
        return acc
    }, {})
}

// ── Token Usage Cell ───────────────────────────────────────────

function TokenUsageCell({ usage }: { usage?: TokenUsageSummary | null }) {
    if (!usage) {
        return (
            <span className="text-[11px] text-neutral-300 italic">—</span>
        )
    }

    const total = usage.total_tokens
    const label = usage.gemini_token_label

    // Warna berdasarkan jumlah token
    const tokenColor =
        total >= 50_000 ? 'text-red-600 bg-red-50 border-red-200' :
            total >= 20_000 ? 'text-amber-600 bg-amber-50 border-amber-200' :
                'text-neutral-700 bg-neutral-50 border-neutral-200'

    return (
        <div className="flex flex-col gap-1 min-w-0">
            {/* Label token */}
            <div className="flex items-center gap-1 min-w-0">
                {/* Ikon kunci kecil */}
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"
                    fill="currentColor" viewBox="0 0 256 256"
                    className="text-violet-400 shrink-0">
                    <path d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208Z" />
                </svg>
                <span className="text-[10px] text-violet-600 font-medium truncate max-w-28"
                    title={label}>
                    {label}
                </span>
            </div>

            {/* Total token badge */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm border
                text-[11px] font-mono font-semibold w-fit ${tokenColor}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9"
                    fill="currentColor" viewBox="0 0 256 256" className="opacity-60 shrink-0">
                    <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z" />
                </svg>
                <span className="text-nowrap">{fmtTokens(total)} token</span>
            </span>
        </div>
    )
}

// ── Avatar user ────────────────────────────────────────────────

function UserCell({ user }: { user?: InterpretasiAIWithUser['user'] }) {
    if (!user) {
        return <span className="text-xs text-neutral-300 italic">—</span>
    }

    const initials = user.username?.slice(0, 2).toUpperCase() ?? '??'

    return (
        <div className="flex items-center gap-2 min-w-0">
            <div className="shrink-0 w-7 h-7 rounded-full overflow-hidden bg-neutral-200
                border border-neutral-300 flex items-center justify-center">
                {user.photo ? (
                    <img
                        src={user.photo}
                        alt={user.username}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            const target = e.currentTarget
                            target.style.display = 'none'
                            target.nextElementSibling?.removeAttribute('style')
                        }}
                    />
                ) : null}
                <span
                    className="text-[10px] font-semibold text-neutral-500 leading-none"
                    style={user.photo ? { display: 'none' } : {}}
                >
                    {initials}
                </span>
            </div>
            <div className="min-w-0">
                <p className="text-xs font-medium text-neutral-700 truncate leading-tight">
                    {user.username}
                </p>
                <p className="text-[10px] text-neutral-400 truncate leading-tight">
                    {user.email}
                </p>
            </div>
        </div>
    )
}

// ── Komponen utama ─────────────────────────────────────────────

export function SectionInterpretasiAI({
    items,
    isLoading,
    hasMore,
    isLoadingMore,
    onLoadMore,
    onSoftDelete,
    onRestore,
    onHardDelete,
    onDetail,
}: SectionInterpretasiAIProps) {
    const [showDeleted, setShowDeleted] = useState(false)
    const [confirm, setConfirm] = useState<ConfirmState>(null)
    const [pending, setPending] = useState<string | null>(null)

    const filtered = useMemo(
        () => showDeleted ? items : items.filter(i => !i.deleted_at),
        [items, showDeleted]
    )

    const globalCounts = useMemo(() => {
        const all = items.filter(i => !i.deleted_at).flatMap(i => i.hasil ?? [])
        return {
            Aman: all.filter(h => (h.status_ancaman as StatusAncaman) === 'Aman').length,
            Mencurigakan: all.filter(h => (h.status_ancaman as StatusAncaman) === 'Mencurigakan').length,
            Berbahaya: all.filter(h => (h.status_ancaman as StatusAncaman) === 'Berbahaya').length,
        }
    }, [items])

    // Total token usage keseluruhan untuk MiniStat
    const totalTokensAll = useMemo(() =>
        items
            .filter(i => !i.deleted_at)
            .reduce((sum, i) => sum + (i.token_usage?.total_tokens ?? 0), 0),
        [items]
    )

    const handleConfirm = async () => {
        if (!confirm) return
        setPending(confirm.id)
        try {
            if (confirm.type === 'hard') await onHardDelete?.(confirm.id)
            else await onSoftDelete?.(confirm.id)
        } finally { setPending(null); setConfirm(null) }
    }

    const handleRestore = async (id: string) => {
        setPending(id)
        try { await onRestore?.(id) }
        finally { setPending(null) }
    }

    // 8 kolom sekarang: Analysis ID, Pengguna, Status Ancaman, Token Usage, Preview, Durasi, Tanggal, Aksi
    const COL_COUNT = 8

    return (
        <div className="space-y-4">
            {/* Mini stats — sekarang 4 kolom */}
            <div className="grid grid-cols-4 gap-3">
                <MiniStat label="Aman" value={globalCounts.Aman}
                    color="text-emerald-600" bg="bg-emerald-50" border="border-emerald-200" />
                <MiniStat label="Mencurigakan" value={globalCounts.Mencurigakan}
                    color="text-amber-600" bg="bg-amber-50" border="border-amber-200" />
                <MiniStat label="Berbahaya" value={globalCounts.Berbahaya}
                    color="text-red-600" bg="bg-red-50" border="border-red-200" />
                <MiniStat
                    label="Total Token"
                    value={fmtTokens(totalTokensAll)}
                    color="text-violet-600"
                    bg="bg-violet-50"
                    border="border-violet-200"
                />
            </div>

            <TableShell
                title="Interpretasi AI"
                subtitle="Hasil analisis ancaman dari model AI"
                badge={filtered.length}
                actions={
                    <ToggleSwitch checked={showDeleted} onChange={setShowDeleted} label="Tampilkan dihapus" />
                }
                headers={[
                    'Pengguna',
                    'Status Ancaman',
                    'Token Usage',
                    'Preview',
                    'Durasi',
                    'Tanggal',
                    'Aksi',
                ]}
                isEmpty={!isLoading && filtered.length === 0}
                emptyText="Belum ada interpretasi AI."
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
                onLoadMore={onLoadMore}
            >
                {isLoading ? (
                    <SkeletonRows cols={COL_COUNT} />
                ) : filtered.map((item) => (
                    <tr
                        key={item.id}
                        className={`hover:bg-neutral-50/60 transition-colors
                                ${item.deleted_at ? 'opacity-50' : ''}
                                ${pending === item.id ? 'pointer-events-none opacity-40' : ''}`}
                    >
                        {/* Pengguna */}
                        <td className="px-4 py-3 max-w-40">
                            <UserCell user={item.user} />
                        </td>

                        {/* Status badges */}
                        <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                                {Object.entries(summarizeStatus(item.hasil)).map(([status, count]) => (
                                    <Badge
                                        key={status}
                                        status={status as StatusAncaman}
                                        count={count as number}
                                    />
                                ))}
                            </div>
                        </td>

                        {/* Token Usage — KOLOM BARU */}
                        <td className="px-4 py-3">
                            <TokenUsageCell usage={item.token_usage} />
                        </td>

                        {/* Preview */}
                        <td className="px-4 py-3 max-w-xs">
                            {item.hasil?.[0]?.interpretation ? (
                                <div className="line-clamp-2 text-neutral-500
                                        [&_p]:!text-neutral-500 [&_strong]:!text-neutral-600">
                                    <AIInterpretationText
                                        text={item.hasil[0].interpretation}
                                    />
                                </div>
                            ) : (
                                <span className="text-xs text-neutral-300">—</span>
                            )}
                        </td>

                        {/* Durasi */}
                        <td className="px-4 py-3 text-xs font-mono text-neutral-500 whitespace-nowrap">
                            {item.waktu_proses ?? '—'}
                        </td>

                        {/* Tanggal */}
                        <td className="px-4 py-3 text-xs text-neutral-400 whitespace-nowrap">
                            <span className="block">{fmt(item.created_at)}</span>
                            <span className="block text-neutral-300">{fmtTime(item.created_at)}</span>
                        </td>

                        {/* Aksi */}
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-0.5">
                                {onDetail && (
                                    <ActionBtn
                                        icon={<span className="text-xs">↗</span>}
                                        label="Detail"
                                        onClick={() => onDetail(item)}
                                    />
                                )}
                                {item.deleted_at ? (
                                    <ActionBtn icon={<span>↩</span>} label="Pulihkan"
                                        onClick={() => handleRestore(item.id)} />
                                ) : (
                                    <ActionBtn icon={<span>🗑</span>} label="Arsipkan"
                                        onClick={() => setConfirm({ type: 'soft', id: item.id })} />
                                )}
                                <ActionBtn
                                    icon={<span className="text-xs">✕</span>}
                                    label="Hapus permanen"
                                    danger
                                    onClick={() => setConfirm({ type: 'hard', id: item.id })}
                                />
                            </div>
                        </td>
                    </tr>
                ))}
            </TableShell>

            <ConfirmModal
                open={!!confirm}
                title={confirm?.type === 'hard' ? 'Hapus Permanen?' : 'Arsipkan Interpretasi?'}
                message={
                    confirm?.type === 'hard'
                        ? 'Data interpretasi ini akan dihapus secara permanen dan tidak dapat dipulihkan.'
                        : 'Data interpretasi ini akan diarsipkan. Dapat dipulihkan nanti.'
                }
                variant={confirm?.type === 'hard' ? 'danger' : 'warning'}
                onConfirm={handleConfirm}
                onCancel={() => setConfirm(null)}
            />
        </div>
    )
}
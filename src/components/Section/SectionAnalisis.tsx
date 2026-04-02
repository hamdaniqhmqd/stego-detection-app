'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TableShell } from '@/components/Table/TableShell'
import { SkeletonRows } from '@/components/Ui/SkeletonRows'
import { ActionBtn } from '@/components/Ui/ActionBtn'
import { ConfirmModal } from '@/components/Ui/ConfirmModal'
import { ToggleSwitch } from '@/components/Ui/ToggleSwitch'
import { MiniStat } from '@/components/Card/MiniStatCard'
import { useAnalysis } from '@/hooks/useAnalysis'
import type { User } from '@/types/Users'
import { makeTeknikKey } from '@/hooks/useInterpretasiAI'
import supabaseAnonKey from '@/libs/supabase/anon_key'
import UserCell from '../Ui/UserCell'
import { STATUS_DOT } from '@/utils/Channel'
import { TeknikRow } from '../Ui/TeknikRow'
import { StatusAncaman } from '@/types/aiInterpretasi'
import { filename, fmt, fmtTime, ConfirmState } from '@/utils/format'
import { Pagination } from '../Table/Pagination'

// Main component
export function SectionAnalisis() {
    const router = useRouter()
    const [showDeleted, setShowDeleted] = useState(false)
    const [confirm, setConfirm] = useState<ConfirmState>(null)
    const [pending, setPending] = useState<string | null>(null)
    const [userMap, setUserMap] = useState<Map<string, User>>(new Map())

    const active = useAnalysis(undefined, false)
    const deleted = useAnalysis(undefined, true)

    const current = showDeleted ? deleted : active

    useEffect(() => {
        const ids = [...new Set(current.items.map(i => i.user_id).filter(Boolean))]
        if (ids.length === 0) return
        supabaseAnonKey
            .from('users')
            .select('id, username, fullname, photo, email, role, is_verified, created_at')
            .in('id', ids)
            .then(({ data }) => {
                if (!data) return
                setUserMap(prev => {
                    const next = new Map(prev)
                        ; (data as User[]).forEach(u => next.set(u.id, u))
                    return next
                })
            })
    }, [current.items])

    const stats = useMemo(() => ({
        active: active.total,
        ai: active.items.filter(i => i.ai_interpretasi).length,
        deleted: deleted.total,
    }), [active.items, active.total, deleted.total])

    const handleSoftDelete = async (id: string) => {
        await active.softDelete(id)
        await Promise.all([active.refresh(), deleted.refresh()])
    }

    const handleRestore = async (id: string) => {
        setPending(id)
        try {
            await deleted.restore(id)
            await Promise.all([active.refresh(), deleted.refresh()])
        } finally { setPending(null) }
    }

    const handleHardDelete = async (id: string) => {
        await deleted.hardDelete(id)
        await deleted.refresh()
    }

    const handleConfirm = async () => {
        if (!confirm) return
        setPending(confirm.id)
        try {
            if (confirm.type === 'hard') await handleHardDelete(confirm.id)
            else await handleSoftDelete(confirm.id)
        } finally { setPending(null); setConfirm(null) }
    }

    return (
        <div className="space-y-4">

            {/* Mini stats */}
            <div className="grid grid-cols-3 gap-3">
                <MiniStat label="Total Aktif" value={stats.active}
                    color="text-violet-600" bg="bg-violet-50" border="border-violet-200" />
                <MiniStat label="Pakai AI" value={stats.ai}
                    color="text-blue-600" bg="bg-blue-50" border="border-blue-200" />
                <MiniStat label="Dihapus" value={stats.deleted}
                    color="text-red-500" bg="bg-red-50" border="border-red-200" />
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400">
                <span className="font-medium">Status AI per teknik:</span>
                {(['Aman', 'Mencurigakan', 'Berbahaya'] as StatusAncaman[]).map(s => (
                    <span key={s} className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${STATUS_DOT[s]}`} />
                        {s}
                    </span>
                ))}
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-neutral-400" />
                    Belum dianalisis
                </span>
            </div>

            <TableShell
                title="Data Analisis"
                subtitle={showDeleted ? 'Analisis yang diarsipkan' : 'Riwayat proses steganalisis gambar'}
                badge={current.total}
                actions={
                    <ToggleSwitch checked={showDeleted} onChange={setShowDeleted} label="Tampilkan dihapus" />
                }
                headers={['Gambar', 'Pengguna', 'Teknik & Status AI', 'Durasi', 'Tanggal', 'Aksi']}
                isEmpty={!current.isLoading && current.items.length === 0}
                emptyText={showDeleted ? 'Tidak ada analisis yang diarsipkan.' : 'Belum ada data analisis.'}
            >
                {current.isLoading ? (
                    <SkeletonRows cols={7} />
                ) : current.items.map((a) => {
                    const durasi = a.force_decode?.waktu_proses ?? a.waktu_proses
                    const hasRun = !!a.force_decode
                    const user = userMap.get(a.user_id)

                    const teknikStatusMap: Record<string, StatusAncaman> = {}
                    if (a.ai_interpretasi?.hasil) {
                        for (const h of a.ai_interpretasi.hasil) {
                            const key = makeTeknikKey(h.channel, h.arah)
                            const cur = teknikStatusMap[key]
                            const next = h.status_ancaman as StatusAncaman
                            const sev: Record<StatusAncaman, number> = { Aman: 0, Mencurigakan: 1, Berbahaya: 2 }
                            if (!cur || sev[next] > sev[cur]) teknikStatusMap[key] = next
                        }
                    }

                    type TeknikGroup = { channels: string[]; status?: StatusAncaman }
                    const teknikByArah = new Map<string, TeknikGroup>()
                    const sev: Record<StatusAncaman, number> = { Aman: 0, Mencurigakan: 1, Berbahaya: 2 }

                    for (const t of (a.teknik ?? [])) {
                        const key = makeTeknikKey(t.channel, t.arah)
                        const status = teknikStatusMap[key]
                        const existing = teknikByArah.get(t.arah)
                        if (existing) {
                            if (!existing.channels.includes(t.channel)) existing.channels.push(t.channel)
                            if (status && (!existing.status || sev[status] > sev[existing.status])) existing.status = status
                        } else {
                            teknikByArah.set(t.arah, { channels: [t.channel], status })
                        }
                    }

                    return (
                        <tr
                            key={a.id}
                            className={`hover:bg-neutral-50/60 transition-colors
                                ${pending === a.id ? 'pointer-events-none opacity-40' : ''}`}
                        >
                            {/* Preview */}
                            <td className="px-4 py-3">
                                <div className="h-10 w-10 rounded-sm bg-neutral-100 overflow-hidden shrink-0">
                                    {a.file_path
                                        ? <img src={a.file_path} alt="" className="w-full h-full object-cover" />
                                        : <span className="w-full h-full flex items-center justify-center text-neutral-300 text-xs">—</span>
                                    }
                                </div>
                            </td>

                            {/* Pengguna */}
                            <td className="px-4 py-3"><UserCell user={user} /></td>

                            {/* Teknik + status AI */}
                            <td className="px-4 py-3">
                                <div className="flex flex-col gap-1.5">
                                    {teknikByArah.size > 0
                                        ? [...teknikByArah.entries()].map(([arah, { channels, status }]) => (
                                            <TeknikRow key={arah} arah={arah} channels={channels} status={status} />
                                        ))
                                        : <span className="text-neutral-300 text-xs">—</span>
                                    }
                                </div>
                            </td>

                            {/* Durasi */}
                            <td className="px-4 py-3">
                                {hasRun ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-neutral-600
                                        bg-neutral-50 text-neutral-900 text-xs font-mono font-semibold tracking-tight whitespace-nowrap">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" fill="currentColor" viewBox="0 0 256 256" className="opacity-70">
                                            <path d="M128,40a96,96,0,1,0,96,96A96.11,96.11,0,0,0,128,40Zm0,176a80,80,0,1,1,80-80A80.09,80.09,0,0,1,128,216ZM173.66,90.34a8,8,0,0,1,0,11.32l-40,40a8,8,0,0,1-11.32-11.32l40-40A8,8,0,0,1,173.66,90.34ZM96,16a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H104A8,8,0,0,1,96,16Z" />
                                        </svg>
                                        {durasi}
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm
                                        bg-neutral-100 text-neutral-400 text-xs font-medium border border-dashed border-neutral-200 whitespace-nowrap">
                                        Belum dijalankan
                                    </span>
                                )}
                            </td>

                            {/* Tanggal */}
                            <td className="px-4 py-3 text-xs text-neutral-700 whitespace-nowrap">
                                <span className="block">{fmt(a.created_at)}</span>
                                <span className="block text-neutral-500">{fmtTime(a.created_at)}</span>
                            </td>

                            {/* Aksi */}
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-0.5">
                                    <ActionBtn
                                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M128,56C48,56,16,128,16,128s32,72,112,72,112-72,112-72S208,56,128,56Zm0,112a40,40,0,1,1,40-40A40,40,0,0,1,128,168Z" opacity="0.2"></path><path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"></path></svg>}
                                        label="Detail"
                                        onClick={() => router.push(`/admin/analisis/${a.id}`)}
                                    />
                                    {a.deleted_at ? (
                                        <ActionBtn
                                            icon={<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M216,208H40a16,16,0,0,1-13.84-24l88-152a16,16,0,0,1,27.7,0l88,152A16,16,0,0,1,216,208Z" opacity="0.2"></path><path d="M96,208a8,8,0,0,1-8,8H40a24,24,0,0,1-20.77-36l34.29-59.25L39.47,124.5A8,8,0,1,1,35.33,109l32.77-8.77a8,8,0,0,1,9.8,5.66l8.79,32.77A8,8,0,0,1,81,148.5a8.37,8.37,0,0,1-2.08.27,8,8,0,0,1-7.72-5.93l-3.8-14.15L33.11,188A8,8,0,0,0,40,200H88A8,8,0,0,1,96,208Zm140.73-28-23.14-40a8,8,0,0,0-13.84,8l23.14,40A8,8,0,0,1,216,200H147.31l10.34-10.34a8,8,0,0,0-11.31-11.32l-24,24a8,8,0,0,0,0,11.32l24,24a8,8,0,0,0,11.31-11.32L147.31,216H216a24,24,0,0,0,20.77-36ZM128,32a7.85,7.85,0,0,1,6.92,4l34.29,59.25-14.08-3.78A8,8,0,0,0,151,106.92l32.78,8.79a8.23,8.23,0,0,0,2.07.27,8,8,0,0,0,7.72-5.93l8.79-32.79a8,8,0,1,0-15.45-4.14l-3.8,14.17L148.77,28a24,24,0,0,0-41.54,0L84.07,68a8,8,0,0,0,13.85,8l23.16-40A7.85,7.85,0,0,1,128,32Z"></path></svg>}
                                            label="Pulihkan"
                                            onClick={() => handleRestore(a.id)}
                                        />
                                    ) : (
                                        <ActionBtn
                                            icon={<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M216,128a88,88,0,1,1-88-88A88,88,0,0,1,216,128Z" opacity="0.2"></path><path d="M120,128V48a8,8,0,0,1,16,0v80a8,8,0,0,1-16,0Zm60.37-78.7a8,8,0,0,0-8.74,13.4C194.74,77.77,208,101.57,208,128a80,80,0,0,1-160,0c0-26.43,13.26-50.23,36.37-65.3a8,8,0,0,0-8.74-13.4C47.9,67.38,32,96.06,32,128a96,96,0,0,0,192,0C224,96.06,208.1,67.38,180.37,49.3Z"></path></svg>}
                                            label="Arsipkan"
                                            onClick={() => setConfirm({ type: 'soft', id: a.id, label: filename(a.file_path) })}
                                        />
                                    )}
                                    <ActionBtn
                                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M200,56V208a8,8,0,0,1-8,8H64a8,8,0,0,1-8-8V56Z" opacity="0.2"></path><path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path></svg>}
                                        label="Hapus permanen"
                                        danger
                                        onClick={() => setConfirm({ type: 'hard', id: a.id, label: filename(a.file_path) })}
                                    />
                                </div>
                            </td>
                        </tr>
                    )
                })}
            </TableShell>

            {/* Pagination */}
            <Pagination
                currentPage={current.currentPage}
                totalPages={current.totalPages}
                isLoading={current.isLoading}
                onGoToPage={current.goToPage}
            />

            <ConfirmModal
                open={!!confirm}
                title={confirm?.type === 'hard' ? 'Hapus Permanen?' : 'Arsipkan Analisis?'}
                message={
                    confirm?.type === 'hard'
                        ? `File "${confirm?.label}" akan dihapus permanen dan tidak dapat dipulihkan.`
                        : `Analisis "${confirm?.label}" akan diarsipkan. Dapat dipulihkan nanti.`
                }
                variant={confirm?.type === 'hard' ? 'danger' : 'warning'}
                onConfirm={handleConfirm}
                onCancel={() => setConfirm(null)}
            />
        </div>
    )
}
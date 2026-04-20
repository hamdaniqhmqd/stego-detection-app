// components/Dashboard/sections/SectionEmailConfig.tsx
'use client'

import { useState, useMemo } from 'react'
import { TableShell } from '@/components/Table/TableShell'
import { SkeletonRows } from '@/components/Ui/SkeletonRows'
import { ActionBtn } from '@/components/Ui/ActionBtn'
import { ConfirmModal } from '@/components/Ui/ConfirmModal'
import { ToggleSwitch } from '@/components/Ui/ToggleSwitch'
import { MiniStat } from '@/components/Card/MiniStatCard'
import { Pagination } from '../Table/Pagination'
import { useEmailConfig } from '@/hooks/useEmailConfig'
import type { EmailConfig, CreateEmailConfigPayload, UpdateEmailConfigPayload } from '@/types/EmailConfig'
import { IconPlus, IconDelete, IconEdit, IconEye, IconEyeOff } from '@/utils/Icons'
import { ConfigFormModal } from '../Modal/ConfigFormModal'
import { ConfirmState, fmt, fmtTime, maskPassword } from '@/utils/format'


export function SectionEmailConfig() {
    const [showDeleted, setShowDeleted] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [editTarget, setEditTarget] = useState<EmailConfig | null>(null)
    const [confirm, setConfirm] = useState<ConfirmState>(null)
    const [pending, setPending] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Dua instance hook
    const active = useEmailConfig({ includeDeleted: false })
    const deleted = useEmailConfig({ includeDeleted: true })

    const current = showDeleted ? deleted : active

    // Stats dari active (tidak berubah saat toggle)
    const stats = useMemo(() => ({
        totalActive: active.items.filter(c => c.is_active).length,
        total: active.total,
        deleted: deleted.total,
        activeConfig: active.items.find(c => c.is_active),
    }), [active.items, active.total, deleted.total])

    // Handlers
    const handleFormSubmit = async (
        payload: CreateEmailConfigPayload | UpdateEmailConfigPayload
    ) => {
        setIsSubmitting(true)
        try {
            if (editTarget) {
                await active.updateConfig(editTarget.id, payload as UpdateEmailConfigPayload)
            } else {
                await active.createConfig(payload as CreateEmailConfigPayload)
            }
            setShowModal(false)
            setEditTarget(null)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleConfirm = async () => {
        if (!confirm) return
        setPending(confirm.id)
        try {
            if (confirm.type === 'hard') {
                await deleted.hardDelete(confirm.id)
                await deleted.refresh()
            } else {
                await active.softDelete(confirm.id)
                await Promise.all([active.refresh(), deleted.refresh()])
            }
        } finally { setPending(null); setConfirm(null) }
    }

    const handleRestore = async (id: string) => {
        setPending(id)
        try {
            await deleted.restore(id)
            await Promise.all([active.refresh(), deleted.refresh()])
        } finally { setPending(null) }
    }

    // Toggle Active (Hanya 1 config aktif)
    const handleSetActive = async (id: string) => {
        setPending(id)
        try {
            // Jika sudah aktif, tidak perlu diubah
            if (stats.activeConfig?.id === id) {
                setPending(null)
                return
            }

            // Set config ini sebagai aktif (otomatis nonaktifkan yang lain)
            await active.toggleActive(id, false)
            await active.refresh()
        } finally {
            setPending(null)
        }
    }

    return (
        <div className="space-y-4">
            {/* Error banner */}
            {current.error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-700 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M236.8,188.09,149.35,36.22a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM120,104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm8,88a12,12,0,1,1,12-12A12,12,0,0,1,128,192Z" />
                    </svg>
                    {current.error}
                </div>
            )}

            {/* Mini stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <MiniStat
                    label="Config Aktif"
                    value={stats.totalActive}
                    color="text-emerald-600"
                    bg="bg-emerald-50"
                    border="border-emerald-200"
                />
                <MiniStat
                    label="Total Config"
                    value={stats.total}
                    color="text-sky-600"
                    bg="bg-sky-50"
                    border="border-sky-200"
                />
                <MiniStat
                    label="Diarsipkan"
                    value={stats.deleted}
                    color="text-red-500"
                    bg="bg-red-50"
                    border="border-red-200"
                />
            </div>

            {/* Active config info banner */}
            {stats.activeConfig && (
                <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-sm">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="white" viewBox="0 0 256 256">
                            <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-64-64a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z" />
                        </svg>
                    </div>
                    <div className="text-xs text-emerald-900 min-w-0 flex-1">
                        <p className="font-semibold mb-0.5">Config Email Aktif</p>
                        <div className="flex items-center gap-2 flex-wrap text-emerald-800">
                            <span className="font-mono bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                                {stats.activeConfig.mail_from_name}
                            </span>
                            <span className="text-emerald-700">→</span>
                            <span className="font-mono text-[11px]">{stats.activeConfig.mail_from_address}</span>
                        </div>
                        <div className="mt-1 text-[11px] text-emerald-700 font-mono">
                            {stats.activeConfig.mail_host}:{stats.activeConfig.mail_port}
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <TableShell
                title="Kelola Email Config"
                subtitle={showDeleted ? 'Konfigurasi SMTP yang diarsipkan' : 'Konfigurasi SMTP untuk pengiriman email sistem'}
                badge={current.total}
                actions={
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                        <ToggleSwitch
                            checked={showDeleted}
                            onChange={setShowDeleted}
                            label="Tampilkan diarsipkan"
                        />
                        {!showDeleted && (
                            <button
                                onClick={() => { setEditTarget(null); setShowModal(true) }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold
                                    text-neutral-50 bg-neutral-600 hover:bg-neutral-700 rounded-sm
                                    transition-all ease-in-out duration-200
                                    hover:shadow-[-4px_5px_0_rgba(26,26,46,1)] hover:-translate-y-0.5"
                            >
                                <IconPlus />
                                Tambah Config
                            </button>
                        )}
                    </div>
                }
                headers={['Pengirim', 'SMTP Host', 'Username', 'Password', 'Enkripsi', 'Status', 'Diperbarui', 'Aksi']}
                isEmpty={!current.isLoading && current.items.length === 0}
                emptyText={
                    showDeleted
                        ? 'Tidak ada konfigurasi yang diarsipkan.'
                        : 'Belum ada konfigurasi email. Tambahkan config SMTP untuk memulai.'
                }
            >
                {current.isLoading ? (
                    <SkeletonRows cols={8} rows={3} />
                ) : current.items.map((cfg) => {
                    const isActive = cfg.id === stats.activeConfig?.id

                    return (
                        <tr
                            key={cfg.id}
                            className={`hover:bg-neutral-50 transition-colors border-b border-neutral-200
                                ${pending === cfg.id ? 'pointer-events-none opacity-40' : ''}
                                ${isActive ? 'bg-emerald-50/40' : ''}`}
                        >
                            {/* Pengirim */}
                            <td className="px-4 py-3">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-xs font-semibold text-neutral-800 truncate max-w-36">
                                            {cfg.mail_from_name}
                                        </span>
                                        {isActive && (
                                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px]
                                                font-bold rounded ring-1 ring-emerald-200 whitespace-nowrap leading-none
                                                flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                AKTIF
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-neutral-600 mt-0.5 font-mono truncate max-w-40">
                                        {cfg.mail_from_address}
                                    </p>
                                </div>
                            </td>

                            {/* SMTP Host */}
                            <td className="px-4 py-3">
                                <span className="font-mono text-[12px] text-neutral-800">
                                    {cfg.mail_host}
                                </span>
                                <span className="text-[11px] text-neutral-500 block">
                                    :{cfg.mail_port} — {cfg.mail_mailer.toUpperCase()}
                                </span>
                            </td>

                            {/* Username */}
                            <td className="px-4 py-3">
                                <span className="font-mono text-[12px] text-neutral-600 max-w-36 truncate block">
                                    {cfg.mail_username}
                                </span>
                            </td>

                            {/* Password */}
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-[12px] text-neutral-800 tracking-tight">
                                        {maskPassword(cfg.mail_password)}
                                    </span>
                                </div>
                            </td>

                            {/* Enkripsi */}
                            <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-bold
                                    border uppercase tracking-wide
                                    ${cfg.mail_encryption === 'tls'
                                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                                        : cfg.mail_encryption === 'ssl'
                                            ? 'bg-violet-50 text-violet-700 border-violet-200'
                                            : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                                    }`}>
                                    {cfg.mail_encryption}
                                </span>
                            </td>

                            {/* Status — Radio button style */}
                            <td className="px-4 py-3">
                                <button
                                    onClick={() => handleSetActive(cfg.id)}
                                    disabled={!!cfg.deleted_at || pending === cfg.id}
                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-sm text-[11px] font-semibold
                                        transition-all duration-200 w-fit
                                        ${isActive
                                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-300 shadow-sm'
                                            : 'bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 hover:border-neutral-300'
                                        }
                                        disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
                                        ${isActive
                                            ? 'bg-emerald-500 border-emerald-500'
                                            : 'border-neutral-400 hover:border-neutral-600'
                                        }`}>
                                        {isActive && (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" fill="white" viewBox="0 0 256 256">
                                                <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-64-64a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z" />
                                            </svg>
                                        )}
                                    </span>
                                    {isActive ? 'Aktif' : 'Nonaktif'}
                                </button>
                            </td>

                            {/* Diperbarui */}
                            <td className="px-4 py-3 text-xs text-neutral-700 whitespace-nowrap">
                                <span className="block">{fmt(cfg.updated_at)}</span>
                                <span className="block text-neutral-500">{fmtTime(cfg.updated_at)}</span>
                            </td>

                            {/* Aksi */}
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-0.5">
                                    {/* Edit — hanya non-deleted */}
                                    {!cfg.deleted_at && (
                                        <ActionBtn
                                            icon={<IconEdit />}
                                            label="Edit"
                                            onClick={() => { setEditTarget(cfg); setShowModal(true) }}
                                        />
                                    )}

                                    {/* Arsipkan / Pulihkan */}
                                    {cfg.deleted_at ? (
                                        <ActionBtn
                                            icon={<span>↩</span>}
                                            label="Pulihkan"
                                            onClick={() => handleRestore(cfg.id)}
                                        />
                                    ) : (
                                        <ActionBtn
                                            icon={<IconDelete />}
                                            label="Arsipkan"
                                            onClick={() =>
                                                setConfirm({ type: 'soft', id: cfg.id, label: cfg.mail_from_name })
                                            }
                                        />
                                    )}

                                    {/* Hapus permanen */}
                                    <ActionBtn
                                        icon={<span className="text-xs">✕</span>}
                                        label="Hapus permanen"
                                        danger
                                        onClick={() =>
                                            setConfirm({ type: 'hard', id: cfg.id, label: cfg.mail_from_name })
                                        }
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

            {/* Form Modal */}
            {showModal && (
                <ConfigFormModal
                    initial={editTarget}
                    onSubmit={handleFormSubmit}
                    onClose={() => { setShowModal(false); setEditTarget(null) }}
                    isSubmitting={isSubmitting}
                />
            )}

            {/* Confirm Modal */}
            <ConfirmModal
                open={!!confirm}
                title={confirm?.type === 'hard' ? 'Hapus Permanen?' : 'Arsipkan Config?'}
                message={
                    confirm?.type === 'hard'
                        ? `Config "${confirm?.label}" akan dihapus permanen dan tidak dapat dipulihkan.`
                        : `Config "${confirm?.label}" akan diarsipkan. Config tidak akan aktif sampai dipulihkan.`
                }
                variant={confirm?.type === 'hard' ? 'danger' : 'warning'}
                onConfirm={handleConfirm}
                onCancel={() => setConfirm(null)}
            />
        </div>
    )
}
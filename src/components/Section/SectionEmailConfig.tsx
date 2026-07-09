// components/Dashboard/sections/SectionEmailConfig.tsx
'use client'

import { useState, useMemo } from 'react'
import { TableShell } from '@/components/Table/TableShell'
import { SkeletonRows } from '@/components/Skeleton/SkeletonRows'
import { ActionBtn } from '@/components/Ui/ActionBtn'
import { ConfirmModal } from '@/components/Ui/ConfirmModal'
import { ToggleSwitch } from '@/components/Ui/ToggleSwitch'
import { MiniStat } from '@/components/Card/MiniStatCard'
import { Pagination } from '../Table/Pagination'
import { useEmailConfig } from '@/hooks/useEmailConfig'
import type { EmailConfig, CreateEmailConfigPayload, UpdateEmailConfigPayload } from '@/types/EmailConfig'
import { IconPlus, IconDelete, IconEdit, IconEye, IconEyeOff, IconArsip, IconRestore } from '@/utils/Icons'
import { ConfigFormModal } from '../Modal/ConfigFormModal'
import { ConfirmState, fmt, fmtTime, formatDateMonthYears, formatTime, maskPassword } from '@/utils/format'


export function SectionEmailConfig() {
    const [showDeleted, setShowDeleted] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [editTarget, setEditTarget] = useState<EmailConfig | null>(null)
    const [confirm, setConfirm] = useState<ConfirmState>(null)
    const [pending, setPending] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Dua instance hook untuk data aktif dan data termasuk yang dihapus, agar tidak perlu refetch saat toggle
    const active = useEmailConfig({ includeDeleted: false })
    const deleted = useEmailConfig({ includeDeleted: true })

    const current = showDeleted ? deleted : active

    // Stats dari active (tidak berubah saat toggle)
    const stats = useMemo(() => ({
        totalActive: active.items.filter(c => c.is_active).length,
        total: active.total + deleted.total,
        deleted: deleted.total,
        activeConfig: active.items.find(c => c.is_active),
    }), [active.items, active.total, deleted.total])

    // Handler form submit untuk create/update
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

    // Handler konfirmasi untuk soft delete / hard delete
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

    // Restore token yang dihapus
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
                headers={['Pengirim', 'SMTP Host', 'Username', 'Status', 'Diperbarui', 'Aksi']}
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
                                <span className="block">{formatDateMonthYears(cfg.updated_at)}</span>
                                <span className="block text-neutral-500">{formatTime(cfg.updated_at)}</span>
                            </td>

                            {/* Aksi */}
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-0.5">
                                    {/* Edit — hanya non-deleted */}
                                    <ActionBtn
                                        icon={<IconEdit />}
                                        label="Edit"
                                        onClick={() => { setEditTarget(cfg); setShowModal(true) }}
                                    />

                                    {/* Set aktif — hanya non-deleted & belum aktif */}
                                    {!cfg.deleted_at && !isActive && (
                                        <ActionBtn
                                            icon={
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
                                                    <path d="M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.38,16.38,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Zm-15.34,5.47-48.7,42a8,8,0,0,0-2.56,7.91l14.88,62.8a.37.37,0,0,1-.17.48c-.18.14-.23.11-.38,0l-54.72-33.65a8,8,0,0,0-8.38,0L69.09,215.94c-.15.09-.19.12-.38,0a.37.37,0,0,1-.17-.48l14.88-62.8a8,8,0,0,0-2.56-7.91l-48.7-42c-.12-.1-.23-.19-.13-.5s.18-.27.33-.29l63.92-5.16A8,8,0,0,0,103,91.86l24.62-59.61c.08-.17.11-.25.35-.25s.27.08.35.25L153,91.86a8,8,0,0,0,6.75,4.92l63.92,5.16c.15,0,.24,0,.33.29S224,102.63,223.84,102.73Z"></path>
                                                </svg>
                                            }
                                            label="Jadikan aktif"
                                            onClick={() => handleSetActive(cfg.id)}
                                        />
                                    )}

                                    {/* Sudah aktif — icon bintang solid kuning */}
                                    {!cfg.deleted_at && isActive && (
                                        <span className="w-7 h-7 rounded-sm flex items-center justify-center text-xs hover:bg-amber-200 hover:text-amber-700 transition-all duration-150 text-amber-400" title="Config aktif">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
                                                <path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34l13.49-58.54-45.11-39.42a16,16,0,0,1,9.12-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L187,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z" />
                                            </svg>
                                        </span>
                                    )}

                                    {/* Arsipkan / Pulihkan */}
                                    {cfg.deleted_at ? (
                                        <ActionBtn
                                            icon={
                                                <IconRestore />
                                            }
                                            label="Pulihkan"
                                            onClick={() => handleRestore(cfg.id)}
                                        />
                                    ) : (
                                        <ActionBtn
                                            icon={<IconArsip />}
                                            label="Arsipkan"
                                            onClick={() => setConfirm({ type: 'soft', id: cfg.id, label: cfg.mail_from_name })}
                                        />
                                    )}

                                    {/* Hapus permanen */}
                                    <ActionBtn
                                        icon={
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
                                                <path d="M200,56V208a8,8,0,0,1-8,8H64a8,8,0,0,1-8-8V56Z" opacity="0.2" />
                                                <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z" />
                                            </svg>
                                        }
                                        label="Hapus permanen"
                                        danger
                                        onClick={() => setConfirm({ type: 'hard', id: cfg.id, label: cfg.mail_from_name })}
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
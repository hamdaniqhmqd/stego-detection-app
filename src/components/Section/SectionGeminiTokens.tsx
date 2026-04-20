// components/Dashboard/sections/SectionGeminiTokens.tsx
'use client'

import { useState, useMemo } from 'react'
import { TableShell } from '@/components/Table/TableShell'
import { SkeletonRows } from '../Ui/SkeletonRows'
import { ActionBtn } from '@/components/Ui/ActionBtn'
import { ConfirmModal } from '@/components/Ui/ConfirmModal'
import { ToggleSwitch } from '@/components/Ui/ToggleSwitch'
import { MiniStat } from '@/components/Card/MiniStatCard'
import { Pagination } from '../Table/Pagination'
import type { GeminiToken, CreateGeminiTokenPayload, UpdateGeminiTokenPayload } from '@/types/GeminiToken'
import { useGeminiTokens } from '@/hooks/useGeminiTokens'
import { ConfirmState, fmt, fmtTime, maskKey } from '@/utils/format'
import { TokenFormModal } from '../Modal/TokenFormModal'

export function SectionGeminiTokens() {
    const [showDeleted, setShowDeleted] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [editTarget, setEditTarget] = useState<GeminiToken | null>(null)
    const [confirm, setConfirm] = useState<ConfirmState>(null)
    const [pending, setPending] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Dua instance hook, mirip SectionInterpretasiAI
    const active = useGeminiTokens({ includeDeleted: false })
    const deleted = useGeminiTokens({ includeDeleted: true })

    const current = showDeleted ? deleted : active

    // Mini stats dari data aktif (tidak terpengaruh toggle)
    const stats = useMemo(() => ({
        active: active.items.filter(t => t.is_active).length,
        total: active.total,
        deleted: deleted.total,
        defaultToken: active.items.find(t => t.is_default),
    }), [active.items, active.total, deleted.total])

    // Handlers
    const handleFormSubmit = async (payload: CreateGeminiTokenPayload | UpdateGeminiTokenPayload) => {
        setIsSubmitting(true)
        try {
            if (editTarget) {
                await active.updateToken(editTarget.id, payload as UpdateGeminiTokenPayload)
            } else {
                await active.createToken(payload as CreateGeminiTokenPayload)
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

    const handleSetDefault = async (id: string) => {
        setPending(id)
        try { await active.setDefault(id) }
        finally { setPending(null) }
    }

    const handleToggleActive = async (id: string, current: boolean) => {
        setPending(id)
        try { await active.toggleActive(id, current) }
        finally { setPending(null) }
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
                <MiniStat label="Token Aktif" value={stats.active}
                    color="text-emerald-600" bg="bg-emerald-50" border="border-emerald-200" />
                <MiniStat label="Total Token" value={stats.total}
                    color="text-neutral-600" bg="bg-neutral-50" border="border-neutral-200" />
                <MiniStat label="Diarsipkan" value={stats.deleted}
                    color="text-red-500" bg="bg-red-50" border="border-red-200" />
            </div>

            {/* Default token info */}
            {stats.defaultToken && (
                <div className="flex items-center gap-3 px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-sm">
                    <span className="w-2 h-2 rounded-full bg-neutral-500 shrink-0" />
                    <div className="text-xs text-neutral-700 min-w-0">
                        <span className="font-semibold">Token Default Aktif:</span>
                        {' '}<span className="font-mono">{stats.defaultToken.label}</span>
                        {' '}—{' '}
                        <span className="text-neutral-500 font-mono">{maskKey(stats.defaultToken.api_key)}</span>
                    </div>
                </div>
            )}

            {/* Table */}
            <TableShell
                title="Kelola Token Gemini API"
                subtitle={showDeleted ? 'Token yang diarsipkan' : 'Manajemen API key untuk integrasi AI'}
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
                                    text-white bg-neutral-700 rounded-sm
                                    transition-all duration-200 ease-in-out
                                    hover:shadow-[-4px_5px_0_rgba(26,26,46,1)] hover:-translate-y-0.5"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" viewBox="0 0 256 256">
                                    <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z" />
                                </svg>
                                Tambah Token
                            </button>
                        )}
                    </div>
                }
                headers={['Label & Deskripsi', 'API Key', 'Kuota', 'Pemakaian', 'Status', 'Dibuat', 'Aksi']}
                isEmpty={!current.isLoading && current.items.length === 0}
                emptyText={showDeleted ? 'Tidak ada token yang diarsipkan.' : 'Belum ada token Gemini API. Tambahkan token untuk memulai.'}
            >
                {current.isLoading ? (
                    <SkeletonRows cols={7} rows={3} />
                ) : current.items.map((token) => {
                    const quotaUsed = token.quota_limit
                        ? Math.min(100, Math.round((token.usage_count / token.quota_limit) * 100))
                        : null

                    return (
                        <tr
                            key={token.id}
                            className={`hover:bg-neutral-50 transition-colors border-b border-neutral-200
                                ${pending === token.id ? 'pointer-events-none opacity-40' : ''}`}
                        >
                            {/* Label & Deskripsi */}
                            <td className="px-4 py-3">
                                <div className="flex items-start gap-2 min-w-0">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="text-xs font-semibold text-neutral-800 truncate max-w-36">
                                                {token.label}
                                            </span>
                                            {token.is_default && (
                                                <span className="px-1.5 py-0.5 bg-neutral-200 text-neutral-700 text-[10px]
                                                    font-bold rounded ring-1 ring-neutral-200 whitespace-nowrap leading-none">
                                                    DEFAULT
                                                </span>
                                            )}
                                        </div>
                                        {token.description && (
                                            <p className="text-[11px] text-neutral-500 mt-0.5 max-w-40 truncate">
                                                {token.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </td>

                            {/* API Key */}
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-xs text-neutral-700 tracking-tight">
                                        {maskKey(token.api_key)}
                                    </span>
                                </div>
                            </td>

                            {/* Kuota */}
                            <td className="px-4 py-3">
                                {token.quota_limit ? (
                                    <div className="min-w-0 w-24">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] text-neutral-700 font-mono">
                                                {token.usage_count}/{token.quota_limit}
                                            </span>
                                            <span className={`text-[10px] font-semibold
                                                ${quotaUsed! >= 90 ? 'text-red-500' : quotaUsed! >= 70 ? 'text-amber-500' : 'text-emerald-600'}`}>
                                                {quotaUsed}%
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all
                                                    ${quotaUsed! >= 90 ? 'bg-red-400' : quotaUsed! >= 70 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                                                style={{ width: `${quotaUsed}%` }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-xs text-neutral-700 font-mono">
                                        {token.usage_count} req
                                    </span>
                                )}
                            </td>

                            {/* Last used */}
                            <td className="px-4 py-3 text-xs text-neutral-700 whitespace-nowrap">
                                {token.last_used_at ? (
                                    <>
                                        <span className="block">{fmt(token.last_used_at)}</span>
                                        <span className="block text-neutral-500">{fmtTime(token.last_used_at)}</span>
                                    </>
                                ) : (
                                    <span className="text-neutral-400 text-[11px]">Belum dipakai</span>
                                )}
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3">
                                <div className="flex flex-col gap-1">
                                    <button
                                        onClick={() => handleToggleActive(token.id, token.is_active)}
                                        disabled={!!token.deleted_at}
                                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[10px] font-semibold
                                            transition-colors w-fit border
                                            ${token.is_active
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                                : 'bg-neutral-100 text-neutral-500 border-neutral-200 hover:bg-neutral-200'
                                            } disabled:pointer-events-none`}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full shrink-0
                                            ${token.is_active ? 'bg-emerald-500' : 'bg-neutral-400'}`}
                                        />
                                        {token.is_active ? 'Aktif' : 'Nonaktif'}
                                    </button>
                                    {token.error_count > 0 && (
                                        <span className="text-[10px] text-red-500 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                                            {token.error_count} error
                                        </span>
                                    )}
                                </div>
                            </td>

                            {/* Dibuat */}
                            <td className="px-4 py-3 text-xs text-neutral-700 whitespace-nowrap">
                                <span className="block">{fmt(token.created_at)}</span>
                                <span className="block text-neutral-500">{fmtTime(token.created_at)}</span>
                            </td>

                            {/* Aksi */}
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-0.5">
                                    {/* Edit — hanya untuk non-deleted */}
                                    {!token.deleted_at && (
                                        <ActionBtn
                                            icon={
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
                                                    <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z" />
                                                </svg>
                                            }
                                            label="Edit"
                                            onClick={() => { setEditTarget(token); setShowModal(true) }}
                                        />
                                    )}

                                    {/* Set Default */}
                                    {!token.deleted_at && !token.is_default && (
                                        <ActionBtn
                                            icon={
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
                                                    <path d="M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.38,16.38,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Zm-15.34,5.47-48.7,42a8,8,0,0,0-2.56,7.91l14.88,62.8a.37.37,0,0,1-.17.48c-.18.14-.23.11-.38,0l-54.72-33.65a8,8,0,0,0-8.38,0L69.09,215.94c-.15.09-.19.12-.38,0a.37.37,0,0,1-.17-.48l14.88-62.8a8,8,0,0,0-2.56-7.91l-48.7-42c-.12-.1-.23-.19-.13-.5s.18-.27.33-.29l63.92-5.16A8,8,0,0,0,103,91.86l24.62-59.61c.08-.17.11-.25.35-.25s.27.08.35.25L153,91.86a8,8,0,0,0,6.75,4.92l63.92,5.16c.15,0,.24,0,.33.29S224,102.63,223.84,102.73Z"></path>
                                                </svg>
                                            }
                                            label="Set Default"
                                            onClick={() => handleSetDefault(token.id)}
                                        />
                                    )}
                                    {!token.deleted_at && token.is_default && (
                                        <div className="text-amber-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
                                                <path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34l13.49-58.54-45.11-39.42a16,16,0,0,1,9.12-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L187,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z" />
                                            </svg>
                                        </div>
                                    )}

                                    {/* Arsipkan / Pulihkan */}
                                    {token.deleted_at ? (
                                        <ActionBtn
                                            icon={<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M216,208H40a16,16,0,0,1-13.84-24l88-152a16,16,0,0,1,27.7,0l88,152A16,16,0,0,1,216,208Z" opacity="0.2"></path><path d="M96,208a8,8,0,0,1-8,8H40a24,24,0,0,1-20.77-36l34.29-59.25L39.47,124.5A8,8,0,1,1,35.33,109l32.77-8.77a8,8,0,0,1,9.8,5.66l8.79,32.77A8,8,0,0,1,81,148.5a8.37,8.37,0,0,1-2.08.27,8,8,0,0,1-7.72-5.93l-3.8-14.15L33.11,188A8,8,0,0,0,40,200H88A8,8,0,0,1,96,208Zm140.73-28-23.14-40a8,8,0,0,0-13.84,8l23.14,40A8,8,0,0,1,216,200H147.31l10.34-10.34a8,8,0,0,0-11.31-11.32l-24,24a8,8,0,0,0,0,11.32l24,24a8,8,0,0,0,11.31-11.32L147.31,216H216a24,24,0,0,0,20.77-36ZM128,32a7.85,7.85,0,0,1,6.92,4l34.29,59.25-14.08-3.78A8,8,0,0,0,151,106.92l32.78,8.79a8.23,8.23,0,0,0,2.07.27,8,8,0,0,0,7.72-5.93l8.79-32.79a8,8,0,1,0-15.45-4.14l-3.8,14.17L148.77,28a24,24,0,0,0-41.54,0L84.07,68a8,8,0,0,0,13.85,8l23.16-40A7.85,7.85,0,0,1,128,32Z"></path></svg>}
                                            label="Pulihkan"
                                            onClick={() => handleRestore(token.id)}
                                        />
                                    ) : (
                                        <ActionBtn
                                            icon={
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
                                                    <path d="M216,128a88,88,0,1,1-88-88A88,88,0,0,1,216,128Z" opacity="0.2" /><path d="M120,128V48a8,8,0,0,1,16,0v80a8,8,0,0,1-16,0Zm60.37-78.7a8,8,0,0,0-8.74,13.4C194.74,77.77,208,101.57,208,128a80,80,0,0,1-160,0c0-26.43,13.26-50.23,36.37-65.3a8,8,0,0,0-8.74-13.4C47.9,67.38,32,96.06,32,128a96,96,0,0,0,192,0C224,96.06,208.1,67.38,180.37,49.3Z" />
                                                </svg>
                                            }
                                            label="Arsipkan"
                                            onClick={() => setConfirm({ type: 'soft', id: token.id, label: token.label })}
                                        />
                                    )}

                                    {/* Hapus permanen */}
                                    <ActionBtn
                                        icon={
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
                                                <path d="M200,56V208a8,8,0,0,1-8,8H64a8,8,0,0,1-8-8V56Z" opacity="0.2" /><path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z" />
                                            </svg>
                                        }
                                        label="Hapus permanen"
                                        danger
                                        onClick={() => setConfirm({ type: 'hard', id: token.id, label: token.label })}
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
                <TokenFormModal
                    initial={editTarget}
                    onSubmit={handleFormSubmit}
                    onClose={() => { setShowModal(false); setEditTarget(null) }}
                    isSubmitting={isSubmitting}
                />
            )}

            {/* Confirm Modal */}
            <ConfirmModal
                open={!!confirm}
                title={confirm?.type === 'hard' ? 'Hapus Permanen?' : 'Arsipkan Token?'}
                message={
                    confirm?.type === 'hard'
                        ? `Token "${confirm?.label}" akan dihapus permanen dan tidak dapat dipulihkan.`
                        : `Token "${confirm?.label}" akan diarsipkan. API key tidak akan bisa dipakai sampai dipulihkan.`
                }
                variant={confirm?.type === 'hard' ? 'danger' : 'warning'}
                onConfirm={handleConfirm}
                onCancel={() => setConfirm(null)}
            />
        </div>
    )
}
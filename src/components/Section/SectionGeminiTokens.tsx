// components/Dashboard/sections/SectionGeminiTokens.tsx
'use client'

import { useState, useMemo } from 'react'
import { TableShell, SkeletonRows } from '@/components/Ui/TableShell'
import { ActionBtn } from '@/components/Ui/ActionBtn'
import { ConfirmModal } from '@/components/Ui/ConfirmModal'
import { ToggleSwitch } from '@/components/Ui/ToggleSwitch'
import { MiniStat } from '@/components/Card/StatCard'
import type { GeminiToken, CreateGeminiTokenPayload, UpdateGeminiTokenPayload } from '@/types/GeminiToken'

interface SectionGeminiTokensProps {
    tokens: GeminiToken[]
    isLoading?: boolean
    error?: string | null
    onCreate?: (payload: CreateGeminiTokenPayload) => Promise<GeminiToken | null>
    onUpdate?: (id: string, payload: UpdateGeminiTokenPayload) => Promise<boolean>
    onSoftDelete?: (id: string) => Promise<boolean>
    onRestore?: (id: string) => Promise<boolean>
    onHardDelete?: (id: string) => Promise<boolean>
    onSetDefault?: (id: string) => Promise<boolean>
    onToggleActive?: (id: string, current: boolean) => Promise<boolean>
}

// ── Helpers ────────────────────────────────────────────────────
const fmt = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
const fmtTime = (d: string) =>
    new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

/** Sensor API key: tampilkan 6 karakter pertama & 4 terakhir */
function maskKey(key: string): string {
    if (key.length <= 12) return '••••••••••••'
    return key.slice(0, 6) + '••••••••••' + key.slice(-4)
}

type ConfirmState = { type: 'soft' | 'hard'; id: string; label: string } | null

// ── Form Modal ─────────────────────────────────────────────────
interface TokenFormProps {
    initial?: GeminiToken | null
    onSubmit: (payload: CreateGeminiTokenPayload | UpdateGeminiTokenPayload) => Promise<void>
    onClose: () => void
    isSubmitting: boolean
}

function TokenFormModal({ initial, onSubmit, onClose, isSubmitting }: TokenFormProps) {
    const [label, setLabel] = useState(initial?.label ?? '')
    const [apiKey, setApiKey] = useState(initial?.api_key ?? '')
    const [description, setDescription] = useState(initial?.description ?? '')
    const [quotaLimit, setQuotaLimit] = useState<string>(
        initial?.quota_limit ? String(initial.quota_limit) : ''
    )
    const [isDefault, setIsDefault] = useState(initial?.is_default ?? false)
    const [showKey, setShowKey] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await onSubmit({
            label: label.trim(),
            api_key: apiKey.trim(),
            description: description.trim() || undefined,
            quota_limit: quotaLimit ? Number(quotaLimit) : null,
            is_default: isDefault,
        })
    }

    const inputBase =
        'w-full px-3 py-2 text-sm rounded-sm border border-neutral-200 bg-white text-neutral-800 ' +
        'placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-300 ' +
        'focus:border-violet-400 transition-all'

    const labelBase = 'block text-xs font-semibold text-neutral-600 mb-1'

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-sm border border-neutral-200 shadow-xl w-full max-w-md mx-4 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-neutral-900">
                            {initial ? 'Edit Token' : 'Tambah Token Baru'}
                        </h3>
                        <p className="text-xs text-neutral-400 mt-0.5">
                            {initial ? `ID: ${initial.id.slice(0, 8)}…` : 'Daftarkan Gemini API key baru'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-neutral-400 hover:text-neutral-700 transition-colors p-1"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    {/* Label */}
                    <div>
                        <label className={labelBase}>Label Token <span className="text-red-400">*</span></label>
                        <input
                            required
                            value={label}
                            onChange={e => setLabel(e.target.value)}
                            placeholder="contoh: Token Produksi"
                            className={inputBase}
                        />
                    </div>

                    {/* API Key */}
                    <div>
                        <label className={labelBase}>API Key <span className="text-red-400">*</span></label>
                        <div className="relative">
                            <input
                                required
                                type={showKey ? 'text' : 'password'}
                                value={apiKey}
                                onChange={e => setApiKey(e.target.value)}
                                placeholder="AIza..."
                                className={`${inputBase} pr-10 font-mono`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowKey(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors"
                            >
                                {showKey ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 256 256">
                                        <path d="M53.92,34.62A8,8,0,1,0,42.08,45.38L61.32,66.55C25,88.84,9.38,123.2,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208a127.11,127.11,0,0,0,52.07-10.83l22,24.21a8,8,0,1,0,11.84-10.76Zm47.33,75.84,41.66,45.85a32,32,0,0,1-41.66-45.85ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.16,133.16,0,0,1,25,128c4.69-8.79,19.66-33.39,47.35-49.38l18,19.75a48,48,0,0,0,63.66,70l14.67,16.14A112,112,0,0,1,128,192Zm6-95.43a8,8,0,0,1,3-15.72,48.16,48.16,0,0,1,38.77,42.64,8,8,0,0,1-7.22,8.71,6.39,6.39,0,0,1-.75,0,8,8,0,0,1-8-7.26A32.09,32.09,0,0,0,134,96.57Zm113.28,34.69c-.42.94-10.55,23.37-33.36,43.8a8,8,0,1,1-10.67-11.92A132.77,132.77,0,0,0,231.05,128a133.15,133.15,0,0,0-23.12-30.77C185.67,75.19,158.78,64,128,64a118.37,118.37,0,0,0-19.36,1.57A8,8,0,0,1,106,49.85,134.14,134.14,0,0,1,128,48c34.88,0,66.57,13.26,91.66,38.35,18.83,18.83,27.3,37.62,27.65,38.41A8,8,0,0,1,247.31,131.26Z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 256 256">
                                        <path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className={labelBase}>Deskripsi</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Catatan opsional tentang token ini…"
                            rows={2}
                            className={`${inputBase} resize-none`}
                        />
                    </div>

                    {/* Quota limit */}
                    <div>
                        <label className={labelBase}>Batas Kuota <span className="text-neutral-400 font-normal">(opsional)</span></label>
                        <input
                            type="number"
                            min={0}
                            value={quotaLimit}
                            onChange={e => setQuotaLimit(e.target.value)}
                            placeholder="Kosongkan = tidak ada batas"
                            className={inputBase}
                        />
                    </div>

                    {/* Set as default */}
                    <div className="flex items-center justify-between py-2 px-3 bg-violet-50 rounded-sm border border-violet-100">
                        <div>
                            <p className="text-xs font-medium text-violet-800">Jadikan token default</p>
                            <p className="text-[10px] text-violet-500 mt-0.5">Token ini akan otomatis dipakai oleh sistem AI</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsDefault(v => !v)}
                            className={`relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none
                                ${isDefault ? 'bg-violet-500' : 'bg-neutral-300'}`}
                        >
                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
                                ${isDefault ? 'translate-x-4' : 'translate-x-0'}`}
                            />
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-xs font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200
                                rounded-sm transition-colors disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !label.trim() || !apiKey.trim()}
                            className="px-4 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700
                                rounded-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting && (
                                <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                            )}
                            {initial ? 'Simpan Perubahan' : 'Tambah Token'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ── Main Component ─────────────────────────────────────────────
export function SectionGeminiTokens({
    tokens,
    isLoading,
    error,
    onCreate,
    onUpdate,
    onSoftDelete,
    onRestore,
    onHardDelete,
    onSetDefault,
    onToggleActive,
}: SectionGeminiTokensProps) {
    const [showDeleted, setShowDeleted] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [editTarget, setEditTarget] = useState<GeminiToken | null>(null)
    const [confirm, setConfirm] = useState<ConfirmState>(null)
    const [pending, setPending] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set())

    const filtered = useMemo(
        () => showDeleted ? tokens : tokens.filter(t => !t.deleted_at),
        [tokens, showDeleted]
    )

    const stats = useMemo(() => ({
        active: tokens.filter(t => t.is_active && !t.deleted_at).length,
        total: tokens.filter(t => !t.deleted_at).length,
        deleted: tokens.filter(t => !!t.deleted_at).length,
        defaultToken: tokens.find(t => t.is_default && !t.deleted_at),
    }), [tokens])

    // ── Handlers ───────────────────────────────────────────────
    const handleFormSubmit = async (payload: CreateGeminiTokenPayload | UpdateGeminiTokenPayload) => {
        setIsSubmitting(true)
        try {
            if (editTarget) {
                await onUpdate?.(editTarget.id, payload as UpdateGeminiTokenPayload)
            } else {
                await onCreate?.(payload as CreateGeminiTokenPayload)
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
            if (confirm.type === 'hard') await onHardDelete?.(confirm.id)
            else await onSoftDelete?.(confirm.id)
        } finally { setPending(null); setConfirm(null) }
    }

    const handleRestore = async (id: string) => {
        setPending(id)
        try { await onRestore?.(id) }
        finally { setPending(null) }
    }

    const handleSetDefault = async (id: string) => {
        setPending(id)
        try { await onSetDefault?.(id) }
        finally { setPending(null) }
    }

    const handleToggleActive = async (id: string, current: boolean) => {
        setPending(id)
        try { await onToggleActive?.(id, current) }
        finally { setPending(null) }
    }

    const toggleRevealKey = (id: string) => {
        setRevealedKeys(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    return (
        <div className="space-y-4">
            {/* Error banner */}
            {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-700 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M236.8,188.09,149.35,36.22a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM120,104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm8,88a12,12,0,1,1,12-12A12,12,0,0,1,128,192Z" />
                    </svg>
                    {error}
                </div>
            )}

            {/* Mini stats */}
            <div className="grid grid-cols-3 gap-3">
                <MiniStat label="Token Aktif" value={stats.active}
                    color="text-emerald-600" bg="bg-emerald-50" border="border-emerald-200" />
                <MiniStat label="Total Token" value={stats.total}
                    color="text-violet-600" bg="bg-violet-50" border="border-violet-200" />
                <MiniStat label="Diarsipkan" value={stats.deleted}
                    color="text-red-500" bg="bg-red-50" border="border-red-200" />
            </div>

            {/* Default token info */}
            {stats.defaultToken && (
                <div className="flex items-center gap-3 px-4 py-3 bg-violet-50 border border-violet-200 rounded-sm">
                    <span className="w-2 h-2 rounded-full bg-violet-500 shrink-0" />
                    <div className="text-xs text-violet-700 min-w-0">
                        <span className="font-semibold">Token Default Aktif:</span>
                        {' '}<span className="font-mono">{stats.defaultToken.label}</span>
                        {' '}—{' '}
                        <span className="text-violet-500 font-mono">{maskKey(stats.defaultToken.api_key)}</span>
                    </div>
                </div>
            )}

            {/* Table */}
            <TableShell
                title="Kelola Token Gemini API"
                subtitle="Manajemen API key untuk integrasi AI"
                badge={filtered.length}
                actions={
                    <div className="flex items-center gap-2">
                        <ToggleSwitch
                            checked={showDeleted}
                            onChange={setShowDeleted}
                            label="Tampilkan diarsipkan"
                        />
                        <button
                            onClick={() => { setEditTarget(null); setShowModal(true) }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold
                                text-white bg-violet-600 hover:bg-violet-700 rounded-sm transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" viewBox="0 0 256 256">
                                <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z" />
                            </svg>
                            Tambah Token
                        </button>
                    </div>
                }
                headers={['Label & Deskripsi', 'API Key', 'Kuota', 'Pemakaian', 'Status', 'Dibuat', 'Aksi']}
                isEmpty={!isLoading && filtered.length === 0}
                emptyText="Belum ada token Gemini API. Tambahkan token untuk memulai."
            >
                {isLoading ? (
                    <SkeletonRows cols={7} rows={3} />
                ) : filtered.map((token) => {
                    const isRevealed = revealedKeys.has(token.id)
                    const quotaUsed = token.quota_limit
                        ? Math.min(100, Math.round((token.usage_count / token.quota_limit) * 100))
                        : null

                    return (
                        <tr
                            key={token.id}
                            className={`hover:bg-neutral-50/60 transition-colors
                                ${token.deleted_at ? 'opacity-50' : ''}
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
                                                <span className="px-1.5 py-0.5 bg-violet-100 text-violet-700 text-[10px]
                                                    font-bold rounded ring-1 ring-violet-200 whitespace-nowrap leading-none">
                                                    DEFAULT
                                                </span>
                                            )}
                                        </div>
                                        {token.description && (
                                            <p className="text-[10px] text-neutral-400 mt-0.5 max-w-40 truncate">
                                                {token.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </td>

                            {/* API Key */}
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-[11px] text-neutral-600 tracking-tight">
                                        {isRevealed ? token.api_key : maskKey(token.api_key)}
                                    </span>
                                    <button
                                        onClick={() => toggleRevealKey(token.id)}
                                        className="text-neutral-300 hover:text-neutral-600 transition-colors shrink-0"
                                        title={isRevealed ? 'Sembunyikan' : 'Tampilkan'}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256">
                                            {isRevealed
                                                ? <path d="M53.92,34.62A8,8,0,1,0,42.08,45.38L61.32,66.55C25,88.84,9.38,123.2,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208a127.11,127.11,0,0,0,52.07-10.83l22,24.21a8,8,0,1,0,11.84-10.76Zm47.33,75.84,41.66,45.85a32,32,0,0,1-41.66-45.85ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.16,133.16,0,0,1,25,128c4.69-8.79,19.66-33.39,47.35-49.38l18,19.75a48,48,0,0,0,63.66,70l14.67,16.14A112,112,0,0,1,128,192Zm6-95.43a8,8,0,0,1,3-15.72,48.16,48.16,0,0,1,38.77,42.64,8,8,0,0,1-7.22,8.71,6.39,6.39,0,0,1-.75,0,8,8,0,0,1-8-7.26A32.09,32.09,0,0,0,134,96.57Zm113.28,34.69c-.42.94-10.55,23.37-33.36,43.8a8,8,0,1,1-10.67-11.92A132.77,132.77,0,0,0,231.05,128a133.15,133.15,0,0,0-23.12-30.77C185.67,75.19,158.78,64,128,64a118.37,118.37,0,0,0-19.36,1.57A8,8,0,0,1,106,49.85,134.14,134.14,0,0,1,128,48c34.88,0,66.57,13.26,91.66,38.35,18.83,18.83,27.3,37.62,27.65,38.41A8,8,0,0,1,247.31,131.26Z" />
                                                : <path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z" />
                                            }
                                        </svg>
                                    </button>
                                </div>
                            </td>

                            {/* Kuota */}
                            <td className="px-4 py-3">
                                {token.quota_limit ? (
                                    <div className="min-w-0 w-24">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] text-neutral-500 font-mono">
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
                                    <span className="text-xs text-neutral-400 font-mono">
                                        {token.usage_count} req
                                    </span>
                                )}
                            </td>

                            {/* Last used */}
                            <td className="px-4 py-3 text-xs text-neutral-400 whitespace-nowrap">
                                {token.last_used_at ? (
                                    <>
                                        <span className="block">{fmt(token.last_used_at)}</span>
                                        <span className="block text-neutral-300">{fmtTime(token.last_used_at)}</span>
                                    </>
                                ) : (
                                    <span className="text-neutral-300 text-[11px]">Belum dipakai</span>
                                )}
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3">
                                <div className="flex flex-col gap-1">
                                    {/* Active toggle */}
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
                                    {/* Error indicator */}
                                    {token.error_count > 0 && (
                                        <span className="text-[10px] text-red-500 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                                            {token.error_count} error
                                        </span>
                                    )}
                                </div>
                            </td>

                            {/* Dibuat */}
                            <td className="px-4 py-3 text-xs text-neutral-400 whitespace-nowrap">
                                <span className="block">{fmt(token.created_at)}</span>
                                <span className="block text-neutral-300">{fmtTime(token.created_at)}</span>
                            </td>

                            {/* Aksi */}
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-0.5">
                                    {/* Edit */}
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
                                                    <path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34l13.49-58.54-45.11-39.42a16,16,0,0,1,9.12-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L187,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z" />
                                                </svg>
                                            }
                                            label="Set Default"
                                            onClick={() => handleSetDefault(token.id)}
                                        />
                                    )}

                                    {/* Arsipkan / Pulihkan */}
                                    {token.deleted_at ? (
                                        <ActionBtn
                                            icon={
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
                                                    <path d="M216,208H40a16,16,0,0,1-13.84-24l88-152a16,16,0,0,1,27.7,0l88,152A16,16,0,0,1,216,208Z" opacity="0.2" /><path d="M96,208a8,8,0,0,1-8,8H40a24,24,0,0,1-20.77-36l34.29-59.25L39.47,124.5A8,8,0,1,1,35.33,109l32.77-8.77a8,8,0,0,1,9.8,5.66l8.79,32.77A8,8,0,0,1,81,148.5a8.37,8.37,0,0,1-2.08.27,8,8,0,0,1-7.72-5.93l-3.8-14.15L33.11,188A8,8,0,0,0,40,200H88A8,8,0,0,1,96,208Z" />
                                                </svg>
                                            }
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
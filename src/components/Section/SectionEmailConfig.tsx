// components/Dashboard/sections/SectionEmailConfig.tsx
'use client'

import { useState } from 'react'
import { TableShell, SkeletonRows } from '@/components/Ui/TableShell'
import { ActionBtn } from '@/components/Ui/ActionBtn'
import { ConfirmModal } from '@/components/Ui/ConfirmModal'
import { MiniStat } from '@/components/Card/StatCard'
import type {
    EmailConfig,
    CreateEmailConfigPayload,
    UpdateEmailConfigPayload,
} from '@/types/EmailConfig'

// ── Props ──────────────────────────────────────────────────────
interface SectionEmailConfigProps {
    configs: EmailConfig[]
    isLoading?: boolean
    error?: string | null
    onCreate?: (payload: CreateEmailConfigPayload) => Promise<EmailConfig | null>
    onUpdate?: (id: string, payload: UpdateEmailConfigPayload) => Promise<boolean>
    onDelete?: (id: string) => Promise<boolean>
    onToggleActive?: (id: string, current: boolean) => Promise<boolean>
}

// ── Helpers ────────────────────────────────────────────────────
const fmt = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
const fmtTime = (d: string) =>
    new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

function maskPassword(pwd: string): string {
    if (pwd.length <= 6) return '••••••••••'
    return pwd.slice(0, 3) + '••••••••' + pwd.slice(-2)
}

type ConfirmState = { id: string; label: string } | null

// ── Icon helpers ───────────────────────────────────────────────
const IconEyeOff = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
        <path d="M53.92,34.62A8,8,0,1,0,42.08,45.38L61.32,66.55C25,88.84,9.38,123.2,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208a127.11,127.11,0,0,0,52.07-10.83l22,24.21a8,8,0,1,0,11.84-10.76Zm47.33,75.84,41.66,45.85a32,32,0,0,1-41.66-45.85ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.16,133.16,0,0,1,25,128c4.69-8.79,19.66-33.39,47.35-49.38l18,19.75a48,48,0,0,0,63.66,70l14.67,16.14A112,112,0,0,1,128,192Zm6-95.43a8,8,0,0,1,3-15.72,48.16,48.16,0,0,1,38.77,42.64,8,8,0,0,1-7.22,8.71,6.39,6.39,0,0,1-.75,0,8,8,0,0,1-8-7.26A32.09,32.09,0,0,0,134,96.57Zm113.28,34.69c-.42.94-10.55,23.37-33.36,43.8a8,8,0,1,1-10.67-11.92A132.77,132.77,0,0,0,231.05,128a133.15,133.15,0,0,0-23.12-30.77C185.67,75.19,158.78,64,128,64a118.37,118.37,0,0,0-19.36,1.57A8,8,0,0,1,106,49.85,134.14,134.14,0,0,1,128,48c34.88,0,66.57,13.26,91.66,38.35,18.83,18.83,27.3,37.62,27.65,38.41A8,8,0,0,1,247.31,131.26Z" />
    </svg>
)

const IconEye = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
        <path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z" />
    </svg>
)

const IconEdit = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
        <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z" />
    </svg>
)

const IconDelete = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
        <path d="M200,56V208a8,8,0,0,1-8,8H64a8,8,0,0,1-8-8V56Z" opacity="0.2" />
        <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z" />
    </svg>
)

const IconPlus = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" viewBox="0 0 256 256">
        <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z" />
    </svg>
)

const IconX = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
        <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
    </svg>
)

// ── Form Modal ─────────────────────────────────────────────────
interface ConfigFormProps {
    initial?: EmailConfig | null
    onSubmit: (payload: CreateEmailConfigPayload | UpdateEmailConfigPayload) => Promise<void>
    onClose: () => void
    isSubmitting: boolean
}

function ConfigFormModal({ initial, onSubmit, onClose, isSubmitting }: ConfigFormProps) {
    const [mailMailer, setMailMailer] = useState(initial?.mail_mailer ?? 'smtp')
    const [mailHost, setMailHost] = useState(initial?.mail_host ?? '')
    const [mailPort, setMailPort] = useState<string>(initial?.mail_port ? String(initial.mail_port) : '587')
    const [mailUsername, setMailUsername] = useState(initial?.mail_username ?? '')
    const [mailPassword, setMailPassword] = useState(initial?.mail_password ?? '')
    const [mailEncryption, setMailEncryption] = useState(initial?.mail_encryption ?? 'tls')
    const [mailFromAddress, setMailFromAddress] = useState(initial?.mail_from_address ?? '')
    const [mailFromName, setMailFromName] = useState(initial?.mail_from_name ?? '')
    const [isActive, setIsActive] = useState(initial?.is_active ?? false)
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await onSubmit({
            mail_mailer: mailMailer.trim(),
            mail_host: mailHost.trim(),
            mail_port: Number(mailPort),
            mail_username: mailUsername.trim(),
            mail_password: mailPassword.trim(),
            mail_encryption: mailEncryption,
            mail_from_address: mailFromAddress.trim(),
            mail_from_name: mailFromName.trim(),
            is_active: isActive,
        })
    }

    const inputBase =
        'w-full px-3 py-2 text-sm rounded-sm border border-neutral-200 bg-white text-neutral-800 ' +
        'placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 ' +
        'focus:border-emerald-400 transition-all'
    const labelBase = 'block text-xs font-semibold text-neutral-600 mb-1'

    const isValid = mailHost.trim() && mailUsername.trim() && mailPassword.trim() &&
        mailFromAddress.trim() && mailFromName.trim() && mailPort

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-sm border border-neutral-200 shadow-xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between shrink-0">
                    <div>
                        <h3 className="text-sm font-semibold text-neutral-900">
                            {initial ? 'Edit Email Config' : 'Tambah Email Config Baru'}
                        </h3>
                        <p className="text-xs text-neutral-400 mt-0.5">
                            {initial
                                ? `ID: ${initial.id.slice(0, 8)}…`
                                : 'Konfigurasi SMTP untuk pengiriman email'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-neutral-400 hover:text-neutral-700 transition-colors p-1"
                    >
                        <IconX />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 overflow-y-auto flex-1">

                    {/* Row: Mailer + Encryption */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelBase}>
                                Mailer <span className="text-red-400">*</span>
                            </label>
                            <select
                                value={mailMailer}
                                onChange={e => setMailMailer(e.target.value)}
                                className={inputBase}
                            >
                                <option value="smtp">SMTP</option>
                                <option value="sendmail">Sendmail</option>
                                <option value="log">Log (Dev)</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelBase}>
                                Enkripsi <span className="text-red-400">*</span>
                            </label>
                            <select
                                value={mailEncryption}
                                onChange={e => setMailEncryption(e.target.value as 'tls' | 'ssl' | 'none')}
                                className={inputBase}
                            >
                                <option value="tls">TLS</option>
                                <option value="ssl">SSL</option>
                                <option value="none">None</option>
                            </select>
                        </div>
                    </div>

                    {/* Row: Host + Port */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                            <label className={labelBase}>
                                SMTP Host <span className="text-red-400">*</span>
                            </label>
                            <input
                                required
                                value={mailHost}
                                onChange={e => setMailHost(e.target.value)}
                                placeholder="smtp.gmail.com"
                                className={inputBase}
                            />
                        </div>
                        <div>
                            <label className={labelBase}>
                                Port <span className="text-red-400">*</span>
                            </label>
                            <input
                                required
                                type="number"
                                min={1}
                                max={65535}
                                value={mailPort}
                                onChange={e => setMailPort(e.target.value)}
                                placeholder="587"
                                className={inputBase}
                            />
                        </div>
                    </div>

                    {/* Username */}
                    <div>
                        <label className={labelBase}>
                            Username / Email SMTP <span className="text-red-400">*</span>
                        </label>
                        <input
                            required
                            type="email"
                            value={mailUsername}
                            onChange={e => setMailUsername(e.target.value)}
                            placeholder="user@gmail.com"
                            className={inputBase}
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className={labelBase}>
                            Password / App Password <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                            <input
                                required
                                type={showPassword ? 'text' : 'password'}
                                value={mailPassword}
                                onChange={e => setMailPassword(e.target.value)}
                                placeholder="App password dari Google/provider"
                                className={`${inputBase} pr-10 font-mono`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors"
                            >
                                {showPassword ? <IconEyeOff /> : <IconEye />}
                            </button>
                        </div>
                    </div>

                    {/* Row: From Address + From Name */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelBase}>
                                From Address <span className="text-red-400">*</span>
                            </label>
                            <input
                                required
                                type="email"
                                value={mailFromAddress}
                                onChange={e => setMailFromAddress(e.target.value)}
                                placeholder="noreply@domain.com"
                                className={inputBase}
                            />
                        </div>
                        <div>
                            <label className={labelBase}>
                                From Name <span className="text-red-400">*</span>
                            </label>
                            <input
                                required
                                value={mailFromName}
                                onChange={e => setMailFromName(e.target.value)}
                                placeholder="Nama Aplikasi"
                                className={inputBase}
                            />
                        </div>
                    </div>

                    {/* Set Active */}
                    <div className="flex items-center justify-between py-2 px-3 bg-emerald-50 rounded-sm border border-emerald-100">
                        <div>
                            <p className="text-xs font-medium text-emerald-800">Jadikan config aktif</p>
                            <p className="text-[10px] text-emerald-500 mt-0.5">
                                Config ini akan digunakan untuk pengiriman email sistem
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsActive(v => !v)}
                            className={`relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none
                                ${isActive ? 'bg-emerald-500' : 'bg-neutral-300'}`}
                        >
                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
                                ${isActive ? 'translate-x-4' : 'translate-x-0'}`}
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
                            disabled={isSubmitting || !isValid}
                            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700
                                rounded-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting && (
                                <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                            )}
                            {initial ? 'Simpan Perubahan' : 'Tambah Config'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ── Main Component ─────────────────────────────────────────────
export function SectionEmailConfig({
    configs,
    isLoading,
    error,
    onCreate,
    onUpdate,
    onDelete,
    onToggleActive,
}: SectionEmailConfigProps) {
    const [showModal, setShowModal] = useState(false)
    const [editTarget, setEditTarget] = useState<EmailConfig | null>(null)
    const [confirm, setConfirm] = useState<ConfirmState>(null)
    const [pending, setPending] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [revealedPasswords, setRevealedPasswords] = useState<Set<string>>(new Set())

    const activeConfig = configs.find(c => c.is_active)
    const totalActive = configs.filter(c => c.is_active).length

    // ── Handlers ───────────────────────────────────────────────
    const handleFormSubmit = async (
        payload: CreateEmailConfigPayload | UpdateEmailConfigPayload
    ) => {
        setIsSubmitting(true)
        try {
            if (editTarget) {
                await onUpdate?.(editTarget.id, payload as UpdateEmailConfigPayload)
            } else {
                await onCreate?.(payload as CreateEmailConfigPayload)
            }
            setShowModal(false)
            setEditTarget(null)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleConfirmDelete = async () => {
        if (!confirm) return
        setPending(confirm.id)
        try {
            await onDelete?.(confirm.id)
        } finally {
            setPending(null)
            setConfirm(null)
        }
    }

    const handleToggleActive = async (id: string, current: boolean) => {
        setPending(id)
        try { await onToggleActive?.(id, current) }
        finally { setPending(null) }
    }

    const toggleRevealPassword = (id: string) => {
        setRevealedPasswords(prev => {
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
                <MiniStat
                    label="Config Aktif"
                    value={totalActive}
                    color="text-emerald-600"
                    bg="bg-emerald-50"
                    border="border-emerald-200"
                />
                <MiniStat
                    label="Total Config"
                    value={configs.length}
                    color="text-sky-600"
                    bg="bg-sky-50"
                    border="border-sky-200"
                />
                <MiniStat
                    label="Nonaktif"
                    value={configs.length - totalActive}
                    color="text-neutral-500"
                    bg="bg-neutral-100"
                    border="border-neutral-200"
                />
            </div>

            {/* Active config info banner */}
            {activeConfig && (
                <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                    <div className="text-xs text-emerald-700 min-w-0">
                        <span className="font-semibold">Config Aktif:</span>
                        {' '}<span className="font-mono">{activeConfig.mail_from_name}</span>
                        {' '}—{' '}
                        <span className="text-emerald-500 font-mono">{activeConfig.mail_from_address}</span>
                        {' '}via{' '}
                        <span className="font-mono">{activeConfig.mail_host}:{activeConfig.mail_port}</span>
                    </div>
                </div>
            )}

            {/* Table */}
            <TableShell
                title="Kelola Email Config"
                subtitle="Konfigurasi SMTP untuk pengiriman email sistem"
                badge={configs.length}
                actions={
                    <button
                        onClick={() => { setEditTarget(null); setShowModal(true) }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold
                            text-white bg-emerald-600 hover:bg-emerald-700 rounded-sm transition-colors"
                    >
                        <IconPlus />
                        Tambah Config
                    </button>
                }
                headers={['Pengirim', 'SMTP Host', 'Username', 'Password', 'Enkripsi', 'Status', 'Diperbarui', 'Aksi']}
                isEmpty={!isLoading && configs.length === 0}
                emptyText="Belum ada konfigurasi email. Tambahkan config SMTP untuk memulai."
            >
                {isLoading ? (
                    <SkeletonRows cols={8} rows={3} />
                ) : configs.map((cfg) => {
                    const isRevealed = revealedPasswords.has(cfg.id)

                    return (
                        <tr
                            key={cfg.id}
                            className={`hover:bg-neutral-50/60 transition-colors
                                ${pending === cfg.id ? 'pointer-events-none opacity-40' : ''}`}
                        >
                            {/* Pengirim */}
                            <td className="px-4 py-3">
                                <div className="flex items-start gap-2 min-w-0">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="text-xs font-semibold text-neutral-800 truncate max-w-36">
                                                {cfg.mail_from_name}
                                            </span>
                                            {cfg.is_active && (
                                                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px]
                                                    font-bold rounded ring-1 ring-emerald-200 whitespace-nowrap leading-none">
                                                    AKTIF
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-neutral-400 mt-0.5 font-mono truncate max-w-40">
                                            {cfg.mail_from_address}
                                        </p>
                                    </div>
                                </div>
                            </td>

                            {/* SMTP Host */}
                            <td className="px-4 py-3">
                                <span className="font-mono text-[11px] text-neutral-600">
                                    {cfg.mail_host}
                                </span>
                                <span className="text-[10px] text-neutral-400 block">
                                    :{cfg.mail_port} — {cfg.mail_mailer.toUpperCase()}
                                </span>
                            </td>

                            {/* Username */}
                            <td className="px-4 py-3">
                                <span className="font-mono text-[11px] text-neutral-600 max-w-36 truncate block">
                                    {cfg.mail_username}
                                </span>
                            </td>

                            {/* Password */}
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-[11px] text-neutral-600 tracking-tight">
                                        {isRevealed ? cfg.mail_password : maskPassword(cfg.mail_password)}
                                    </span>
                                    <button
                                        onClick={() => toggleRevealPassword(cfg.id)}
                                        className="text-neutral-300 hover:text-neutral-600 transition-colors shrink-0"
                                        title={isRevealed ? 'Sembunyikan' : 'Tampilkan'}
                                    >
                                        {isRevealed ? <IconEyeOff /> : <IconEye />}
                                    </button>
                                </div>
                            </td>

                            {/* Enkripsi */}
                            <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold
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

                            {/* Status toggle */}
                            <td className="px-4 py-3">
                                <button
                                    onClick={() => handleToggleActive(cfg.id, cfg.is_active)}
                                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[10px] font-semibold
                                        transition-colors w-fit border
                                        ${cfg.is_active
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                            : 'bg-neutral-100 text-neutral-500 border-neutral-200 hover:bg-neutral-200'
                                        }`}
                                >
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0
                                        ${cfg.is_active ? 'bg-emerald-500' : 'bg-neutral-400'}`}
                                    />
                                    {cfg.is_active ? 'Aktif' : 'Nonaktif'}
                                </button>
                            </td>

                            {/* Updated at */}
                            <td className="px-4 py-3 text-xs text-neutral-400 whitespace-nowrap">
                                <span className="block">{fmt(cfg.updated_at)}</span>
                                <span className="block text-neutral-300">{fmtTime(cfg.updated_at)}</span>
                            </td>

                            {/* Aksi */}
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-0.5">
                                    <ActionBtn
                                        icon={<IconEdit />}
                                        label="Edit"
                                        onClick={() => { setEditTarget(cfg); setShowModal(true) }}
                                    />
                                    <ActionBtn
                                        icon={<IconDelete />}
                                        label="Hapus"
                                        danger
                                        onClick={() =>
                                            setConfirm({ id: cfg.id, label: cfg.mail_from_name })
                                        }
                                    />
                                </div>
                            </td>
                        </tr>
                    )
                })}
            </TableShell>

            {/* Form Modal */}
            {showModal && (
                <ConfigFormModal
                    initial={editTarget}
                    onSubmit={handleFormSubmit}
                    onClose={() => { setShowModal(false); setEditTarget(null) }}
                    isSubmitting={isSubmitting}
                />
            )}

            {/* Confirm Delete Modal */}
            <ConfirmModal
                open={!!confirm}
                title="Hapus Email Config?"
                message={`Config "${confirm?.label}" akan dihapus permanen dan tidak dapat dipulihkan.`}
                variant="danger"
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirm(null)}
            />
        </div>
    )
}
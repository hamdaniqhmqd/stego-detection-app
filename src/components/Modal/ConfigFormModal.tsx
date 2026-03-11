// src/components/Modal/ConfigFormModal.tsx

import { CreateEmailConfigPayload, EmailConfig, UpdateEmailConfigPayload } from "@/types/EmailConfig"
import { IconX, IconEye, IconEyeOff } from "@/utils/Icons"
import { useState } from "react"

interface ConfigFormProps {
    initial?: EmailConfig | null
    onSubmit: (payload: CreateEmailConfigPayload | UpdateEmailConfigPayload) => Promise<void>
    onClose: () => void
    isSubmitting: boolean
}

export function ConfigFormModal({ initial, onSubmit, onClose, isSubmitting }: ConfigFormProps) {
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
                    <div className="flex items-center justify-between py-2 px-3 bg-neutral-100 rounded-sm border border-neutral-100">
                        <div>
                            <p className="text-xs font-medium text-neutral-800">Jadikan config aktif</p>
                            <p className="text-[11px] text-neutral-600 mt-0.5">
                                Config ini akan digunakan untuk pengiriman email sistem
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsActive(v => !v)}
                            className={`relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none
                                ${isActive ? 'bg-neutral-700' : 'bg-neutral-500'}`}
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
                                rounded-sm transition-all disabled:opacity-50 duration-150 ease-in-out
                                hover:shadow-[-4px_5px_0_rgba(26,26,46,1)] hover:-translate-y-0.5
                                "
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !isValid}
                            className="px-4 py-2 text-xs font-semibold text-white bg-neutral-600 hover:bg-neutral-700
                                rounded-sm transition-all disabled:opacity-50 duration-150 ease-in-out
                                hover:shadow-[-4px_5px_0_rgba(26,26,46,1)] hover:-translate-y-0.5"
                        >
                            {isSubmitting && (
                                <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                            )}
                            {initial ? 'Simpan Perubahan' : 'Tambah Config'}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    )
}
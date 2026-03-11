// src/components/Modal/TokenFormModal.tsx

'use client'

import { CreateGeminiTokenPayload, GeminiToken, UpdateGeminiTokenPayload } from "@/types/GeminiToken"
import { useState } from "react"

interface TokenFormProps {
    initial?: GeminiToken | null
    onSubmit: (payload: CreateGeminiTokenPayload | UpdateGeminiTokenPayload) => Promise<void>
    onClose: () => void
    isSubmitting: boolean
}

export function TokenFormModal({ initial, onSubmit, onClose, isSubmitting }: TokenFormProps) {
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
                    <div className="flex items-center justify-between py-2 px-3 bg-neutral-100 rounded-sm border border-neutral-100">
                        <div>
                            <p className="text-xs font-medium text-neutral-800">Jadikan token default</p>
                            <p className="text-[10px] text-neutral-600 mt-0.5">Token ini akan otomatis dipakai oleh sistem AI</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsDefault(v => !v)}
                            className={`relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none
                                ${isDefault ? 'bg-neutral-700' : 'bg-neutral-500'}`}
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
                                rounded-sm transition-colors disabled:opacity-50
                                hover:shadow-[-4px_5px_0_rgba(26,26,46,1)] hover:-translate-y-0.5"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !label.trim() || !apiKey.trim()}
                            className="px-4 py-2 text-xs font-semibold text-white bg-neutral-600 hover:bg-neutral-700
                                rounded-sm transition-colors disabled:opacity-50 flex items-center gap-2
                                hover:shadow-[-4px_5px_0_rgba(26,26,46,1)] hover:-translate-y-0.5"
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
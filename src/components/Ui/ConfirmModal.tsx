'use client'

import React from "react"

// components/Dashboard/ui/ConfirmModal.tsx

export type ConfirmModalVariant = 'info' | 'warning' | 'danger'

interface ConfirmModalProps {
    open: boolean
    title: string
    message: string
    /** @default 'warning' */
    variant?: ConfirmModalVariant
    /** Label tombol konfirmasi — default menyesuaikan variant */
    confirmLabel?: string
    /** Label tombol batal — default 'Batal' */
    cancelLabel?: string
    onConfirm: () => void
    onCancel: () => void
}

const VARIANT_CONFIG: Record<ConfirmModalVariant, {
    icon: React.ReactNode
    iconColor: string
    iconBg: string
    iconRing: string
    confirmBtn: string
    titleColor: string
}> = {
    info: {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256">
                <path d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z" opacity="0.2"></path>
                <path d="M144,176a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176Zm88-48A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128ZM124,96a12,12,0,1,0-12-12A12,12,0,0,0,124,96Z"></path>
            </svg>
        ),
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-50',
        iconRing: 'ring-blue-100',
        confirmBtn: 'bg-blue-500 hover:shadow-[-5px_5px_0_rgba(29,78,216,1)] hover:-translate-y-0.5',
        titleColor: 'text-neutral-900',
    },
    warning: {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256">
                <path d="M215.46,216H40.54C27.92,216,20,202.79,26.13,192.09L113.59,40.22c6.3-11,22.52-11,28.82,0l87.46,151.87C236,202.79,228.08,216,215.46,216Z" opacity="0.2"></path>
                <path d="M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM222.93,203.8a8.5,8.5,0,0,1-7.48,4.2H40.55a8.5,8.5,0,0,1-7.48-4.2,7.59,7.59,0,0,1,0-7.72L120.52,44.21a8.75,8.75,0,0,1,15,0l87.45,151.87A7.59,7.59,0,0,1,222.93,203.8ZM120,144V104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,180Z"></path>
            </svg>
        ),
        iconColor: 'text-amber-600',
        iconBg: 'bg-amber-50',
        iconRing: 'ring-amber-100',
        confirmBtn: 'bg-amber-500 hover:shadow-[-5px_5px_0_rgba(180,83,9,1)] hover:-translate-y-0.5',
        titleColor: 'text-neutral-900',
    },
    danger: {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256">
                <path d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z" opacity="0.2"></path>
                <path d="M165.66,101.66,139.31,128l26.35,26.34a8,8,0,0,1-11.32,11.32L128,139.31l-26.34,26.35a8,8,0,0,1-11.32-11.32L116.69,128,90.34,101.66a8,8,0,0,1,11.32-11.32L128,116.69l26.34-26.35a8,8,0,0,1,11.32,11.32ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path>
            </svg>
        ),
        iconColor: 'text-red-600',
        iconBg: 'bg-red-50',
        iconRing: 'ring-red-100',
        confirmBtn: 'bg-red-500 hover:shadow-[-5px_5px_0_rgba(185,28,28,1)] hover:-translate-y-0.5',
        titleColor: 'text-red-600',
    },
}

const DEFAULT_CONFIRM_LABEL: Record<ConfirmModalVariant, string> = {
    info: 'Oke',
    warning: 'Lanjutkan',
    danger: 'Hapus',
}

export function ConfirmModal({
    open,
    title,
    message,
    variant = 'warning',
    confirmLabel,
    cancelLabel = 'Batal',
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    if (!open) return null

    const cfg = VARIANT_CONFIG[variant]
    const btnLabel = confirmLabel ?? DEFAULT_CONFIRM_LABEL[variant]

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
                onClick={onCancel}
            />

            <div className="relative bg-neutral-50 rounded-sm shadow-xl border border-neutral-100 p-6 w-full max-w-sm
                animate-in fade-in zoom-in-95 duration-150">

                {/* Icon */}
                <div className={`w-14 h-14 rounded-md flex items-center justify-center mx-auto mb-4
                    ring-4 ${cfg.iconBg} ${cfg.iconRing}`}>
                    <span className={`leading-none ${cfg.iconColor}`}>
                        {cfg.icon}
                    </span>
                </div>

                {/* Text */}
                <h3 className={`text-base font-semibold text-center ${cfg.titleColor}`}>{title}</h3>
                <p className="text-sm text-neutral-500 text-center mt-1.5 leading-relaxed">{message}</p>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                    {/* Tombol batal */}
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 rounded-sm border border-neutral-300 text-sm font-medium
                            text-neutral-700 bg-white
                            hover:bg-neutral-50 hover:shadow-[-5px_5px_0_rgba(82,82,82,1)] hover:-translate-y-0.5
                            active:translate-y-0 active:shadow-none
                            transition-all duration-200 ease-in-out"
                    >
                        {cancelLabel}
                    </button>

                    {/* Tombol konfirmasi */}
                    <button
                        onClick={onConfirm}
                        className={`flex-1 px-4 py-2.5 rounded-sm text-sm font-medium text-white
                            active:translate-y-0 active:shadow-none
                            transition-all duration-200 ease-in-out
                            ${cfg.confirmBtn}`}
                    >
                        {btnLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}
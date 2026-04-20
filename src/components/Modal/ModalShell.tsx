'use client'

import { useEffect, useRef } from 'react'

export default function ModalShell({
    open,
    onClose,
    title,
    subtitle,
    children,
    width = 'max-w-2xl',
}: {
    open: boolean
    onClose: () => void
    title: string
    subtitle?: string
    children: React.ReactNode
    width?: string
}) {
    const overlayRef = useRef<HTMLDivElement>(null)

    // Close on Escape
    useEffect(() => {
        if (!open) return
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [open, onClose])

    // Lock body scroll
    useEffect(() => {
        if (open) document.body.style.overflow = 'hidden'
        else document.body.style.overflow = ''
        return () => { document.body.style.overflow = '' }
    }, [open])

    if (!open) return null

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4"
            onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm" />

            {/* Panel */}
            <div className={`relative bg-white rounded-md shadow-2xl border border-neutral-100
                w-full ${width} max-h-[90vh] flex flex-col`}>

                {/* Header */}
                <div className="flex items-start justify-between px-4 py-3 md:px-6 md:py-5
                    border-b border-neutral-100 shrink-0">
                    <div>
                        <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
                        {subtitle && (
                            <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center
                            text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100
                            transition-colors text-lg leading-none ml-4 shrink-0"
                    >
                        ✕
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="overflow-y-auto flex-1 px-4 py-3 md:px-6 md:py-5">
                    {children}
                </div>
            </div>
        </div>
    )
}
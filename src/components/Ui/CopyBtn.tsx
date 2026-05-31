// src/components/Ui/CopyBtn.tsx

import { useState } from "react"

export function useCopy() {
    const [copiedKey, setCopiedKey] = useState<string | null>(null)
    const copy = async (text: string, key: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedKey(key)
            setTimeout(() => setCopiedKey(null), 2000)
        } catch {
            const ta = document.createElement('textarea')
            ta.value = text
            document.body.appendChild(ta)
            ta.select()
            document.execCommand('copy')
            document.body.removeChild(ta)
            setCopiedKey(key)
            setTimeout(() => setCopiedKey(null), 2000)
        }
    }
    return { copy, copiedKey }
}

export function CopyBtn({ text, copyKey, onCopy, isCopied }: {
    text: string; copyKey: string
    onCopy: (text: string, key: string) => void; isCopied: boolean
}) {
    return (
        <button
            type="button"
            onClick={() => onCopy(text, copyKey)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium
                border transition-all duration-150 shrink-0
                hover:-translate-y-0.5 hover:shadow-[-2px_2px_0_rgba(26,26,46,0.8)]
                active:translate-y-0 active:shadow-none
                ${isCopied
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-400 -translate-y-0.5 shadow-[-2px_2px_0_rgba(16,185,129,0.3)]'
                    : 'bg-neutral-50 text-neutral-500 border-neutral-400 hover:bg-neutral-100 hover:text-neutral-700'
                }`}
        >
            {isCopied ? (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z" />
                    </svg>
                    Tersalin
                </>
            ) : (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z" />
                    </svg>
                    Salin
                </>
            )}
        </button>
    )
}
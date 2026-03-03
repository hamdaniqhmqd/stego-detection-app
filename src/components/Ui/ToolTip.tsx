// src/components/Ui/ToolTip.tsx

import React, { useCallback, useState } from "react";
import { createPortal } from "react-dom";

export function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
    const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
    const ref = React.useRef<HTMLSpanElement>(null)

    const show = useCallback(() => {
        if (!ref.current) return
        const r = ref.current.getBoundingClientRect()
        setPos({ x: r.left + r.width / 2, y: r.top })
    }, [])

    const hide = useCallback(() => setPos(null), [])

    return (
        <>
            <span ref={ref} className="inline-block" onMouseEnter={show} onMouseLeave={hide}>
                {children}
            </span>
            {pos && typeof document !== 'undefined' && createPortal(
                <span
                    style={{
                        position: 'fixed',
                        left: pos.x,
                        top: pos.y - 8,
                        transform: 'translate(-50%, -100%)',
                        zIndex: 9999,
                        pointerEvents: 'none',
                    }}
                    className="px-2 py-1 max-w-64 rounded-sm bg-neutral-900 text-white text-xs font-medium shadow-lg">
                    {text}
                    <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900" />
                </span>,
                document.body
            )}
        </>
    )
}
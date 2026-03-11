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
                        left: pos.x,
                        top: pos.y - 8,
                        zIndex: 9999,
                        pointerEvents: 'none',
                    }}
                    className="fixed -translate-x-1/2 -translate-y-full px-2 py-1 max-w-64 
                    rounded-sm bg-red-50 text-red-600 text-xs font-medium shadow-lg border border-red-300">
                    {text}
                </span>,
                document.body
            )}
        </>
    )
}
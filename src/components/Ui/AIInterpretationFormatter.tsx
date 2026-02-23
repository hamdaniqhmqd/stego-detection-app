'use client'

// ─── Komponen: AIInterpretationText ─────────────────────────────────────────
// Mem-parse dan me-render teks markdown sederhana dari response AI
// agar konsisten dengan dark theme yang sudah ada.
//
// Mendukung:
//   **bold**         → <strong> dengan warna lebih terang
//   `inline code`    → monospace highlight
//   1. item          → ordered list (numbered)
//   - item / * item  → unordered list
//   ### heading      → sub-heading

interface AIInterpretationTextProps {
    text: string
}

// ─── Inline parser: bold + inline code ──────────────────────────────────────

function parseInline(raw: string): React.ReactNode[] {
    // Split by **bold** and `code` tokens
    const parts = raw.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return (
                <strong key={i} className="text-neutral-950 font-semibold">
                    {part.slice(2, -2)}
                </strong>
            )
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return (
                <code
                    key={i}
                    className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-neutral-800 text-amber-400 border border-neutral-700"
                >
                    {part.slice(1, -1)}
                </code>
            )
        }
        return <span key={i}>{part}</span>
    })
}

// ─── Block-level parser ──────────────────────────────────────────────────────

export function AIInterpretationText({ text }: AIInterpretationTextProps) {
    if (!text) return null

    const lines = text.split('\n')
    const nodes: React.ReactNode[] = []
    let i = 0

    while (i < lines.length) {
        const line = lines[i]
        const trimmed = line.trim()

        // ── Skip empty lines (handled as spacing between blocks) ──
        if (trimmed === '') {
            i++
            continue
        }

        // ── Heading: ### / ## / # ─────────────────────────────────
        const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)/)
        if (headingMatch) {
            nodes.push(
                <p key={i} className="text-[11px] font-semibold text-neutral-800 uppercase tracking-widest mt-3 mb-1">
                    {headingMatch[2]}
                </p>
            )
            i++
            continue
        }

        // ── Ordered list: "1. item" ───────────────────────────────
        const orderedMatch = trimmed.match(/^(\d+)\.\s+(.+)/)
        if (orderedMatch) {
            const listItems: Array<{ num: string; content: string }> = []
            while (i < lines.length) {
                const t = lines[i].trim()
                const m = t.match(/^(\d+)\.\s+(.+)/)
                if (m) {
                    listItems.push({ num: m[1], content: m[2] })
                    i++
                } else if (t === '') {
                    i++
                    break
                } else {
                    break
                }
            }

            nodes.push(
                <ol key={`ol-${i}`} className="space-y-2 my-2">
                    {listItems.map((li, idx) => (
                        <li key={idx} className="flex gap-2.5">
                            {/* Nomor */}
                            <span className="shrink-0 w-5 h-5 rounded bg-neutral-200 border border-neutral-700 text-[10px] font-mono font-bold text-neutral-900 flex items-center justify-center mt-0.5">
                                {li.num}
                            </span>
                            {/* Konten */}
                            <span className="text-[12px] text-neutral-800 leading-relaxed">
                                {parseInline(li.content)}
                            </span>
                        </li>
                    ))}
                </ol>
            )
            continue
        }

        // ── Unordered list: "- " or "* " ─────────────────────────
        const unorderedMatch = trimmed.match(/^[-*]\s+(.+)/)
        if (unorderedMatch) {
            const listItems: string[] = []
            while (i < lines.length) {
                const t = lines[i].trim()
                const m = t.match(/^[-*]\s+(.+)/)
                if (m) {
                    listItems.push(m[1])
                    i++
                } else if (t === '') {
                    i++
                    break
                } else {
                    break
                }
            }

            nodes.push(
                <ul key={`ul-${i}`} className="space-y-1.5 my-2">
                    {listItems.map((content, idx) => (
                        <li key={idx} className="flex gap-2.5 items-start">
                            {/* Dot */}
                            <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-neutral-600 mt-1.5" />
                            <span className="text-[12px] text-neutral-900 leading-relaxed">
                                {parseInline(content)}
                            </span>
                        </li>
                    ))}
                </ul>
            )
            continue
        }

        // ── Paragraph biasa ──────────────────────────────────────
        nodes.push(
            <p key={i} className="text-[12px] text-neutral-900 leading-relaxed">
                {parseInline(trimmed)}
            </p>
        )
        i++
    }

    return <div className="space-y-1">{nodes}</div>
}
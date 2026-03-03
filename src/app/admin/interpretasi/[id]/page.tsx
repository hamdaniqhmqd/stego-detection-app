// app/admin/interpretasi/[id]/page.tsx
'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayoutAdmins from '@/components/Layouts/DashboardLayoutAdmins'
import { AIInterpretationText } from '@/components/Ui/AIInterpretationFormatter'
import { Tooltip } from '@/components/Ui/ToolTip'
import { useInterpretasiDetail } from '@/hooks/useInterpretasiDetail'
import { TEKNIK_LABEL, type TeknikArah, type Channel } from '@/types/shared'
import {
    buildTeknikStatusMap,
    makeTeknikKey,
    type StatusAncaman,
    type TeknikStatusMap,
} from '@/hooks/useInterpretasiAI'
import { CH_STYLE, CHANNEL_COLOR, STATUS_COLOR, STATUS_DOT } from '@/utils/Channel'
import type { User } from '@/types/Users'
import type { HasilInterpretasi, PerItemTokenUsage, TokenUsageSummary } from '@/types/analysis'

// ── Helpers ──────────────────────────────────────────────────

const fmtDate = (d?: string | null) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    })
}

function fmtTokens(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}k`
    return n.toLocaleString()
}

// ── Layout primitives ─────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <h3 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest
                pb-2 border-b border-neutral-200">
                {title}
            </h3>
            {children}
        </div>
    )
}

function Field({ label, tooltip, children }: { label: string; tooltip?: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1">
            {tooltip ? (
                <Tooltip text={tooltip}>
                    <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wide
                        cursor-default underline decoration-dotted decoration-neutral-300 w-fit">
                        {label}
                    </span>
                </Tooltip>
            ) : (
                <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wide">{label}</span>
            )}
            <div className="text-sm text-neutral-800">{children}</div>
        </div>
    )
}

function FieldGrid({ children }: { children: React.ReactNode }) {
    return <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">{children}</div>
}

// ── Skeleton ──────────────────────────────────────────────────

function SkeletonBlock({ className }: { className?: string }) {
    return <div className={`bg-neutral-100 rounded animate-pulse ${className}`} />
}

function PageSkeleton() {
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3">
                <SkeletonBlock className="w-8 h-8 rounded-sm" />
                <div className="space-y-1.5">
                    <SkeletonBlock className="w-48 h-4" />
                    <SkeletonBlock className="w-32 h-3" />
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                    <SkeletonBlock className="w-full h-24 rounded-xl" />
                    <SkeletonBlock className="w-full h-40 rounded-xl" />
                    <SkeletonBlock className="w-full h-32 rounded-xl" />
                </div>
                <div className="lg:col-span-2 space-y-4">
                    <SkeletonBlock className="w-full h-16 rounded-xl" />
                    <SkeletonBlock className="w-full h-48 rounded-xl" />
                    <SkeletonBlock className="w-full h-48 rounded-xl" />
                </div>
            </div>
        </div>
    )
}

// ── User card ─────────────────────────────────────────────────

function UserCard({ user }: { user: User }) {
    const displayName = user.fullname ?? user.username
    return (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
            <img
                src={
                    user.photo ??
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&color=fff&size=64`
                }
                alt={displayName}
                className="w-10 h-10 rounded-full object-cover shrink-0 border border-neutral-200"
            />
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-neutral-800 truncate">{displayName}</p>
                <p className="text-xs text-neutral-400 truncate">@{user.username}</p>
                <p className="text-xs text-neutral-400 truncate">{user.email}</p>
            </div>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0 cursor-default
                ${user.role === 'superadmin'
                    ? 'bg-violet-50 text-violet-700 border-violet-200'
                    : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                }`}>
                {user.role}
            </span>
        </div>
    )
}

// ── Image preview ─────────────────────────────────────────────

function ImagePreview({ src }: { src?: string | null }) {
    const [err, setErr] = useState(false)
    if (!src || err) {
        return (
            <div className="w-full h-40 rounded-sm bg-neutral-100 border border-neutral-200
                flex flex-col items-center justify-center gap-2 text-neutral-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,16V158.75l-26.07-26.06a16,16,0,0,0-22.63,0l-20,20-44-44a16,16,0,0,0-22.62,0L40,149.37V56ZM40,200V172l52-52,44,44,20-20,40,40.07L196.07,216H40A0,0,0,0,1,40,200Z" />
                </svg>
                <span className="text-xs">Gambar tidak tersedia</span>
            </div>
        )
    }
    return (
        <div className="w-full rounded-sm overflow-hidden border border-neutral-200 bg-neutral-100">
            <img src={src} alt="preview" className="w-full max-h-52 object-contain" onError={() => setErr(true)} />
        </div>
    )
}

// ── AI Summary bar ────────────────────────────────────────────

function AISummaryBar({ hasil }: { hasil: HasilInterpretasi[] }) {
    const teknikMap = buildTeknikStatusMap(hasil)
    const counts: Record<StatusAncaman, number> = { Aman: 0, Mencurigakan: 0, Berbahaya: 0 }
    for (const st of Object.values(teknikMap)) counts[st as StatusAncaman]++
    const total = Object.values(counts).reduce((a, b) => a + b, 0)
    if (total === 0) return null

    const worstStatus: StatusAncaman =
        counts.Berbahaya > 0 ? 'Berbahaya' :
            counts.Mencurigakan > 0 ? 'Mencurigakan' : 'Aman'

    const statusTooltip: Record<StatusAncaman, string> = {
        Aman: 'Semua kombinasi channel & arah dinilai tidak mengandung konten berbahaya oleh model AI',
        Mencurigakan: 'Terdapat satu atau lebih kombinasi yang mengandung pola atau konten yang perlu diperiksa lebih lanjut',
        Berbahaya: 'Terdapat satu atau lebih kombinasi yang dinilai mengandung konten berbahaya atau steganografi aktif',
    }

    return (
        <Tooltip text={statusTooltip[worstStatus]}>
            <div className={`flex items-center gap-4 px-4 py-3 rounded-sm border cursor-default ${STATUS_COLOR[worstStatus]}`}>
                <div className="flex items-center gap-2 flex-1">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[worstStatus]}`} />
                    <span className="text-xs font-semibold">Status Keseluruhan: {worstStatus}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11"
                        fill="currentColor" viewBox="0 0 256 256" className="opacity-50 shrink-0">
                        <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z" />
                    </svg>
                </div>
                <div className="flex items-center gap-3 text-xs">
                    {(['Aman', 'Mencurigakan', 'Berbahaya'] as StatusAncaman[]).map(s =>
                        counts[s] > 0 ? (
                            <span key={s} className="flex items-center gap-1 opacity-80">
                                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[s]}`} />
                                {counts[s]} {s}
                            </span>
                        ) : null
                    )}
                </div>
            </div>
        </Tooltip>
    )
}

// ── TOKEN USAGE SECTION (baru) ────────────────────────────────

/** Bar progress proporsional antar item */
function TokenBar({ value, max }: { value: number; max: number }) {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0
    const color =
        pct >= 60 ? 'bg-neutral-500' :
            pct >= 30 ? 'bg-neutral-400' : 'bg-neutral-300'

    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${color}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-[10px] font-mono text-neutral-400 w-8 text-right shrink-0">
                {pct}%
            </span>
        </div>
    )
}

function TokenUsageSection({ usage }: { usage: TokenUsageSummary }) {
    const maxPerItem = Math.max(...usage.per_item.map(p => p.total_tokens), 1)

    // Hitung berapa item yang tidak 0
    const activeItems = usage.per_item.filter(p => p.total_tokens > 0)

    return (
        <div className="space-y-4">
            {/* ── Ringkasan total (3 stat cards) ── */}
            <div className="grid grid-cols-3 gap-3">
                {/* Total keseluruhan */}
                <Tooltip text="Total seluruh token yang dikonsumsi pada sesi interpretasi ini (prompt + respons AI)">
                    <div className="relative px-4 py-3 rounded-sm border border-neutral-200 bg-neutral-50
                        hover:-translate-y-0.5 hover:shadow-[-4px_4px_0_rgba(163,163,163,1)]
                        hover:border-neutral-400 transition-all duration-150 cursor-default overflow-hidden">
                        {/* Dekoratif dot pojok */}
                        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-violet-300 opacity-60" />
                        <p className="text-[10px] font-medium text-violet-500 uppercase tracking-wide mb-1">
                            Total Token
                        </p>
                        <p className="text-xl font-mono font-bold text-violet-700 leading-none">
                            {usage.total_tokens.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-violet-400 mt-1 font-mono">
                            ≈ {fmtTokens(usage.total_tokens)}
                        </p>
                    </div>
                </Tooltip>

                {/* Prompt tokens */}
                <Tooltip text="Token yang dipakai untuk teks input (prompt) yang dikirim ke model AI, termasuk instruksi sistem dan data LSB">
                    <div className="relative px-4 py-3 rounded-sm border border-neutral-200 bg-neutral-50
                        hover:-translate-y-0.5 hover:shadow-[-4px_4px_0_rgba(163,163,163,1)]
                        hover:border-neutral-400 transition-all duration-150 cursor-default overflow-hidden">
                        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-300 opacity-60" />
                        <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide mb-1">
                            Prompt
                        </p>
                        <p className="text-xl font-mono font-bold text-neutral-800 leading-none">
                            {usage.total_prompt_tokens.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-neutral-400 mt-1 font-mono">
                            {usage.total_tokens > 0
                                ? `${Math.round((usage.total_prompt_tokens / usage.total_tokens) * 100)}% dari total`
                                : '—'
                            }
                        </p>
                    </div>
                </Tooltip>

                {/* Candidates tokens */}
                <Tooltip text="Token yang dihasilkan oleh model AI sebagai respons/interpretasi, mencerminkan panjang teks analisis yang diberikan">
                    <div className="relative px-4 py-3 rounded-sm border border-neutral-200 bg-neutral-50
                        hover:-translate-y-0.5 hover:shadow-[-4px_4px_0_rgba(163,163,163,1)]
                        hover:border-neutral-400 transition-all duration-150 cursor-default overflow-hidden">
                        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-300 opacity-60" />
                        <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide mb-1">
                            Respons AI
                        </p>
                        <p className="text-xl font-mono font-bold text-neutral-800 leading-none">
                            {usage.total_candidates_tokens.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-neutral-400 mt-1 font-mono">
                            {usage.total_tokens > 0
                                ? `${Math.round((usage.total_candidates_tokens / usage.total_tokens) * 100)}% dari total`
                                : '—'
                            }
                        </p>
                    </div>
                </Tooltip>
            </div>

            {/* ── Detail per-item ── */}
            {activeItems.length > 0 && (
                <div className="space-y-1">
                    <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-wide mb-2">
                        Rincian per Kombinasi ({activeItems.length} request)
                    </p>
                    <div className="divide-y divide-neutral-100 rounded-sm border border-neutral-200 overflow-hidden">
                        {usage.per_item.map((item, i) => (
                            <div key={i} className={`px-3 py-2.5 ${item.total_tokens === 0 ? 'opacity-40 bg-neutral-50' : 'bg-white'}`}>
                                {/* Baris atas: channel, arah, total token */}
                                <div className="flex items-center gap-2 mb-1.5">
                                    {/* Channel pill */}
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border leading-none shrink-0
                                        ${item.channel === 'R' ? 'bg-red-100 text-red-600 border-red-200 ring-1 ring-red-200' :
                                            item.channel === 'G' ? 'bg-emerald-100 text-emerald-600 border-emerald-200 ring-1 ring-emerald-200' :
                                                'bg-blue-100 text-blue-600 border-blue-200 ring-1 ring-blue-200'}`}>
                                        {item.channel}
                                    </span>

                                    {/* Arah */}
                                    <span className="text-[11px] text-neutral-600 font-medium truncate flex-1 min-w-0">
                                        {TEKNIK_LABEL[item.arah as TeknikArah] ?? item.arah}
                                    </span>

                                    {/* Total token item ini */}
                                    {item.total_tokens > 0 ? (
                                        <span className="text-[11px] font-mono font-semibold text-neutral-700 shrink-0">
                                            {item.total_tokens.toLocaleString()}
                                            <span className="text-[9px] font-normal text-neutral-400 ml-0.5">tok</span>
                                        </span>
                                    ) : (
                                        <span className="text-[10px] text-neutral-300 italic shrink-0">
                                            Dilewati
                                        </span>
                                    )}
                                </div>

                                {/* Bar proporsional */}
                                {item.total_tokens > 0 && (
                                    <TokenBar value={item.total_tokens} max={maxPerItem} />
                                )}

                                {/* Breakdown prompt / candidates */}
                                {item.total_tokens > 0 && (
                                    <div className="flex items-center gap-4 mt-1.5 text-[10px] text-neutral-400 font-mono">
                                        <span className="flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-300 shrink-0" />
                                            Prompt: {item.prompt_tokens.toLocaleString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 shrink-0" />
                                            Respons: {item.candidates_tokens.toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

// ── AI Interpretation block ───────────────────────────────────

function AIInterpretationBlock({ h }: { h: HasilInterpretasi }) {
    const status = h.status_ancaman as StatusAncaman

    const containerColor: Record<StatusAncaman, string> = {
        Aman: 'border-emerald-200 bg-emerald-50/60',
        Mencurigakan: 'border-amber-200 bg-amber-50/60',
        Berbahaya: 'border-red-200 bg-red-50/60',
    }
    const labelColor: Record<StatusAncaman, string> = {
        Aman: 'text-emerald-700',
        Mencurigakan: 'text-amber-700',
        Berbahaya: 'text-red-700',
    }
    const statusTooltip: Record<StatusAncaman, string> = {
        Aman: 'Model AI menilai data pada kombinasi channel & arah ini tidak mengandung pesan tersembunyi yang berbahaya',
        Mencurigakan: 'Model AI menemukan pola yang tidak biasa. Perlu pemeriksaan manual lebih lanjut untuk memastikan',
        Berbahaya: 'Model AI mendeteksi indikasi kuat adanya pesan tersembunyi (steganografi aktif) pada kombinasi ini',
    }

    return (
        <div className={`rounded-md border px-3.5 py-3 space-y-2 ${containerColor[status]}`}>
            <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11"
                    fill="currentColor" viewBox="0 0 256 256"
                    className={`shrink-0 ${labelColor[status]}`}>
                    <path d="M232,128a104,104,0,1,1-104-104A104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128ZM96,112a12,12,0,1,0-12-12A12,12,0,0,0,96,112Zm64,0a12,12,0,1,0-12-12A12,12,0,0,0,160,112Zm4.44,56.06a8,8,0,0,0-11-2.66,52.06,52.06,0,0,1-50.88,0,8,8,0,1,0-7.84,13.94,68,68,0,0,0,66.56,0A8,8,0,0,0,164.44,168.06Z" />
                </svg>
                <Tooltip text="Hasil analisis teks oleh model AI terhadap data LSB yang diekstrak dari kombinasi channel dan arah ini">
                    <span className={`text-[10px] font-semibold uppercase tracking-wide cursor-default ${labelColor[status]}`}>
                        Interpretasi AI
                    </span>
                </Tooltip>
                <Tooltip text={statusTooltip[status]}>
                    <span className={`ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full
                        text-[10px] font-medium border cursor-default ${STATUS_COLOR[status]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />
                        {status}
                    </span>
                </Tooltip>
            </div>
            <div className={`text-xs leading-relaxed ${labelColor[status]}`}>
                <AIInterpretationText text={h.interpretation} />
            </div>
        </div>
    )
}

// ── Channel sub-block ─────────────────────────────────────────

const CHANNEL_TOOLTIP: Record<string, string> = {
    R: 'Channel Merah (Red): menyimpan nilai intensitas merah setiap piksel. LSB dari channel ini yang diekstrak dan dianalisis.',
    G: 'Channel Hijau (Green): menyimpan nilai intensitas hijau setiap piksel. Channel paling sensitif terhadap mata manusia.',
    B: 'Channel Biru (Blue): menyimpan nilai intensitas biru setiap piksel. Sering digunakan sebagai media steganografi karena perubahan tidak mudah terdeteksi.',
}

function ChannelBlock({
    ch, h, arah, perItemUsage,
}: {
    ch: Channel
    h?: HasilInterpretasi
    arah: TeknikArah
    perItemUsage?: PerItemTokenUsage
}) {
    const chStyle = CH_STYLE[ch]
    const status = h?.status_ancaman as StatusAncaman | undefined

    return (
        <div className="rounded-sm border border-neutral-200 bg-neutral-50">
            {/* Channel header */}
            <div className={`flex items-center justify-between px-3.5 py-2.5 border-b rounded-t-sm ${chStyle.header} bg-neutral-50`}>
                <Tooltip text={CHANNEL_TOOLTIP[ch] ?? `Channel ${ch}`}>
                    <div className="flex items-center gap-2 cursor-default">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${chStyle.dot}`} />
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${chStyle.pill}`}>
                            CH-{ch}
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11"
                            fill="currentColor" viewBox="0 0 256 256" className="opacity-40">
                            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z" />
                        </svg>
                    </div>
                </Tooltip>

                <div className="flex items-center gap-2 shrink-0">
                    {/* Token usage per channel (jika ada) */}
                    {perItemUsage && perItemUsage.total_tokens > 0 && (
                        <Tooltip text={`Token dipakai: ${perItemUsage.prompt_tokens.toLocaleString()} prompt + ${perItemUsage.candidates_tokens.toLocaleString()} respons`}>
                            <span className="flex items-center gap-1 text-[10px] font-mono
                                text-violet-600 bg-violet-50 border border-violet-200
                                px-1.5 py-0.5 rounded cursor-default">
                                <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9"
                                    fill="currentColor" viewBox="0 0 256 256" className="shrink-0">
                                    <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z" />
                                </svg>
                                {perItemUsage.total_tokens.toLocaleString()} tok
                            </span>
                        </Tooltip>
                    )}

                    {status ? (
                        <Tooltip text={`Hasil penilaian AI untuk channel ${ch} dengan arah "${TEKNIK_LABEL[arah]}"`}>
                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]
                                font-medium border cursor-default ${STATUS_COLOR[status]}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />
                                {status}
                            </span>
                        </Tooltip>
                    ) : (
                        <Tooltip text="Kombinasi channel dan arah ini tidak memiliki data interpretasi dari model AI">
                            <span className="text-[10px] text-neutral-300 italic cursor-default">Belum diinterpretasi</span>
                        </Tooltip>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className="p-3.5">
                {h ? (
                    <AIInterpretationBlock h={h} />
                ) : (
                    <div className="rounded-md border border-dashed border-neutral-200
                        px-3 py-2 flex items-center gap-2 text-neutral-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11"
                            fill="currentColor" viewBox="0 0 256 256" className="shrink-0">
                            <path d="M232,128a104,104,0,1,1-104-104A104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128ZM96,112a12,12,0,1,0-12-12A12,12,0,0,0,96,112Zm64,0a12,12,0,1,0-12-12A12,12,0,0,0,160,112Zm4.44,56.06a8,8,0,0,0-11-2.66,52.06,52.06,0,0,1-50.88,0,8,8,0,1,0-7.84,13.94,68,68,0,0,0,66.56,0A8,8,0,0,0,164.44,168.06Z" />
                        </svg>
                        <span className="text-[10px] italic">Channel ini belum diinterpretasi AI</span>
                    </div>
                )}
            </div>
        </div>
    )
}

// ── Teknik accordion block ────────────────────────────────────

interface TeknikAccordionProps {
    arah: TeknikArah
    channels: Channel[]
    hasilAI: HasilInterpretasi[]
    teknikMap: TeknikStatusMap
    index: number
    tokenUsage?: TokenUsageSummary | null
}

const ARAH_TOOLTIP: Record<TeknikArah, string> = {
    'kiri-kanan-atas-bawah': 'Piksel dibaca dari kiri ke kanan, baris demi baris dari atas ke bawah. Pola paling umum digunakan dalam steganografi LSB.',
    'kanan-kiri-bawah-atas': 'Piksel dibaca dari kanan ke kiri, baris demi baris dari bawah ke atas. Kebalikan dari pola standar.',
    'atas-bawah-kiri-kanan': 'Piksel dibaca dari atas ke bawah, kolom demi kolom dari kiri ke kanan. Pola vertikal.',
    'bawah-atas-kanan-kiri': 'Piksel dibaca dari bawah ke atas, kolom demi kolom dari kanan ke kiri. Pola vertikal terbalik.',
}

function TeknikAccordion({ arah, channels, hasilAI, teknikMap, index, tokenUsage }: TeknikAccordionProps) {
    const [open, setOpen] = useState(true)

    const SEV: Record<StatusAncaman, number> = { Aman: 0, Mencurigakan: 1, Berbahaya: 2 }
    let worstStatus: StatusAncaman | undefined
    for (const ch of channels) {
        const st = teknikMap[makeTeknikKey(ch, arah)]
        if (st && (!worstStatus || SEV[st] > SEV[worstStatus])) worstStatus = st
    }

    // Jumlah token untuk teknik (arah) ini
    const arahTokens = tokenUsage?.per_item
        .filter(p => p.arah === arah)
        .reduce((sum, p) => sum + p.total_tokens, 0) ?? 0

    return (
        <div className="relative pb-1.5 pl-1.5">
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                className={`w-full relative flex items-center border border-neutral-200 rounded-sm gap-3 px-4 py-3 text-left
                    bg-neutral-50 transition-all ease-in-out duration-200
                    ${open
                        ? '-translate-y-0.5 -translate-x-0.5 shadow-[-5px_5px_0_rgba(26,26,46,1)] border-neutral-400'
                        : 'hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[-5px_5px_0_rgba(26,26,46,1)] hover:border-neutral-400'
                    }`}
            >
                <Tooltip text={`Teknik ke-${index + 1}: ekstraksi LSB dengan arah baca "${TEKNIK_LABEL[arah]}"`}>
                    <span className="text-xs font-mono font-bold text-neutral-800 shrink-0 w-5 cursor-default">
                        T{index + 1}
                    </span>
                </Tooltip>

                <svg
                    xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                    fill="currentColor" viewBox="0 0 256 256"
                    className={`text-neutral-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                >
                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
                </svg>

                <Tooltip text={ARAH_TOOLTIP[arah]}>
                    <span className="text-xs font-semibold text-neutral-800 flex-1 cursor-default">
                        {TEKNIK_LABEL[arah]}
                    </span>
                </Tooltip>

                <div className="flex gap-0.5 shrink-0">
                    {channels.map(ch => (
                        <Tooltip key={ch} text={`Channel ${ch} — ${CHANNEL_TOOLTIP[ch]?.split(':')[1]?.trim() ?? ''}`}>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border leading-none cursor-default
                                ${CHANNEL_COLOR[ch] ?? 'bg-neutral-100 text-neutral-500 border-neutral-200'}`}>
                                {ch}
                            </span>
                        </Tooltip>
                    ))}
                </div>

                <Tooltip text="Jumlah channel warna (R/G/B) yang dianalisis pada arah scan ini">
                    <span className="text-[10px] font-mono text-neutral-400 shrink-0 cursor-default">
                        {channels.length} kanal
                    </span>
                </Tooltip>

                {/* Token badge per arah */}
                {arahTokens > 0 && (
                    <Tooltip text={`Total token AI yang dikonsumsi untuk teknik arah ini: ${arahTokens.toLocaleString()} token`}>
                        <span className="flex items-center gap-1 text-[10px] font-mono
                            text-violet-600 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-sm
                            shrink-0 cursor-default">
                            <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9"
                                fill="currentColor" viewBox="0 0 256 256">
                                <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z" />
                            </svg>
                            {fmtTokens(arahTokens)}
                        </span>
                    </Tooltip>
                )}

                {worstStatus ? (
                    <Tooltip text="Status terparah dari seluruh channel pada arah ini">
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]
                            font-medium border shrink-0 cursor-default ${STATUS_COLOR[worstStatus]}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[worstStatus]}`} />
                            {worstStatus}
                        </span>
                    </Tooltip>
                ) : (
                    <Tooltip text="Belum ada hasil interpretasi AI untuk teknik ini">
                        <span className="text-[10px] text-neutral-300 italic shrink-0 cursor-default">
                            Belum diinterpretasi
                        </span>
                    </Tooltip>
                )}
            </button>

            {open && (
                <div className="divide-y divide-neutral-100">
                    {channels.map(ch => {
                        const h = hasilAI.find(x => x.channel === ch && x.arah === arah)
                        const perItemUsage = tokenUsage?.per_item.find(
                            p => p.channel === ch && p.arah === arah
                        )
                        return (
                            <div key={ch} className="py-3">
                                <ChannelBlock ch={ch} h={h} arah={arah} perItemUsage={perItemUsage} />
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

// ── Hasil interpretasi section ────────────────────────────────

function HasilInterpretasiSection({
    hasilAI,
    teknikByArah,
    teknikMap,
    waktuProses,
    tokenUsage,
}: {
    hasilAI: HasilInterpretasi[]
    teknikByArah: Map<TeknikArah, Channel[]>
    teknikMap: TeknikStatusMap
    waktuProses?: string | null
    tokenUsage?: TokenUsageSummary | null
}) {
    const totalKombinasi = hasilAI.length

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3
                px-5 py-4 rounded-sm bg-neutral-50 border border-neutral-200">
                <div className="flex-1">
                    <h2 className="text-sm font-semibold text-neutral-900">Hasil Interpretasi AI</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                        <Tooltip text="Jumlah pasangan channel × arah yang berhasil diinterpretasi oleh model AI">
                            <span className="cursor-default underline decoration-dotted decoration-neutral-300">
                                {totalKombinasi} kombinasi kanal
                            </span>
                        </Tooltip>
                        {' '}&nbsp;·&nbsp;Metode:{' '}
                        <Tooltip text="Proses analisis teks menggunakan Large Language Model (LLM) untuk menilai apakah data LSB mengandung pesan tersembunyi">
                            <span className="font-semibold text-neutral-800 cursor-default underline decoration-dotted decoration-neutral-400">
                                interpretasi-ai
                            </span>
                        </Tooltip>
                        {waktuProses && (
                            <>
                                {' '}&nbsp;·&nbsp;
                                <Tooltip text="Total waktu yang dibutuhkan model AI untuk memproses seluruh kombinasi channel dan arah">
                                    <span className="cursor-default underline decoration-dotted decoration-neutral-300">
                                        {waktuProses}
                                    </span>
                                </Tooltip>
                            </>
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Tooltip text="Jumlah total pasangan channel × arah yang diinterpretasi oleh model AI dalam satu sesi ini">
                        <div className="px-3 py-1.5 rounded-sm bg-neutral-50 border border-neutral-200 text-center cursor-default
                            transition-all duration-150
                            hover:-translate-y-0.5 hover:shadow-[-3px_3px_0_rgba(163,163,163,1)] hover:border-neutral-400">
                            <p className="text-xs font-mono font-bold text-neutral-800">{totalKombinasi}</p>
                            <p className="text-[9px] text-neutral-600 uppercase tracking-wide">kombinasi</p>
                        </div>
                    </Tooltip>
                    <Tooltip text="Jumlah arah baca piksel yang digunakan">
                        <div className="px-3 py-1.5 rounded-sm bg-neutral-50 border border-neutral-200 text-center cursor-default
                            transition-all duration-150
                            hover:-translate-y-0.5 hover:shadow-[-3px_3px_0_rgba(163,163,163,1)] hover:border-neutral-400">
                            <p className="text-xs font-mono font-bold text-neutral-800">{teknikByArah.size}</p>
                            <p className="text-[9px] text-neutral-600 uppercase tracking-wide">arah scan</p>
                        </div>
                    </Tooltip>
                    {/* Total token ringkas di header */}
                    {tokenUsage && (
                        <Tooltip text={`Total seluruh token Gemini API yang dikonsumsi: ${tokenUsage.total_tokens.toLocaleString()} token`}>
                            <div className="px-3 py-1.5 rounded-sm bg-violet-50 border border-violet-200 text-center cursor-default
                                transition-all duration-150
                                hover:-translate-y-0.5 hover:shadow-[-3px_3px_0_rgba(139,92,246,0.3)] hover:border-violet-400">
                                <p className="text-xs font-mono font-bold text-violet-700">
                                    {fmtTokens(tokenUsage.total_tokens)}
                                </p>
                                <p className="text-[9px] text-violet-500 uppercase tracking-wide">token</p>
                            </div>
                        </Tooltip>
                    )}
                </div>
            </div>

            <div className="space-y-4 py-2">
                {[...teknikByArah.entries()].map(([arah, channels], i) => (
                    <TeknikAccordion
                        key={arah}
                        index={i}
                        arah={arah}
                        channels={channels}
                        hasilAI={hasilAI}
                        teknikMap={teknikMap}
                        tokenUsage={tokenUsage}
                    />
                ))}
                {teknikByArah.size === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 gap-2 text-neutral-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"
                            fill="currentColor" viewBox="0 0 256 256">
                            <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z" />
                        </svg>
                        <p className="text-sm">Belum ada hasil interpretasi</p>
                    </div>
                )}
            </div>
        </div>
    )
}

// ── Page ──────────────────────────────────────────────────────

interface PageProps {
    params: Promise<{ id: string }>
}

export default function InterpretasiDetailPage({ params }: PageProps) {
    const { id } = use(params)
    const router = useRouter()
    const { result, isLoading, error, refresh } = useInterpretasiDetail(id)

    if (isLoading) {
        return (
            <DashboardLayoutAdmins>
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                    <PageSkeleton />
                </div>
            </DashboardLayoutAdmins>
        )
    }

    if (error || !result) {
        return (
            <DashboardLayoutAdmins>
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                    <div className="flex flex-col items-center justify-center py-24 gap-4 text-neutral-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M236.8,188.09,149.35,36.22a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM120,104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm8,88a12,12,0,1,1,12-12A12,12,0,0,1,128,192Z" />
                        </svg>
                        <p className="text-sm font-medium">
                            {error ?? 'Data interpretasi tidak ditemukan'}
                        </p>
                        <button
                            onClick={() => router.back()}
                            className="text-xs px-4 py-2 rounded-sm border border-neutral-200
                                hover:bg-neutral-50 transition-colors text-neutral-600"
                        >
                            ← Kembali
                        </button>
                    </div>
                </div>
            </DashboardLayoutAdmins>
        )
    }

    const { interpretasi, analysis, forceDecode, user } = result
    const hasilAI: HasilInterpretasi[] = interpretasi.hasil ?? []
    const teknikMap: TeknikStatusMap = buildTeknikStatusMap(hasilAI)
    const tokenUsage = interpretasi.token_usage ?? null

    const teknikByArah = new Map<TeknikArah, Channel[]>()
    for (const t of (analysis?.teknik ?? [])) {
        const existing = teknikByArah.get(t.arah)
        if (existing) { if (!existing.includes(t.channel)) existing.push(t.channel) }
        else teknikByArah.set(t.arah, [t.channel])
    }
    if (teknikByArah.size === 0) {
        for (const h of hasilAI) {
            const existing = teknikByArah.get(h.arah as TeknikArah)
            if (existing) { if (!existing.includes(h.channel as Channel)) existing.push(h.channel as Channel) }
            else teknikByArah.set(h.arah as TeknikArah, [h.channel as Channel])
        }
    }

    return (
        <DashboardLayoutAdmins>
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">

                {/* ── Page header ── */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="w-8 h-8 shrink-0 rounded-sm border border-neutral-200
                                flex items-center justify-center text-neutral-500
                                hover:bg-neutral-50 hover:text-neutral-800 transition-all duration-150
                                hover:shadow-[-3px_3px_0_rgba(163,163,163,1)]
                                hover:border-neutral-400 hover:-translate-y-0.5"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
                                <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
                            </svg>
                        </button>
                        <div>
                            <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-neutral-500">
                                <span>Interpretasi AI</span>
                                <span className="text-neutral-300">/</span>
                                <span className="text-neutral-800">Detail</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {interpretasi.deleted_at && (
                            <Tooltip text={`Record ini telah diarsipkan pada ${fmtDate(interpretasi.deleted_at)}.`}>
                                <span className="text-xs px-2.5 py-1 rounded-sm bg-red-50 text-red-600
                                    border border-red-200 font-medium cursor-default">
                                    Diarsipkan
                                </span>
                            </Tooltip>
                        )}
                        <Tooltip text="Muat ulang data interpretasi dari server">
                            <button
                                onClick={refresh}
                                className="w-8 h-8 rounded-sm border border-neutral-200 flex items-center justify-center
                                    text-neutral-500 hover:bg-neutral-50 transition-all duration-150
                                    hover:shadow-[-3px_3px_0_rgba(163,163,163,1)]
                                    hover:border-neutral-400 hover:-translate-y-0.5"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
                                    <path d="M228,48V96a12,12,0,0,1-12,12H168a12,12,0,0,1,0-24h19l-7.8-7.8a75.55,75.55,0,0,0-53.32-22.26h-.43A75.49,75.49,0,0,0,72.39,75.57,12,12,0,1,1,55.61,58.41a99.38,99.38,0,0,1,69.87-28.47H126A99.42,99.42,0,0,1,196.2,59.23L204,67V48a12,12,0,0,1,24,0ZM183.61,180.43a75.49,75.49,0,0,1-53.09,21.63h-.43A75.55,75.55,0,0,1,76.77,179.8L69,172H88a12,12,0,0,0,0-24H40a12,12,0,0,0-12,12v48a12,12,0,0,0,24,0V189l7.8,7.8A99.42,99.42,0,0,0,130,226.06h.56a99.38,99.38,0,0,0,69.87-28.47,12,12,0,0,0-16.78-17.16Z" />
                                </svg>
                            </button>
                        </Tooltip>
                    </div>
                </div>

                {/* ── AI Summary bar ── */}
                {hasilAI.length > 0 && <AISummaryBar hasil={hasilAI} />}

                {/* ── Main layout ── */}
                <div className="grid grid-cols-1 gap-6 items-start">
                    <section className="space-y-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-5">
                            <Section title="Pengguna">
                                {user ? (
                                    <UserCard user={user} />
                                ) : (
                                    <p className="text-xs text-neutral-400 italic px-1">
                                        Data pengguna tidak ditemukan
                                    </p>
                                )}
                            </Section>

                            <Section title="File Analisis">
                                <ImagePreview src={analysis?.file_path} />
                                {analysis?.file_path && (
                                    <Tooltip text={`Path lengkap: ${analysis.file_path}`}>
                                        <p className="text-[10px] text-neutral-400 font-mono truncate mt-1 px-0.5 cursor-default">
                                            {analysis.file_path.split('/').pop()}
                                        </p>
                                    </Tooltip>
                                )}
                            </Section>
                        </div>

                        <div className="space-y-5">
                            {analysis && (
                                <Section title="Info Analisis">
                                    <FieldGrid>
                                        <Field label="Metode" tooltip="Metode steganografi yang digunakan">
                                            <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700
                                                rounded font-mono text-xs inline-block">
                                                {analysis.metode ?? '—'}
                                            </span>
                                        </Field>
                                        <Field label="Waktu proses" tooltip="Durasi total proses analisis awal gambar">
                                            <span className="font-mono text-xs">{analysis.waktu_proses ?? '—'}</span>
                                        </Field>
                                        <Field label="Dibuat" tooltip="Waktu ketika record analisis ini pertama kali dibuat">
                                            <span className="text-xs">{fmtDate(analysis.created_at)}</span>
                                        </Field>
                                    </FieldGrid>
                                </Section>
                            )}

                            {forceDecode && (
                                <Section title="Force Decode">
                                    <FieldGrid>
                                        <Field label="Durasi" tooltip="Waktu untuk menyelesaikan proses force decode">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1
                                                rounded-sm border border-neutral-200 bg-neutral-50
                                                text-neutral-900 text-xs font-mono font-semibold">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"
                                                    fill="currentColor" viewBox="0 0 256 256" className="opacity-60">
                                                    <path d="M128,40a96,96,0,1,0,96,96A96.11,96.11,0,0,0,128,40Zm0,176a80,80,0,1,1,80-80A80.09,80.09,0,0,1,128,216ZM173.66,90.34a8,8,0,0,1,0,11.32l-40,40a8,8,0,0,1-11.32-11.32l40-40A8,8,0,0,1,173.66,90.34ZM96,16a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H104A8,8,0,0,1,96,16Z" />
                                                </svg>
                                                {forceDecode.waktu_proses ?? '—'}
                                            </span>
                                        </Field>
                                        <Field label="Dijalankan" tooltip="Waktu ketika proses force decode dijalankan">
                                            <span className="text-xs">{fmtDate(forceDecode.created_at)}</span>
                                        </Field>
                                    </FieldGrid>
                                </Section>
                            )}

                            {/* Info Interpretasi — ditambah ringkasan token */}
                            <Section title="Info Interpretasi">
                                <FieldGrid>
                                    <Field
                                        label="Durasi AI"
                                        tooltip="Waktu yang dibutuhkan model AI untuk menganalisis seluruh data LSB"
                                    >
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1
                                            rounded-sm border border-neutral-200 bg-neutral-50
                                            text-neutral-900 text-xs font-mono font-semibold">
                                            {interpretasi.waktu_proses ?? '—'}
                                        </span>
                                    </Field>
                                    <Field
                                        label="Total Hasil"
                                        tooltip="Jumlah kombinasi channel × arah yang berhasil diinterpretasi"
                                    >
                                        <span className="text-xs font-semibold text-neutral-700">
                                            {hasilAI.length} kombinasi
                                        </span>
                                    </Field>
                                    <Field
                                        label="Dibuat"
                                        tooltip="Waktu ketika sesi interpretasi AI ini pertama kali dijalankan"
                                    >
                                        <span className="text-xs">{fmtDate(interpretasi.created_at)}</span>
                                    </Field>

                                    {/* ── Ringkasan token (field baru) ── */}
                                    {tokenUsage && (
                                        <>
                                            <Field
                                                label="Token API"
                                                tooltip="Nama token Gemini API yang dipakai pada sesi interpretasi ini"
                                            >
                                                <span className="inline-flex items-center gap-1 text-xs text-violet-700 font-medium">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11"
                                                        fill="currentColor" viewBox="0 0 256 256"
                                                        className="text-violet-400 shrink-0">
                                                        <path d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208Z" />
                                                    </svg>
                                                    {tokenUsage.gemini_token_label}
                                                </span>
                                            </Field>
                                            <Field
                                                label="Total Token"
                                                tooltip="Total token Gemini API yang dikonsumsi pada sesi ini (prompt + respons AI)"
                                            >
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1
                                                    rounded-sm border border-violet-200 bg-violet-50
                                                    text-violet-800 text-xs font-mono font-bold">
                                                    {tokenUsage.total_tokens.toLocaleString()}
                                                    <span className="text-violet-400 font-normal text-[10px]">tok</span>
                                                </span>
                                            </Field>
                                            <Field
                                                label="Prompt / Respons"
                                                tooltip="Breakdown token: berapa yang dipakai untuk prompt input dan berapa yang dihasilkan sebagai respons AI"
                                            >
                                                <span className="text-xs font-mono text-neutral-600">
                                                    {tokenUsage.total_prompt_tokens.toLocaleString()}
                                                    <span className="text-neutral-400 mx-1">/</span>
                                                    {tokenUsage.total_candidates_tokens.toLocaleString()}
                                                </span>
                                            </Field>
                                        </>
                                    )}
                                </FieldGrid>
                            </Section>
                        </div>
                    </section>

                    {/* ── Section Token Usage (baru, full-width) ── */}
                    {tokenUsage && (
                        <Section title="Rincian Pemakaian Token">
                            <TokenUsageSection usage={tokenUsage} />
                        </Section>
                    )}

                    {/* ── Konten utama: hasil interpretasi ── */}
                    <main className="">
                        <HasilInterpretasiSection
                            hasilAI={hasilAI}
                            teknikByArah={teknikByArah}
                            teknikMap={teknikMap}
                            waktuProses={interpretasi.waktu_proses}
                            tokenUsage={tokenUsage}
                        />
                    </main>
                </div>
            </div>
        </DashboardLayoutAdmins>
    )
}
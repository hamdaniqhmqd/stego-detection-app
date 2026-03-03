// src/components/Modal/ModalDetailAnalisis.tsx
'use client'

import { useEffect, useState } from 'react'
import {
    buildTeknikStatusMap,
    makeTeknikKey,
    type StatusAncaman,
    type TeknikStatusMap,
} from '@/hooks/useInterpretasiAI'
import type { Analysis, AnalysisForceDecode, AnalysisInterpretasiAI } from '@/types/analysis'
import type { DecodedBitItem, DecodedRawItem } from '@/types/shared'
import { TEKNIK_LABEL, type TeknikArah } from '@/types/shared'
import ModalShell, { Field, FieldGrid, fmtDate, Section, StatusBadge } from './DetailModals'
import { CHANNEL_COLOR, STATUS_DOT, STATUS_COLOR, CH_STYLE } from '@/utils/Channel'
import type { User } from '@/types/Users'
import supabaseAnonKey from '@/libs/supabase/anon_key'

// ── Props ─────────────────────────────────────────────────────
interface ModalDetailAnalisisProps {
    analysis: Analysis | null
    forceDecode: AnalysisForceDecode | null
    aiData?: AnalysisInterpretasiAI
    open: boolean
    onClose: () => void
}

// ── Helpers ───────────────────────────────────────────────────

/** Truncate long binary string with remainder count */
function truncateBin(bin: string, maxLen = 96): string {
    if (bin.length <= maxLen) return bin
    return bin.slice(0, maxLen) + ` …(+${bin.length - maxLen} bit)`
}

/** Truncate long text with ellipsis */
function truncateText(text: string, maxLen = 120): string {
    if (text.length <= maxLen) return text
    return text.slice(0, maxLen) + `…`
}

// ── Sub-components ────────────────────────────────────────────

function UserCard({ user }: { user: User | null | undefined }) {
    // undefined = loading, null = not found
    if (user === undefined) {
        return (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50
                border border-neutral-100 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-neutral-200 shrink-0" />
                <div className="space-y-1.5 flex-1">
                    <div className="h-3 w-28 bg-neutral-200 rounded" />
                    <div className="h-2.5 w-20 bg-neutral-100 rounded" />
                </div>
            </div>
        )
    }
    if (!user) {
        return (
            <div className="px-3 py-2.5 rounded-xl bg-neutral-50 border border-neutral-100
                text-xs text-neutral-400">
                Data pengguna tidak ditemukan
            </div>
        )
    }
    const displayName = user.fullname ?? user.username
    return (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50
            border border-neutral-100">
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
            </div>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0
                ${user.role === 'superadmin'
                    ? 'bg-violet-50 text-violet-700 border-violet-200'
                    : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                }`}>
                {user.role}
            </span>
        </div>
    )
}

function ImagePreview({ src }: { src?: string }) {
    const [err, setErr] = useState(false)
    if (!src || err) {
        return (
            <div className="w-full h-48 rounded-xl bg-neutral-100 border border-neutral-200
                flex flex-col items-center justify-center gap-2 text-neutral-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"
                    fill="currentColor" viewBox="0 0 256 256">
                    <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,16V158.75l-26.07-26.06a16,16,0,0,0-22.63,0l-20,20-44-44a16,16,0,0,0-22.62,0L40,149.37V56ZM40,200V172l52-52,44,44,20-20,40,40.07L196.07,216H40A0,0,0,0,1,40,200Z" />
                </svg>
                <span className="text-xs">Gambar tidak tersedia</span>
            </div>
        )
    }
    return (
        <div className="w-full rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100">
            <img
                src={src}
                alt="preview"
                className="w-full max-h-64 object-contain"
                onError={() => setErr(true)}
            />
        </div>
    )
}

// ── Accordion item: satu arah scan → sub-rows per channel ─────

interface TeknikAccordionItemProps {
    arah: TeknikArah
    channels: string[]
    teknikMap: TeknikStatusMap
    decodedRaw: DecodedRawItem[]
    decodedBit: DecodedBitItem[]
    hasAI: boolean
}

function TeknikAccordionItem({
    arah,
    channels,
    teknikMap,
    decodedRaw,
    decodedBit,
    hasAI,
}: TeknikAccordionItemProps) {
    const [open, setOpen] = useState(true)

    // Worst status across all channels for this arah
    const SEV: Record<StatusAncaman, number> = { Aman: 0, Mencurigakan: 1, Berbahaya: 2 }
    let worstStatus: StatusAncaman | undefined
    for (const ch of channels) {
        const st = teknikMap[makeTeknikKey(ch, arah)]
        if (st && (!worstStatus || SEV[st] > SEV[worstStatus])) worstStatus = st
    }

    return (
        <div className="rounded-xl border border-neutral-100 overflow-hidden">

            {/* ── Accordion header ── */}
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5
                    bg-neutral-50 hover:bg-neutral-100/80 transition-colors text-left"
            >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {/* Chevron */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                        fill="currentColor" viewBox="0 0 256 256"
                        className={`text-neutral-400 shrink-0 transition-transform duration-200
                            ${open ? 'rotate-180' : ''}`}
                    >
                        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
                    </svg>

                    {/* Arah label — from TEKNIK_LABEL record */}
                    <span className="text-xs font-semibold text-neutral-700 truncate">
                        {TEKNIK_LABEL[arah]}
                    </span>

                    {/* Channel pills */}
                    <div className="flex gap-0.5 shrink-0">
                        {channels.map(ch => (
                            <span
                                key={ch}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold border leading-none
                                    ${CHANNEL_COLOR[ch] ?? 'bg-neutral-100 text-neutral-500 border-neutral-200'}`}
                            >
                                {ch}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Worst status badge */}
                {worstStatus ? (
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full
                        text-[10px] font-medium border shrink-0 ${STATUS_COLOR[worstStatus]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[worstStatus]}`} />
                        {worstStatus}
                    </span>
                ) : hasAI ? (
                    <span className="text-[10px] text-neutral-300 italic shrink-0">
                        Belum diinterpretasi
                    </span>
                ) : null}
            </button>

            {/* ── Channel sub-rows ── */}
            {open && (
                <div className="divide-y divide-neutral-100">
                    {channels.map(ch => {
                        const status = teknikMap[makeTeknikKey(ch, arah)]
                        // DecodedRawItem: { channel, arah, text: string, base64_encoded?: boolean, printable_ratio: number, total_chars: number }
                        const rawItem = decodedRaw.find(r => r.channel === ch && r.arah === arah)
                        // DecodedBitItem: { channel, arah, bits: string, total_bits: number }
                        const bitItem = decodedBit.find(b => b.channel === ch && b.arah === arah)
                        const chStyle = CH_STYLE[ch as keyof typeof CH_STYLE]

                        return (
                            <div key={ch} className="px-4 py-3 bg-white space-y-2.5">

                                {/* Channel label + AI status */}
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full shrink-0
                                            ${chStyle?.dot ?? 'bg-neutral-400'}`}
                                        />
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border
                                            ${CHANNEL_COLOR[ch] ?? 'bg-neutral-100 text-neutral-500 border-neutral-200'}`}>
                                            Channel {ch}
                                        </span>
                                    </div>
                                    {status ? (
                                        <StatusBadge status={status} />
                                    ) : hasAI ? (
                                        <span className="text-[10px] text-neutral-300 italic">
                                            Belum diinterpretasi
                                        </span>
                                    ) : null}
                                </div>

                                {/* Decoded data */}
                                {(bitItem || rawItem) ? (
                                    <div className="ml-4 space-y-2">

                                        {/* Bit LSB — bits: string, total_bits: number */}
                                        {bitItem && bitItem.bits.length > 0 && (
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">
                                                        Bit LSB
                                                    </span>
                                                    <span className="text-[10px] font-mono text-neutral-400">
                                                        {bitItem.total_bits.toLocaleString()} bit
                                                    </span>
                                                </div>
                                                <div className="px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800">
                                                    <code className="text-[10px] font-mono text-emerald-400 break-all leading-relaxed">
                                                        {truncateBin(bitItem.bits)}
                                                    </code>
                                                </div>
                                            </div>
                                        )}

                                        {/* Raw Text — text: string, base64_encoded?: boolean (flag only), printable_ratio: number, total_chars: number */}
                                        {rawItem && (
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">
                                                            Raw Text
                                                        </span>
                                                        {rawItem.base64_encoded && (
                                                            <span className="px-1 py-0.5 rounded text-[9px] font-semibold leading-none
                                                                bg-violet-50 text-violet-600 border border-violet-200">
                                                                base64
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] font-mono text-neutral-400 shrink-0">
                                                        {rawItem.total_chars.toLocaleString()} char
                                                    </span>
                                                </div>
                                                <div className="px-2.5 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200">
                                                    <code className="text-[10px] font-mono text-neutral-700 break-all
                                                        leading-relaxed whitespace-pre-wrap">
                                                        {truncateText(rawItem.text)}
                                                    </code>
                                                </div>
                                                {/* Printable ratio bar */}
                                                <div className="flex items-center gap-2 pt-0.5">
                                                    <div className="flex-1 h-1 bg-neutral-200 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all ${rawItem.printable_ratio >= 0.7
                                                                ? 'bg-emerald-500'
                                                                : rawItem.printable_ratio >= 0.4
                                                                    ? 'bg-amber-400'
                                                                    : 'bg-red-500'
                                                                }`}
                                                            style={{ width: `${Math.round(rawItem.printable_ratio * 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className={`text-[10px] font-mono font-semibold shrink-0 ${rawItem.printable_ratio >= 0.7
                                                        ? 'text-emerald-600'
                                                        : rawItem.printable_ratio >= 0.4
                                                            ? 'text-amber-600'
                                                            : 'text-red-600'
                                                        }`}>
                                                        {Math.round(rawItem.printable_ratio * 100)}% printable
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                ) : (
                                    <p className="ml-4 text-[10px] text-neutral-300 italic">
                                        Data decode belum tersedia
                                    </p>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

// ── Main export ───────────────────────────────────────────────

export function ModalDetailAnalisis({
    analysis,
    forceDecode,
    aiData,
    open,
    onClose,
}: ModalDetailAnalisisProps) {

    // Fetch user saat modal dibuka — pola sama seperti SectionAnalisis
    const [user, setUser] = useState<User | null | undefined>(undefined)

    useEffect(() => {
        if (!open || !analysis?.user_id) return
        setUser(undefined) // reset ke loading
        supabaseAnonKey
            .from('users')
            .select('id, username, fullname, photo, email, role, is_verified, created_at, updated_at, deleted_at, verified_at')
            .eq('id', analysis.user_id)
            .single()
            .then(({ data }) => setUser((data as User) ?? null))
    }, [analysis?.user_id, open])

    if (!analysis) return null

    const teknikMap: TeknikStatusMap = aiData
        ? buildTeknikStatusMap(aiData.hasil ?? [])
        : {} as TeknikStatusMap

    const decodedRaw: DecodedRawItem[] = forceDecode?.decoded_raw ?? []
    const decodedBit: DecodedBitItem[] = forceDecode?.decoded_bit ?? []

    // Group analysis.teknik by arah → collect unique channels per arah (preserves order)
    const teknikByArah = new Map<TeknikArah, string[]>()
    for (const t of (analysis.teknik ?? [])) {
        const existing = teknikByArah.get(t.arah)
        if (existing) {
            if (!existing.includes(t.channel)) existing.push(t.channel)
        } else {
            teknikByArah.set(t.arah, [t.channel])
        }
    }

    const hasAI = analysis.interpretasi_ai
    const filename = analysis.file_path?.split('/').pop() ?? '—'

    return (
        <ModalShell
            open={open}
            onClose={onClose}
            title="Detail Analisis"
            subtitle={`ID: ${analysis.id}`}
            width="max-w-2xl"
        >
            <div className="space-y-6">

                {/* ── 1. Preview gambar ─────────────────────── */}
                <Section title="Preview Gambar">
                    <ImagePreview src={analysis.file_path} />
                    <p className="mt-1.5 text-xs text-neutral-400 font-mono truncate">
                        {filename}
                    </p>
                </Section>

                {/* ── 2. Pengguna ───────────────────────────── */}
                <Section title="Pengguna">
                    <UserCard user={user} />
                </Section>

                {/* ── 3. Informasi Analisis ─────────────────── */}
                <Section title="Informasi Analisis">
                    <FieldGrid>
                        <Field label="Metode">
                            <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded font-mono text-xs">
                                {analysis.metode ?? '—'}
                            </span>
                        </Field>
                        <Field label="Interpretasi AI">
                            {hasAI
                                ? <span className="text-emerald-600 font-medium text-xs">Aktif</span>
                                : <span className="text-neutral-400 text-xs">Tidak</span>}
                        </Field>
                        <Field label="Waktu proses">
                            <span className="font-mono text-xs">{analysis.waktu_proses ?? '—'}</span>
                        </Field>
                        <Field label="Dibuat">
                            <span className="text-xs">{fmtDate(analysis.created_at)}</span>
                        </Field>
                        {analysis.deleted_at && (
                            <Field label="Dihapus">
                                <span className="text-red-600 text-xs">{fmtDate(analysis.deleted_at)}</span>
                            </Field>
                        )}
                    </FieldGrid>
                </Section>

                {/* ── 4. Force Decode ───────────────────────── */}
                {forceDecode ? (
                    <Section title="Force Decode">
                        <FieldGrid>
                            <Field label="ID">
                                <span className="font-mono text-xs text-neutral-500 break-all">
                                    {forceDecode.id}
                                </span>
                            </Field>
                            <Field label="Durasi">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1
                                    rounded-sm border border-neutral-900 bg-neutral-50
                                    text-neutral-900 text-xs font-mono font-semibold tracking-tight">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11"
                                        fill="currentColor" viewBox="0 0 256 256" className="opacity-60">
                                        <path d="M128,40a96,96,0,1,0,96,96A96.11,96.11,0,0,0,128,40Zm0,176a80,80,0,1,1,80-80A80.09,80.09,0,0,1,128,216ZM173.66,90.34a8,8,0,0,1,0,11.32l-40,40a8,8,0,0,1-11.32-11.32l40-40A8,8,0,0,1,173.66,90.34ZM96,16a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H104A8,8,0,0,1,96,16Z" />
                                    </svg>
                                    {forceDecode.waktu_proses ?? '—'}
                                </span>
                            </Field>
                            <Field label="Dijalankan pada">
                                <span className="text-xs">{fmtDate(forceDecode.created_at)}</span>
                            </Field>
                            <Field label="Kombinasi">
                                <span className="text-xs font-semibold text-neutral-700">
                                    {decodedRaw.length} teknik
                                </span>
                            </Field>
                        </FieldGrid>
                    </Section>
                ) : (
                    <div className="px-4 py-3 rounded-xl bg-neutral-50 border border-dashed
                        border-neutral-200 text-xs text-neutral-400 text-center">
                        Force decode belum dijalankan
                    </div>
                )}

                {/* ── 5. Teknik Ekstraksi (Accordion) ──────── */}
                {teknikByArah.size > 0 && (
                    <Section title={`Teknik Ekstraksi (${teknikByArah.size} arah)`}>
                        <div className="space-y-2">
                            {[...teknikByArah.entries()].map(([arah, channels]) => (
                                <TeknikAccordionItem
                                    key={arah}
                                    arah={arah}
                                    channels={channels}
                                    teknikMap={teknikMap}
                                    decodedRaw={decodedRaw}
                                    decodedBit={decodedBit}
                                    hasAI={hasAI}
                                />
                            ))}
                        </div>
                    </Section>
                )}

                {/* ── 6. Hasil Interpretasi AI ──────────────── */}
                {aiData && (aiData.hasil ?? []).length > 0 && (
                    <Section title={`Hasil Interpretasi AI (${aiData.hasil!.length} teknik)`}>
                        <div className="space-y-2.5">
                            {aiData.hasil!.map((h, i) => (
                                <div
                                    key={i}
                                    className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 space-y-2"
                                >
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold border
                                            ${CHANNEL_COLOR[h.channel]}`}>
                                            {h.channel}
                                        </span>
                                        <span className="text-xs text-neutral-500 font-mono">
                                            {TEKNIK_LABEL[h.arah]}
                                        </span>
                                        <StatusBadge status={h.status_ancaman as StatusAncaman} />
                                    </div>
                                    <p className="text-xs text-neutral-600 leading-relaxed">
                                        {h.interpretation}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </Section>
                )}

            </div>
        </ModalShell>
    )
}
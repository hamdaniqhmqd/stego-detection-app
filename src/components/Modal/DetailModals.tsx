'use client'

// components/Dashboard/modals/DetailModals.tsx
// Modal detail untuk tabel: users, analysis, interpretasi_ai
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react'
import type { User } from '@/types/Users'
import type {
    Analysis,
    AnalysisForceDecode,
    AnalysisInterpretasiAI,
    HasilInterpretasi,
} from '@/types/analysis'
import {
    summarizeInterpretasi,
    buildTeknikStatusMap,
    makeTeknikKey,
    type StatusAncaman,
    type TeknikStatusMap,
} from '@/hooks/useInterpretasiAI'

// ─────────────────────────────────────────────────────────────
// SHARED UI ATOMS
// ─────────────────────────────────────────────────────────────

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
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm" />

            {/* Panel */}
            <div className={`relative bg-white rounded-md shadow-2xl border border-neutral-100
                w-full ${width} max-h-[90vh] flex flex-col`}>

                {/* Header */}
                <div className="flex items-start justify-between px-6 py-5
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
                <div className="overflow-y-auto flex-1 px-6 py-5">
                    {children}
                </div>
            </div>
        </div>
    )
}

// ── Reusable field row ───────────────────────────────────────

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
                {label}
            </span>
            <div className="text-sm text-neutral-800">{children}</div>
        </div>
    )
}

export function FieldGrid({ children }: { children: React.ReactNode }) {
    return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-widest
                pb-2 border-b border-neutral-100">
                {title}
            </h3>
            {children}
        </div>
    )
}

export const fmtDate = (d?: string) => d
    ? new Date(d).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    })
    : '—'

const CHANNEL_COLOR: Record<string, string> = {
    R: 'bg-red-50 text-red-700 border-red-200',
    G: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    B: 'bg-blue-50 text-blue-700 border-blue-200',
}

const STATUS_COLOR: Record<StatusAncaman, string> = {
    Aman: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Mencurigakan: 'bg-amber-50 text-amber-700 border-amber-200',
    Berbahaya: 'bg-red-50 text-red-700 border-red-200',
}

const STATUS_DOT: Record<StatusAncaman, string> = {
    Aman: 'bg-emerald-500',
    Mencurigakan: 'bg-amber-500',
    Berbahaya: 'bg-red-500',
}

export function StatusBadge({ status }: { status: StatusAncaman }) {
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5
            rounded-full text-xs font-medium border ${STATUS_COLOR[status]}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />
            {status}
        </span>
    )
}

// ─────────────────────────────────────────────────────────────
// MODAL: USER DETAIL
// ─────────────────────────────────────────────────────────────

interface ModalDetailUserProps {
    user: User | null
    open: boolean
    onClose: () => void
}

export function ModalDetailUser({ user, open, onClose }: ModalDetailUserProps) {
    if (!user) return null

    return (
        <ModalShell
            open={open}
            onClose={onClose}
            title="Detail Pengguna"
            subtitle={`ID: ${user.id}`}
        >
            <div className="space-y-6">
                {/* Avatar + nama */}
                <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl
                    border border-neutral-100">
                    <img
                        src={
                            user.photo ??
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname ?? user.username)
                            }&background=e5e7eb&color=374151&size=80`
                        }
                        alt="Avatar"
                        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    <div>
                        <p className="font-semibold text-neutral-900">
                            {user.fullname ?? user.username}
                        </p>
                        <p className="text-sm text-neutral-500">@{user.username}</p>
                        <span className={`mt-1 inline-flex px-2 py-0.5 rounded-full text-xs font-medium
                            ${user.role === 'superadmin'
                                ? 'bg-violet-50 text-violet-700'
                                : 'bg-neutral-100 text-neutral-600'
                            }`}>
                            {user.role}
                        </span>
                    </div>
                </div>

                <Section title="Informasi Akun">
                    <FieldGrid>
                        <Field label="Email">{user.email}</Field>
                        <Field label="Status">
                            {user.deleted_at ? (
                                <span className="text-red-600">Dihapus</span>
                            ) : user.is_verified ? (
                                <span className="text-emerald-600">Aktif & Terverifikasi</span>
                            ) : (
                                <span className="text-amber-600">Belum Terverifikasi</span>
                            )}
                        </Field>
                        <Field label="Bergabung">{fmtDate(user.created_at)}</Field>
                        <Field label="Terakhir diupdate">{fmtDate(user.updated_at)}</Field>
                        {user.verified_at && (
                            <Field label="Diverifikasi pada">{fmtDate(user.verified_at)}</Field>
                        )}
                        {user.deleted_at && (
                            <Field label="Dihapus pada">
                                <span className="text-red-600">{fmtDate(user.deleted_at)}</span>
                            </Field>
                        )}
                    </FieldGrid>
                </Section>
            </div>
        </ModalShell>
    )
}

interface ModalDetailAnalisisProps {
    analysis: Analysis | null
    forceDecode: AnalysisForceDecode | null
    aiData?: AnalysisInterpretasiAI
    open: boolean
    onClose: () => void
}

export function ModalDetailAnalisis({
    analysis,
    forceDecode,
    aiData,
    open,
    onClose,
}: ModalDetailAnalisisProps) {
    if (!analysis) return null

    // Build per-teknik status map jika ada AI
    const teknikMap: TeknikStatusMap = aiData
        ? buildTeknikStatusMap(aiData.hasil ?? [])
        : {}

    return (
        <ModalShell
            open={open}
            onClose={onClose}
            title="Detail Analisis"
            subtitle={`ID: ${analysis.id}`}
            width="max-w-2xl"
        >
            <div className="space-y-6">

                {/* ── Info dasar ──────────────────────────── */}
                <Section title="Informasi Analisis">
                    <FieldGrid>
                        <Field label="File">
                            <span className="font-mono text-xs break-all">
                                {analysis.file_path ?? '—'}
                            </span>
                        </Field>
                        <Field label="Metode">
                            <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700
                                rounded font-mono text-xs">
                                {analysis.metode ?? '—'}
                            </span>
                        </Field>
                        <Field label="Interpretasi AI">
                            {analysis.interpretasi_ai
                                ? <span className="text-emerald-600 font-medium">Ya</span>
                                : <span className="text-neutral-400">Tidak</span>}
                        </Field>
                        <Field label="Waktu proses">{analysis.waktu_proses ?? '—'}</Field>
                        <Field label="Dibuat">{fmtDate(analysis.created_at)}</Field>
                        {analysis.deleted_at && (
                            <Field label="Dihapus">
                                <span className="text-red-600">{fmtDate(analysis.deleted_at)}</span>
                            </Field>
                        )}
                    </FieldGrid>
                </Section>

                {/* ── Teknik + status AI per teknik ───────── */}
                {(analysis.teknik ?? []).length > 0 && (
                    <Section title="Teknik Ekstraksi">
                        <div className="space-y-2">
                            {(analysis.teknik ?? []).map((t, i) => {
                                const key = makeTeknikKey(t.channel, t.arah)
                                const status = teknikMap[key] as StatusAncaman | undefined

                                return (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between gap-3
                                            px-3 py-2.5 rounded-xl bg-neutral-50
                                            border border-neutral-100"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold
                                                border ${CHANNEL_COLOR[t.channel]}`}>
                                                {t.channel}
                                            </span>
                                            <span className="text-xs text-neutral-600 font-mono">
                                                {t.arah}
                                            </span>
                                        </div>

                                        {/* Status AI per teknik */}
                                        {status ? (
                                            <StatusBadge status={status} />
                                        ) : analysis.interpretasi_ai ? (
                                            <span className="text-xs text-neutral-300
                                                italic">Belum diinterpretasi</span>
                                        ) : null}
                                    </div>
                                )
                            })}
                        </div>
                    </Section>
                )}

                {/* ── Force decode info ───────────────────── */}
                {forceDecode ? (
                    <Section title="Force Decode">
                        <FieldGrid>
                            <Field label="ID Force Decode">
                                <span className="font-mono text-xs">{forceDecode.id}</span>
                            </Field>
                            <Field label="Durasi">
                                <span className="font-mono">{forceDecode.waktu_proses ?? '—'}</span>
                            </Field>
                            <Field label="Dijalankan pada">
                                {fmtDate(forceDecode.created_at)}
                            </Field>
                        </FieldGrid>
                    </Section>
                ) : (
                    <div className="px-4 py-3 rounded-xl bg-neutral-50 border border-dashed
                        border-neutral-200 text-xs text-neutral-400 text-center">
                        Force decode belum dijalankan
                    </div>
                )}

            </div>
        </ModalShell>
    )
}

// ─────────────────────────────────────────────────────────────
// MODAL: INTERPRETASI AI DETAIL
// ─────────────────────────────────────────────────────────────

interface ModalDetailInterpretasiProps {
    record: AnalysisInterpretasiAI | null
    open: boolean
    onClose: () => void
}

export function ModalDetailInterpretasi({
    record,
    open,
    onClose,
}: ModalDetailInterpretasiProps) {
    if (!record) return null

    const summary = summarizeInterpretasi(record)

    return (
        <ModalShell
            open={open}
            onClose={onClose}
            title="Detail Interpretasi AI"
            subtitle={`ID: ${record.id}`}
            width="max-w-2xl"
        >
            <div className="space-y-6">

                {/* ── Meta info ───────────────────────────── */}
                <Section title="Informasi">
                    <FieldGrid>
                        <Field label="Analysis ID">
                            <span className="font-mono text-xs">
                                {record.analysis_id ?? '—'}
                            </span>
                        </Field>
                        <Field label="Force Decode ID">
                            <span className="font-mono text-xs">
                                {record.analysis_forcedecode_id}
                            </span>
                        </Field>
                        <Field label="Durasi AI">
                            <span className="font-mono">{record.waktu_proses ?? '—'}</span>
                        </Field>
                        <Field label="Dibuat">{fmtDate(record.created_at)}</Field>
                    </FieldGrid>
                </Section>

                {/* ── Summary counts ──────────────────────── */}
                <Section title="Ringkasan Status">
                    <div className="grid grid-cols-3 gap-3">
                        {(
                            [
                                { s: 'Aman', bg: 'bg-emerald-50', text: 'text-emerald-700' },
                                { s: 'Mencurigakan', bg: 'bg-amber-50', text: 'text-amber-700' },
                                { s: 'Berbahaya', bg: 'bg-red-50', text: 'text-red-700' },
                            ] as { s: StatusAncaman; bg: string; text: string }[]
                        ).map(({ s, bg, text }) => (
                            <div key={s} className={`${bg} rounded-xl px-4 py-3 text-center`}>
                                <p className={`text-2xl font-bold ${text}`}>
                                    {summary.counts[s]}
                                </p>
                                <p className="text-xs text-neutral-500 mt-0.5">{s}</p>
                            </div>
                        ))}
                    </div>

                    {/* Worst status indicator */}
                    <div className="flex items-center gap-2 mt-3">
                        <span className="text-xs text-neutral-500">Status keseluruhan:</span>
                        <StatusBadge status={summary.worstStatus} />
                    </div>
                </Section>

                {/* ── Per-teknik hasil ────────────────────── */}
                <Section title={`Hasil per Teknik (${(record.hasil ?? []).length} teknik)`}>
                    <div className="space-y-2.5">
                        {(record.hasil ?? []).map((h, i) => (
                            <div
                                key={i}
                                className="p-3 rounded-xl border border-neutral-100 bg-white
                                    space-y-2 hover:border-neutral-200 transition-colors"
                            >
                                {/* Teknik header */}
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold
                                            border ${CHANNEL_COLOR[h.channel]}`}>
                                            {h.channel}
                                        </span>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="12" height="12"
                                            fill="currentColor"
                                            viewBox="0 0 256 256"
                                            className="text-neutral-300"
                                        >
                                            <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
                                        </svg>
                                        <span className="text-xs text-neutral-600 font-mono">
                                            {h.arah}
                                        </span>
                                    </div>
                                    <StatusBadge status={h.status_ancaman as StatusAncaman} />
                                </div>

                                {/* Interpretasi teks */}
                                <p className="text-xs text-neutral-600 leading-relaxed pl-0.5">
                                    {h.interpretation}
                                </p>
                            </div>
                        ))}

                        {(record.hasil ?? []).length === 0 && (
                            <p className="text-xs text-neutral-400 text-center py-4">
                                Tidak ada data hasil interpretasi.
                            </p>
                        )}
                    </div>
                </Section>
            </div>
        </ModalShell>
    )
}
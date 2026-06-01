// src/app/admin/analisis/[id]/page.tsx
'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayoutAdmins from '@/components/Layouts/DashboardLayoutAdmins'
import { useAnalysis } from '@/hooks/useAnalysis'
import { ConfirmModal } from '@/components/Ui/ConfirmModal'
import { Tooltip } from '@/components/Ui/ToolTip'
import HasilAnalisisAdmin from '@/components/Section/HasilAnalisisAdmin'
import { CHANNEL_COLOR, STATUS_COLOR, STATUS_DOT } from '@/utils/Channel'
import { DecodedRawItem, TEKNIK_LABEL, type TeknikArah } from '@/types/shared'
import {
    buildTeknikStatusMap,
    makeTeknikKey,
    TeknikStatusMap,
} from '@/hooks/useInterpretasiAI'
import { HasilInterpretasi, StatusAncaman } from '@/types/aiInterpretasi'
import { UserCard } from '@/components/Ui/UserCard'
import { ImagePreview } from '@/components/Ui/ImagePreview'
import { fmtDate, formatDateSimple } from '@/utils/format'
import Section from '@/components/Ui/Section'
import { Field } from '@/components/Ui/Field'
import { MethodForceDecode } from '@/types/forceDecode'
import type { AnalysisResult } from '@/types/analysis'
import { AISummaryBar } from '@/components/AI/AISummaryBar'
import { SkeletonAnalisisDetail } from '@/components/Skeleton/SkeletonAnalisisDetail'

export function methodToRawItem(m: MethodForceDecode): DecodedRawItem | null {
    if (!m.decoded_raw) return null
    return {
        channel: m.channel,
        arah: m.arah,
        text: m.decoded_raw.text,
        base64_encoded: m.decoded_raw.base64_encoded,
        printable_ratio: m.decoded_raw.printable_ratio,
        total_chars: m.decoded_raw.total_chars,
    }
}

type LocalConfirmState = { type: 'soft' | 'hard' | 'restore'; id: string; label: string } | null

interface PageProps {
    params: Promise<{ id: string }>
}

export default function AnalisisDetailPage({ params }: PageProps) {
    const { id } = use(params)
    const router = useRouter()
    const { getById, softDelete, restore, hardDelete } = useAnalysis()

    const [result, setResult] = useState<AnalysisResult | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [confirm, setConfirm] = useState<LocalConfirmState>(null)
    const [pending, setPending] = useState(false)

    const refresh = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await getById(id)
            if (!data) {
                setError('Data analisis tidak ditemukan')
                setResult(null)
            } else {
                setResult(data)
            }
        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan saat memuat data')
            setResult(null)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => { refresh() }, [id])

    // ── Action handlers ──────────────────────────────────────────────────
    const handleConfirm = async () => {
        if (!confirm) return
        setPending(true)
        try {
            if (confirm.type === 'hard') {
                await hardDelete(confirm.id)
                router.replace('/admin/analisis')
            } else if (confirm.type === 'soft') {
                await softDelete(confirm.id)
                // Update local state: tandai sebagai diarsipkan
                setResult(prev => prev
                    ? { ...prev, analysis: { ...prev.analysis, deleted_at: new Date().toISOString() } }
                    : prev
                )
            } else if (confirm.type === 'restore') {
                await restore(confirm.id)
                // Update local state: hapus tanda arsip
                setResult(prev => prev
                    ? { ...prev, analysis: { ...prev.analysis, deleted_at: undefined } }
                    : prev
                )
            }
        } finally {
            setPending(false)
            setConfirm(null)
        }
    }

    if (isLoading) {
        return (
            <DashboardLayoutAdmins>
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                    <SkeletonAnalisisDetail />
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
                            {error ?? 'Data analisis tidak ditemukan'}
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

    const { analysis, forceDecode, methodForceDecodes, aiInterpretasi } = result
    const hasilAI: HasilInterpretasi[] = aiInterpretasi?.hasil ?? []
    const isArchived = !!analysis.deleted_at

    const teknikMap: TeknikStatusMap = aiInterpretasi
        ? buildTeknikStatusMap(aiInterpretasi.hasil ?? [])
        : {} as TeknikStatusMap

    const teknikByArah = new Map<TeknikArah, string[]>()
    for (const t of (analysis.teknik ?? [])) {
        const existing = teknikByArah.get(t.arah)
        if (existing) {
            if (!existing.includes(t.channel)) existing.push(t.channel)
        } else {
            teknikByArah.set(t.arah, [t.channel])
        }
    }

    return (
        <DashboardLayoutAdmins>
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Page header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="w-8 h-8 shrink-0 rounded-sm border border-neutral-200 flex items-center justify-center
                                text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800 transition-all duration-150 ease-in-out
                                hover:shadow-[-3px_3px_0_rgba(163,163,163,1)] hover:border-neutral-400 hover:-translate-y-0.5"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
                                <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
                            </svg>
                        </button>
                        <div>
                            <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-neutral-500">
                                <span>Analisis</span>
                                <span className="text-neutral-300">/</span>
                                <span className="text-neutral-800">Detail</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {/* Status badges */}
                        {isArchived && (
                            <Tooltip text={`Record ini telah diarsipkan pada ${fmtDate(analysis.deleted_at!)}.`}>
                                <span className="text-xs px-2.5 py-1 rounded-sm bg-red-50 text-red-600
                                    border border-red-200 font-medium cursor-default">
                                    Diarsipkan
                                </span>
                            </Tooltip>
                        )}
                        {analysis.interpretasi_ai && (
                            <span className="text-xs px-2.5 py-1 rounded-sm bg-green-50 text-green-600
                                border border-green-200 font-medium">
                                AI Aktif
                            </span>
                        )}

                        {/* Arsipkan / Pulihkan */}
                        {isArchived ? (
                            <Tooltip text="Pulihkan analisis dari arsip">
                                <button
                                    disabled={pending}
                                    onClick={() => setConfirm({ type: 'restore', id, label: analysis.id })}
                                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-sm
                                        border border-emerald-200 bg-emerald-50 text-emerald-700 font-medium
                                        hover:bg-emerald-100 transition-all duration-150 disabled:opacity-40
                                        hover:shadow-[-2px_2px_0_rgba(16,185,129,0.3)] hover:-translate-y-0.5"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" viewBox="0 0 256 256">
                                        <path d="M216,208H40a16,16,0,0,1-13.84-24l88-152a16,16,0,0,1,27.7,0l88,152A16,16,0,0,1,216,208Z" opacity="0.2" />
                                        <path d="M96,208a8,8,0,0,1-8,8H40a24,24,0,0,1-20.77-36l34.29-59.25L39.47,124.5A8,8,0,1,1,35.33,109l32.77-8.77a8,8,0,0,1,9.8,5.66l8.79,32.77A8,8,0,0,1,81,148.5a8.37,8.37,0,0,1-2.08.27,8,8,0,0,1-7.72-5.93l-3.8-14.15L33.11,188A8,8,0,0,0,40,200H88A8,8,0,0,1,96,208Zm140.73-28-23.14-40a8,8,0,0,0-13.84,8l23.14,40A8,8,0,0,1,216,200H147.31l10.34-10.34a8,8,0,0,0-11.31-11.32l-24,24a8,8,0,0,0,0,11.32l24,24a8,8,0,0,0,11.31-11.32L147.31,216H216a24,24,0,0,0,20.77-36ZM128,32a7.85,7.85,0,0,1,6.92,4l34.29,59.25-14.08-3.78A8,8,0,0,0,151,106.92l32.78,8.79a8.23,8.23,0,0,0,2.07.27,8,8,0,0,0,7.72-5.93l8.79-32.79a8,8,0,1,0-15.45-4.14l-3.8,14.17L148.77,28a24,24,0,0,0-41.54,0L84.07,68a8,8,0,0,0,13.85,8l23.16-40A7.85,7.85,0,0,1,128,32Z" />
                                    </svg>
                                    Pulihkan
                                </button>
                            </Tooltip>
                        ) : (
                            <Tooltip text="Arsipkan data analisis ini">
                                <button
                                    disabled={pending}
                                    onClick={() => setConfirm({ type: 'soft', id, label: analysis.id })}
                                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-sm
                                        border border-amber-200 bg-amber-50 text-amber-700 font-medium
                                        hover:bg-amber-100 transition-all duration-150 disabled:opacity-40
                                        hover:shadow-[-2px_2px_0_rgba(251,191,36,0.3)] hover:-translate-y-0.5"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" viewBox="0 0 256 256">
                                        <path d="M216,128a88,88,0,1,1-88-88A88,88,0,0,1,216,128Z" opacity="0.2" />
                                        <path d="M120,128V48a8,8,0,0,1,16,0v80a8,8,0,0,1-16,0Zm60.37-78.7a8,8,0,0,0-8.74,13.4C194.74,77.77,208,101.57,208,128a80,80,0,0,1-160,0c0-26.43,13.26-50.23,36.37-65.3a8,8,0,0,0-8.74-13.4C47.9,67.38,32,96.06,32,128a96,96,0,0,0,192,0C224,96.06,208.1,67.38,180.37,49.3Z" />
                                    </svg>
                                    Arsipkan
                                </button>
                            </Tooltip>
                        )}

                        {/* Hapus Permanen */}
                        <Tooltip text="Hapus data analisis secara permanen">
                            <button
                                disabled={pending}
                                onClick={() => setConfirm({ type: 'hard', id, label: analysis.id })}
                                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-sm
                                    border border-red-200 bg-red-50 text-red-600 font-medium
                                    hover:bg-red-100 transition-all duration-150 disabled:opacity-40
                                    hover:shadow-[-2px_2px_0_rgba(239,68,68,0.3)] hover:-translate-y-0.5"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" viewBox="0 0 256 256">
                                    <path d="M200,56V208a8,8,0,0,1-8,8H64a8,8,0,0,1-8-8V56Z" opacity="0.2" />
                                    <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z" />
                                </svg>
                                Hapus Permanen
                            </button>
                        </Tooltip>

                        {/* Refresh */}
                        <Tooltip text="Muat ulang data dari server">
                            <button
                                onClick={refresh}
                                disabled={pending}
                                className="w-8 h-8 rounded-sm border border-neutral-200 flex items-center justify-center
                                    text-neutral-500 hover:bg-neutral-50 transition-all duration-150 ease-in-out
                                    hover:shadow-[-3px_3px_0_rgba(163,163,163,1)] hover:border-neutral-400 hover:-translate-y-0.5
                                    disabled:opacity-40"
                                title="Refresh"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
                                    <path d="M228,48V96a12,12,0,0,1-12,12H168a12,12,0,0,1,0-24h19l-7.8-7.8a75.55,75.55,0,0,0-53.32-22.26h-.43A75.49,75.49,0,0,0,72.39,75.57,12,12,0,1,1,55.61,58.41a99.38,99.38,0,0,1,69.87-28.47H126A99.42,99.42,0,0,1,196.2,59.23L204,67V48a12,12,0,0,1,24,0ZM183.61,180.43a75.49,75.49,0,0,1-53.09,21.63h-.43A75.55,75.55,0,0,1,76.77,179.8L69,172H88a12,12,0,0,0,0-24H40a12,12,0,0,0-12,12v48a12,12,0,0,0,24,0V189l7.8,7.8A99.42,99.42,0,0,0,130,226.06h.56a99.38,99.38,0,0,0,69.87-28.47,12,12,0,0,0-16.78-17.16Z" />
                                </svg>
                            </button>
                        </Tooltip>
                    </div>
                </div>

                {/* AI summary bar */}
                {hasilAI.length > 0 && (
                    <div className="mb-4">
                        <AISummaryBar hasil={hasilAI} />
                    </div>
                )}

                {/* Main layout */}
                <div className="grid grid-cols-1 gap-6 items-start">

                    <aside className="space-y-5 grid grid-cols-1 lg:grid-cols-2 gap-4">

                        <div className="space-y-5">
                            <Section title="Pengguna">
                                <UserCard userId={analysis.user_id} />
                            </Section>

                            <Section title="File Preview">
                                <ImagePreview src={analysis.file_path} />
                            </Section>
                        </div>

                        <div className="space-y-5">
                            <Section title="Info Analisis">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    <Field label="Metode">
                                        <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700
                                            rounded font-mono text-xs inline-block">
                                            {analysis.metode ?? '—'}
                                        </span>
                                    </Field>
                                    <Field label="Dibuat">
                                        <span className="text-xs">{formatDateSimple(analysis.created_at)}</span>
                                    </Field>
                                    {isArchived && (
                                        <Field label="Diarsipkan">
                                            <span className="text-red-600 text-xs">{formatDateSimple(analysis.deleted_at!)}</span>
                                        </Field>
                                    )}
                                </div>
                            </Section>

                            {forceDecode ? (
                                <Section title="Force Decode">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        <Field label="Durasi">
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
                                        <Field label="Kombinasi">
                                            <span className="text-xs font-semibold text-neutral-700">
                                                {methodForceDecodes?.length ?? 0} teknik
                                            </span>
                                        </Field>
                                        <Field label="Dijalankan">
                                            <span className="text-xs">{formatDateSimple(forceDecode.created_at)}</span>
                                        </Field>
                                    </div>
                                </Section>
                            ) : (
                                <div className="px-4 py-3 rounded-xl bg-neutral-50 border border-dashed
                                    border-neutral-200 text-xs text-neutral-400 text-center">
                                    Force decode belum dijalankan
                                </div>
                            )}

                            {teknikByArah.size > 0 && (
                                <Section title={`Teknik (${teknikByArah.size} arah)`}>
                                    <div className="space-y-1.5">
                                        {[...teknikByArah.entries()].map(([arah, channels]) => {
                                            const SEV: Record<StatusAncaman, number> = { Aman: 0, Mencurigakan: 1, Berbahaya: 2 }
                                            let worst: StatusAncaman | undefined
                                            for (const ch of channels) {
                                                const st = teknikMap[makeTeknikKey(ch, arah)]
                                                if (st && (!worst || SEV[st] > SEV[worst])) worst = st
                                            }
                                            return (
                                                <div key={arah}
                                                    className="flex items-center justify-between gap-2 px-3 py-2
                                                        rounded-sm bg-neutral-50 border border-neutral-100">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span className="text-[11px] text-neutral-600 font-medium truncate">
                                                            {TEKNIK_LABEL[arah]}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        {channels.map(ch => (
                                                            <span key={ch} className={`px-1.5 py-0.5 rounded text-[10px]
                                                                font-bold border leading-none
                                                                ${CHANNEL_COLOR[ch] ?? 'bg-neutral-100 text-neutral-500 border-neutral-200'}`}>
                                                                {ch}
                                                            </span>
                                                        ))}
                                                        {worst && (
                                                            <span className={`ml-0.5 flex items-center gap-1 px-1.5 py-0.5
                                                                rounded-full text-[10px] font-medium border ${STATUS_COLOR[worst]}`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[worst]}`} />
                                                                {worst}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </Section>
                            )}
                        </div>
                    </aside>

                    <main>
                        {forceDecode && methodForceDecodes && methodForceDecodes.length > 0 ? (
                            <HasilAnalisisAdmin result={result} filePath={analysis.file_path} />
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 gap-3
                                text-neutral-300 border border-dashed border-neutral-200 rounded-2xl">
                                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"
                                    fill="currentColor" viewBox="0 0 256 256">
                                    <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z" />
                                </svg>
                                <p className="text-sm">Force decode belum dijalankan</p>
                                <p className="text-xs text-neutral-400 text-center max-w-xs">
                                    Jalankan proses force decode terlebih dahulu untuk melihat hasil ekstraksi LSB.
                                </p>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Confirm modal */}
            <ConfirmModal
                open={!!confirm}
                title={
                    confirm?.type === 'hard' ? 'Hapus Permanen?' :
                        confirm?.type === 'restore' ? 'Pulihkan Analisis?' :
                            'Arsipkan Analisis?'
                }
                message={
                    confirm?.type === 'hard'
                        ? 'Data analisis ini akan dihapus secara permanen termasuk seluruh data force decode dan interpretasi AI yang terkait. Tindakan ini tidak dapat dibatalkan.'
                        : confirm?.type === 'restore'
                            ? 'Data analisis ini akan dipulihkan dari arsip dan aktif kembali.'
                            : 'Data analisis ini akan diarsipkan. Dapat dipulihkan kembali nanti.'
                }
                variant={
                    confirm?.type === 'hard' ? 'danger' :
                        confirm?.type === 'restore' ? 'info' :
                            'warning'
                }
                onConfirm={handleConfirm}
                onCancel={() => setConfirm(null)}
            />
        </DashboardLayoutAdmins>
    )
}
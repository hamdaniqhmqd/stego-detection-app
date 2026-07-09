// app/admin/interpretasi/[id]/page.tsx
'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayoutAdmins from '@/components/Layouts/DashboardLayoutAdmins'
import { Tooltip } from '@/components/Ui/ToolTip'
import { ConfirmModal } from '@/components/Ui/ConfirmModal'
import { useInterpretasiAI, buildTeknikStatusMap, type TeknikStatusMap } from '@/hooks/useInterpretasiAI'
import { type TeknikArah, type Channel } from '@/types/shared'
import type { HasilInterpretasi } from '@/types/analysis'
import { formatDateSimple } from '@/utils/format'
import Section from '@/components/Ui/Section'
import { Field } from '@/components/Ui/Field'
import { UserCard } from '@/components/Ui/UserCard'
import { ImagePreview } from '@/components/Ui/ImagePreview'
import { HasilInterpretasiSection } from '@/components/Section/HasilInterpretasiSection'
import { TokenUsageSection } from '@/components/Ui/Token'
import { AISummaryBar } from '@/components/AI/AISummaryBar'
import { SkeletonInterpretasiDetail } from '@/components/Skeleton/SkeletonInterpretasiDetail'

interface PageProps {
    params: Promise<{ id: string }>
}

export default function InterpretasiDetailPage({ params }: PageProps) {
    const { id } = use(params)
    const router = useRouter()

    type LocalConfirmState = { type: 'soft' | 'hard' | 'restore'; id: string; label: string } | null
    const [confirm, setConfirm] = useState<LocalConfirmState>(null)
    const [pending, setPending] = useState(false)

    // Gunakan useInterpretasiAI dengan detailId
    const {
        detail,
        isDetailLoading,
        detailError,
        refreshDetail,
        softDelete,
        restore,
        hardDelete,
        fetchDetail,
    } = useInterpretasiAI({ detailId: id })

    // Pastikan detail di-fetch ulang bila id berubah (navigasi antar record)
    useEffect(() => { fetchDetail(id) }, [id, fetchDetail])

    //  Action handlers 
    const handleConfirm = async () => {
        if (!confirm) return
        setPending(true)
        try {
            if (confirm.type === 'hard') {
                await hardDelete(confirm.id)
                router.replace('/admin/interpretasi')
            } else if (confirm.type === 'soft') {
                await softDelete(confirm.id)
                await refreshDetail()
            } else if (confirm.type === 'restore') {
                await restore(confirm.id)
                await refreshDetail()
            }
        } finally {
            setPending(false)
            setConfirm(null)
        }
    }

    //  Loading state 
    if (isDetailLoading) {
        return (
            <DashboardLayoutAdmins>
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                    <SkeletonInterpretasiDetail />
                </div>
            </DashboardLayoutAdmins>
        )
    }

    if (detailError || !detail) {
        return (
            <DashboardLayoutAdmins>
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                    <div className="flex flex-col items-center justify-center py-24 gap-4 text-neutral-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M236.8,188.09,149.35,36.22a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM120,104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm8,88a12,12,0,1,1,12-12A12,12,0,0,1,128,192Z" />
                        </svg>
                        <p className="text-sm font-medium">
                            {detailError ?? 'Data interpretasi tidak ditemukan'}
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

    const { interpretasi, analysis, forceDecode, user } = detail
    const hasilAI: HasilInterpretasi[] = interpretasi.hasil ?? []
    const teknikMap: TeknikStatusMap = buildTeknikStatusMap(hasilAI)
    const tokenUsage = interpretasi.token_usage ?? null
    const isArchived = !!interpretasi.deleted_at

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

                {/* Page header */}
                <div className="flex items-start justify-start gap-4">
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
                </div>

                {/* AI Summary bar */}
                {hasilAI.length > 0 && (
                    <div className="mb-4">
                        <AISummaryBar hasil={hasilAI} />
                    </div>
                )}

                {/* Main layout */}
                <div className="grid grid-cols-1 gap-6 items-start">
                    <section className="space-y-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-5">
                            <Section title="Pengguna">
                                {user ? (
                                    <UserCard userId={user.id as string} />
                                ) : (
                                    <p className="text-xs text-neutral-400 italic px-1">
                                        Data pengguna tidak ditemukan
                                    </p>
                                )}
                            </Section>

                            <Section title="File Analisis">
                                <ImagePreview src={analysis?.file_path} />
                            </Section>

                            {/* Action buttons + status */}
                            <div className="flex items-center gap-2 shrink-0">
                                {isArchived && (
                                    <Tooltip text={`Record ini telah diarsipkan pada ${formatDateSimple(interpretasi.deleted_at!)}.`}>
                                        <span className="text-xs px-2.5 py-1 rounded-sm bg-red-50 text-red-600
                                    border border-red-200 font-medium cursor-default">
                                            Diarsipkan
                                        </span>
                                    </Tooltip>
                                )}

                                {/* Arsipkan / Pulihkan */}
                                {isArchived ? (
                                    <Tooltip text="Pulihkan interpretasi dari arsip">
                                        <button
                                            disabled={pending}
                                            onClick={() => setConfirm({ type: 'restore', id, label: user?.username ?? 'Unknown' })}
                                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-sm
                                        border border-emerald-200 bg-emerald-50 text-emerald-700 font-medium
                                        hover:bg-emerald-100 transition-all duration-150 disabled:opacity-40
                                        hover:shadow-[-2px_2px_0_rgba(16,185,129,0.3)] hover:-translate-y-0.5"
                                        >
                                            {/* restore icon */}
                                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" viewBox="0 0 256 256">
                                                <path d="M216,208H40a16,16,0,0,1-13.84-24l88-152a16,16,0,0,1,27.7,0l88,152A16,16,0,0,1,216,208Z" opacity="0.2" />
                                                <path d="M96,208a8,8,0,0,1-8,8H40a24,24,0,0,1-20.77-36l34.29-59.25L39.47,124.5A8,8,0,1,1,35.33,109l32.77-8.77a8,8,0,0,1,9.8,5.66l8.79,32.77A8,8,0,0,1,81,148.5a8.37,8.37,0,0,1-2.08.27,8,8,0,0,1-7.72-5.93l-3.8-14.15L33.11,188A8,8,0,0,0,40,200H88A8,8,0,0,1,96,208Zm140.73-28-23.14-40a8,8,0,0,0-13.84,8l23.14,40A8,8,0,0,1,216,200H147.31l10.34-10.34a8,8,0,0,0-11.31-11.32l-24,24a8,8,0,0,0,0,11.32l24,24a8,8,0,0,0,11.31-11.32L147.31,216H216a24,24,0,0,0,20.77-36ZM128,32a7.85,7.85,0,0,1,6.92,4l34.29,59.25-14.08-3.78A8,8,0,0,0,151,106.92l32.78,8.79a8.23,8.23,0,0,0,2.07.27,8,8,0,0,0,7.72-5.93l8.79-32.79a8,8,0,1,0-15.45-4.14l-3.8,14.17L148.77,28a24,24,0,0,0-41.54,0L84.07,68a8,8,0,0,0,13.85,8l23.16-40A7.85,7.85,0,0,1,128,32Z" />
                                            </svg>
                                            Pulihkan
                                        </button>
                                    </Tooltip>
                                ) : (
                                    <Tooltip text="Arsipkan interpretasi ini">
                                        <button
                                            disabled={pending}
                                            onClick={() => setConfirm({ type: 'soft', id, label: user?.username ?? 'Unknown' })}
                                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-sm
                                        border border-amber-200 bg-amber-50 text-amber-700 font-medium
                                        hover:bg-amber-100 transition-all duration-150 disabled:opacity-40
                                        hover:shadow-[-2px_2px_0_rgba(251,191,36,0.3)] hover:-translate-y-0.5"
                                        >
                                            {/* archive/power icon */}
                                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" viewBox="0 0 256 256">
                                                <path d="M216,128a88,88,0,1,1-88-88A88,88,0,0,1,216,128Z" opacity="0.2" />
                                                <path d="M120,128V48a8,8,0,0,1,16,0v80a8,8,0,0,1-16,0Zm60.37-78.7a8,8,0,0,0-8.74,13.4C194.74,77.77,208,101.57,208,128a80,80,0,0,1-160,0c0-26.43,13.26-50.23,36.37-65.3a8,8,0,0,0-8.74-13.4C47.9,67.38,32,96.06,32,128a96,96,0,0,0,192,0C224,96.06,208.1,67.38,180.37,49.3Z" />
                                            </svg>
                                            Arsipkan
                                        </button>
                                    </Tooltip>
                                )}

                                {/* Hapus Permanen */}
                                <Tooltip text="Hapus data interpretasi secara permanen">
                                    <button
                                        disabled={pending}
                                        onClick={() => setConfirm({ type: 'hard', id, label: user?.username ?? 'Unknown' })}
                                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-sm
                                    border border-red-200 bg-red-50 text-red-600 font-medium
                                    hover:bg-red-100 transition-all duration-150 disabled:opacity-40
                                    hover:shadow-[-2px_2px_0_rgba(239,68,68,0.3)] hover:-translate-y-0.5"
                                    >
                                        {/* trash icon */}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" viewBox="0 0 256 256">
                                            <path d="M200,56V208a8,8,0,0,1-8,8H64a8,8,0,0,1-8-8V56Z" opacity="0.2" />
                                            <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z" />
                                        </svg>
                                        Hapus Permanen
                                    </button>
                                </Tooltip>

                                {/* Refresh */}
                                <Tooltip text="Muat ulang data interpretasi dari server">
                                    <button
                                        onClick={refreshDetail}
                                        disabled={pending}
                                        className="w-8 h-8 rounded-sm border border-neutral-200 flex items-center justify-center
                                    text-neutral-500 hover:bg-neutral-50 transition-all duration-150
                                    hover:shadow-[-3px_3px_0_rgba(163,163,163,1)]
                                    hover:border-neutral-400 hover:-translate-y-0.5 disabled:opacity-40"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
                                            <path d="M228,48V96a12,12,0,0,1-12,12H168a12,12,0,0,1,0-24h19l-7.8-7.8a75.55,75.55,0,0,0-53.32-22.26h-.43A75.49,75.49,0,0,0,72.39,75.57,12,12,0,1,1,55.61,58.41a99.38,99.38,0,0,1,69.87-28.47H126A99.42,99.42,0,0,1,196.2,59.23L204,67V48a12,12,0,0,1,24,0ZM183.61,180.43a75.49,75.49,0,0,1-53.09,21.63h-.43A75.55,75.55,0,0,1,76.77,179.8L69,172H88a12,12,0,0,0,0-24H40a12,12,0,0,0-12,12v48a12,12,0,0,0,24,0V189l7.8,7.8A99.42,99.42,0,0,0,130,226.06h.56a99.38,99.38,0,0,0,69.87-28.47,12,12,0,0,0-16.78-17.16Z" />
                                        </svg>
                                    </button>
                                </Tooltip>
                            </div>
                        </div>

                        <div className="space-y-5">
                            {analysis && (
                                <Section title="Info Analisis">
                                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                        <Field label="Metode" tooltip="Metode steganografi yang digunakan">
                                            <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700
                                                rounded font-mono text-xs inline-block">
                                                {analysis.metode ?? '—'}
                                            </span>
                                        </Field>
                                        <Field label="Dibuat" tooltip="Waktu ketika record analisis ini pertama kali dibuat">
                                            <span className="text-xs">{formatDateSimple(analysis.created_at)}</span>
                                        </Field>
                                    </div>
                                </Section>
                            )}

                            {forceDecode && (
                                <Section title="Force Decode">
                                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
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
                                            <span className="text-xs">{formatDateSimple(forceDecode.created_at)}</span>
                                        </Field>
                                    </div>
                                </Section>
                            )}

                            <Section title="Info Interpretasi">
                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
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
                                        <span className="text-xs">{formatDateSimple(interpretasi.created_at)}</span>
                                    </Field>

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
                                </div>
                            </Section>
                        </div>
                    </section>

                    {tokenUsage && (
                        <Section title="Rincian Pemakaian Token">
                            <TokenUsageSection usage={tokenUsage} />
                        </Section>
                    )}

                    <main>
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

            {/* Confirm modal untuk semua aksi */}
            <ConfirmModal
                open={!!confirm}
                title={
                    confirm?.type === 'hard' ? 'Hapus Permanen?' :
                        confirm?.type === 'restore' ? 'Pulihkan Interpretasi?' :
                            'Arsipkan Interpretasi?'
                }
                message={
                    confirm?.type === 'hard'
                        ? 'Data interpretasi ini akan dihapus secara permanen dan tidak dapat dipulihkan. Anda akan diarahkan kembali ke daftar.'
                        : confirm?.type === 'restore'
                            ? 'Data interpretasi ini akan dipulihkan dari arsip dan aktif kembali.'
                            : 'Data interpretasi ini akan diarsipkan. Dapat dipulihkan nanti.'
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
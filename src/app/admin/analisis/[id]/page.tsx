// src/app/admin/analisis/[id]/page.tsx
'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayoutAdmins from '@/components/Layouts/DashboardLayoutAdmins'
import { useAnalysisDetail } from '@/hooks/useAnalisisDetail'
import HasilAnalisisAdmin from '@/components/Section/HasilAnalisisAdmin'
import { CHANNEL_COLOR, STATUS_COLOR, STATUS_DOT } from '@/utils/Channel'
import { TEKNIK_LABEL, type TeknikArah } from '@/types/shared'
import {
    buildTeknikStatusMap,
    makeTeknikKey,
    type TeknikStatusMap,
} from '@/hooks/useInterpretasiAI'
import { StatusAncaman } from '@/types/aiInterpretasi'
import { PageSkeleton } from '@/components/Ui/Skeleton'
import { UserCard } from '@/components/Ui/UserCard'
import { ImagePreview } from '@/components/Ui/ImagePreview'
import { fmtDate } from '@/utils/format'
import Section from '@/components/Ui/Section'
import { Field } from '@/components/Ui/Field'

// AI Summary bar 
function AISummaryBar({ teknikMap }: { teknikMap: TeknikStatusMap }) {
    const counts: Record<StatusAncaman, number> = { Aman: 0, Mencurigakan: 0, Berbahaya: 0 }
    for (const st of Object.values(teknikMap)) counts[st as StatusAncaman]++
    const total = Object.values(counts).reduce((a, b) => a + b, 0)
    if (total === 0) return null

    const worstStatus: StatusAncaman =
        counts.Berbahaya > 0 ? 'Berbahaya' :
            counts.Mencurigakan > 0 ? 'Mencurigakan' : 'Aman'

    return (
        <div className={`flex items-center gap-4 px-4 py-3 rounded-sm border
            ${STATUS_COLOR[worstStatus]}`}>
            <div className="flex items-center gap-2 flex-1">
                <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[worstStatus]}`} />
                <span className="text-xs font-semibold">Status Keseluruhan: {worstStatus}</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
                {(['Aman', 'Mencurigakan', 'Berbahaya'] as StatusAncaman[]).map(s => (
                    counts[s] > 0 && (
                        <span key={s} className="flex items-center gap-1 opacity-80">
                            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[s]}`} />
                            {counts[s]} {s}
                        </span>
                    )
                ))}
            </div>
        </div>
    )
}

// Page 
interface PageProps {
    params: Promise<{ id: string }>
}

export default function AnalisisDetailPage({ params }: PageProps) {
    const { id } = use(params)
    const router = useRouter()
    const { result, isLoading, error, refresh } = useAnalysisDetail(id)

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

    const { analysis, forceDecode, aiInterpretasi } = result

    // Build teknik → status map
    const teknikMap: TeknikStatusMap = aiInterpretasi
        ? buildTeknikStatusMap(aiInterpretasi.hasil ?? [])
        : {} as TeknikStatusMap

    const decodedRaw = forceDecode?.decoded_raw ?? []
    const filename = analysis.file_path?.split('/').pop() ?? '—'

    // Group teknik by arah for the info panel
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
                        {/* Status badge */}
                        {analysis.deleted_at && (
                            <span className="text-xs px-2.5 py-1 rounded-sm bg-red-50 text-red-600
                                border border-red-200 font-medium">
                                Diarsipkan
                            </span>
                        )}
                        {analysis.interpretasi_ai && (
                            <span className="text-xs px-2.5 py-1 rounded-sm bg-green-50 text-green-600
                                border border-green-200 font-medium">
                                AI Aktif
                            </span>
                        )}
                        <button
                            onClick={refresh}
                            className="w-8 h-8 rounded-sm border border-neutral-200 flex items-center justify-center
                                text-neutral-500 hover:bg-neutral-50 transition-all duration-150 ease-in-out
                                hover:shadow-[-3px_3px_0_rgba(163,163,163,1)] hover:border-neutral-400 hover:-translate-y-0.5"
                            title="Refresh"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M228,48V96a12,12,0,0,1-12,12H168a12,12,0,0,1,0-24h19l-7.8-7.8a75.55,75.55,0,0,0-53.32-22.26h-.43A75.49,75.49,0,0,0,72.39,75.57,12,12,0,1,1,55.61,58.41a99.38,99.38,0,0,1,69.87-28.47H126A99.42,99.42,0,0,1,196.2,59.23L204,67V48a12,12,0,0,1,24,0ZM183.61,180.43a75.49,75.49,0,0,1-53.09,21.63h-.43A75.55,75.55,0,0,1,76.77,179.8L69,172H88a12,12,0,0,0,0-24H40a12,12,0,0,0-12,12v48a12,12,0,0,0,24,0V189l7.8,7.8A99.42,99.42,0,0,0,130,226.06h.56a99.38,99.38,0,0,0,69.87-28.47,12,12,0,0,0-16.78-17.16Z"></path></svg>
                        </button>
                    </div>
                </div>

                {/* AI summary bar (jika ada)  */}
                {Object.keys(teknikMap).length > 0 && (
                    <AISummaryBar teknikMap={teknikMap} />
                )}

                {/* Main layout: sidebar + content */}
                <div className="grid grid-cols-1 gap-6 items-start">

                    {/* Info */}
                    <aside className="space-y-5 grid grid-cols-1 lg:grid-cols-2 gap-4">

                        <div className="space-y-5">
                            {/* Pengguna */}
                            <Section title="Pengguna">
                                <UserCard userId={analysis.user_id} />
                            </Section>

                            {/* File meta */}
                            <Section title="File Preview">
                                <ImagePreview src={analysis.file_path} />
                            </Section>
                        </div>

                        <div className="space-y-5">
                            {/* Info analisis */}
                            <Section title="Info Analisis">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    <Field label="Metode">
                                        <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700
                                        rounded font-mono text-xs inline-block">
                                            {analysis.metode ?? '—'}
                                        </span>
                                    </Field>
                                    <Field label="Dibuat">
                                        <span className="text-xs">{fmtDate(analysis.created_at)}</span>
                                    </Field>
                                    {analysis.deleted_at && (
                                        <Field label="Diarsipkan">
                                            <span className="text-red-600 text-xs">{fmtDate(analysis.deleted_at)}</span>
                                        </Field>
                                    )}
                                </div>
                            </Section>

                            {/* Force decode meta */}
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
                                                {decodedRaw.length} teknik
                                            </span>
                                        </Field>
                                        <Field label="Dijalankan">
                                            <span className="text-xs">{fmtDate(forceDecode.created_at)}</span>
                                        </Field>
                                    </div>
                                </Section>
                            ) : (
                                <div className="px-4 py-3 rounded-xl bg-neutral-50 border border-dashed
                                border-neutral-200 text-xs text-neutral-400 text-center">
                                    Force decode belum dijalankan
                                </div>
                            )}

                            {/* Teknik ringkasan (arah + channel pills) */}
                            {teknikByArah.size > 0 && (
                                <Section title={`Teknik (${teknikByArah.size} arah)`}>
                                    <div className="space-y-1.5">
                                        {[...teknikByArah.entries()].map(([arah, channels]) => {
                                            // worst status for this arah
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

                    {/* Hasil Analisis */}
                    <main className="">
                        {forceDecode ? (
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
        </DashboardLayoutAdmins>
    )
}
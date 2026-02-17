'use client'

import { useParams, useRouter } from 'next/navigation'
import DashboardLayoutUsers from '@/components/Layouts/DashboardLayoutUsers'
import { useAnalisisDetail } from '@/hooks/useAnalisisDetail'
import type { Channel, TeknikArah } from '@/types/analysis'
import InputAnalisis from '../secion/InputAnalisis'
import HasilAnalisis from '../secion/HasilAnalisis'

export default function DetilAnalisisStegoPage() {
    const { id } = useParams();
    // console.log('id:', id)
    const router = useRouter()
    const { data, isLoading, error } = useAnalisisDetail(id as string)

    // Derive readOnlyData dari data yang di-fetch
    const readOnlyData = data
        ? {
            analysis: data.analysis,
            // Rekonstruksi Set channel dari teknik yang tersimpan
            selectedChannels: data.analysis.teknik
                ? new Set(data.analysis.teknik.map((t) => t.channel) as Channel[])
                : new Set<Channel>(['R', 'G', 'B']),
            // Rekonstruksi Set teknik dari teknik yang tersimpan
            selectedTeknik: data.analysis.teknik
                ? new Set(data.analysis.teknik.map((t) => t.arah) as TeknikArah[])
                : new Set<TeknikArah>(),
            useAI: data.analysis.interpretasi_ai,
        }
        : undefined

    // Loading state
    if (isLoading) {
        return (
            <DashboardLayoutUsers>
                <section className="w-full min-h-screen">
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <svg className="animate-spin h-8 w-8 text-gray-500" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        <p className="text-sm text-gray-500">Memuat detail analisis...</p>
                    </div>
                </section>
            </DashboardLayoutUsers>
        )
    }

    // Error state
    if (error || !data) {
        return (
            <DashboardLayoutUsers>
                <section className="w-full min-h-screen">
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <div className="p-4 rounded-full bg-red-950/40 border border-red-900">
                            <svg className="h-8 w-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <p className="text-sm text-red-400">{error ?? 'Data analisis tidak ditemukan'}</p>
                        <button
                            onClick={() => router.push('/dashboard/analisis_stego')}
                            className="text-xs px-4 py-2 rounded-lg border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200 transition-colors"
                        >
                            ← Kembali ke Analisis
                        </button>
                    </div>
                </section>
            </DashboardLayoutUsers>
        )
    }

    // Main render
    return (
        <DashboardLayoutUsers>
            <section className="w-full min-h-screen">
                <div className="space-y-4 lg:pb-16 lg:pt-8 sm:pb-10 sm:pt-5">

                    {/* Page header */}
                    <div className="mb-8 text-center">
                        <div className="inline-flex items-center gap-3 mb-3">
                            <h1 className="text-2xl font-bold text-gray-50">Detail Analisis Steganografi</h1>
                        </div>
                        <p className="text-gray-300 text-sm w-4/5 md:w-2/3 mx-auto">
                            Hasil analisis force decode LSB yang telah disimpan. Semua opsi dalam mode tampilan saja.
                        </p>
                    </div>

                    {/* InputAnalisis — readOnly mode */}
                    <InputAnalisis
                        readOnly={true}
                        readOnlyData={readOnlyData}
                    />

                    {/* HasilAnalisis — tampilkan hasil yang sudah ada */}
                    {data.forceDecode && (
                        <div id="hasil-analisis">
                            <HasilAnalisis result={data} />
                        </div>
                    )}

                    {/* Jika belum ada force decode (edge case) */}
                    {!data.forceDecode && (
                        <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-gray-900 border border-gray-800 max-w-7xl mx-auto">
                            <svg className="h-4 w-4 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-xs text-gray-500">
                                Hasil decode belum tersedia untuk analisis ini.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </DashboardLayoutUsers>
    )
}
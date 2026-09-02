'use client';

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardLayoutUsers from '@/components/Layouts/DashboardLayoutUsers'
import { TableShell } from '@/components/Table/TableShell'
import { SkeletonRows } from '@/components/Skeleton/SkeletonRows'
import { ActionBtn } from '@/components/Ui/ActionBtn'
import { useRiwayatAnalisis } from '@/hooks/useRiwayatAnalisis'
import { fmt, fmtTime } from '@/utils/format'
import { useAuth } from '@/provider/AuthProvider';

const MAX_ANALISIS = 3

export default function DashboardPage() {
    const router = useRouter()
    const { user, isLoading: authLoading } = useAuth()

    const riwayat = useRiwayatAnalisis(user?.id)

    const totalUsed = riwayat.total
    const remaining = Math.max(0, MAX_ANALISIS - totalUsed)
    const quotaReached = !authLoading && remaining <= 0

    return (
        <DashboardLayoutUsers>
            <section className="w-full min-h-screen px-4 py-10 md:py-16">
                <div className="max-w-5xl mx-auto flex flex-col gap-8">

                    <div className="flex flex-col items-center gap-2 text-center">
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-neutral-900">
                            Selamat Datang di Dashboard{user?.fullname ? `, ${user.fullname}` : ''}
                        </h1>
                        <p className="text-sm text-neutral-700 max-w-2xl">
                            Aplikasi Deteksi Steganografi LSB untuk membuat dan menganalisa pesan
                            tersembunyi dengan bantuan AI sebagai media Interpretasinya.
                        </p>
                    </div>

                    {/* Ringkasan kuota */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="rounded-sm border border-neutral-900 bg-neutral-100 px-4 py-3 flex flex-col gap-1">
                            <span className="text-xs uppercase tracking-wide text-neutral-500">Total Analisis</span>
                            <span className="text-2xl font-black text-neutral-900">
                                {authLoading || riwayat.isLoading ? '—' : totalUsed}
                                <span className="text-sm font-normal text-neutral-500"> / {MAX_ANALISIS}</span>
                            </span>
                        </div>

                        <div className={`rounded-sm border px-4 py-3 flex flex-col gap-1 ${quotaReached ? 'border-red-600 bg-red-50' : 'border-neutral-900 bg-neutral-100'
                            }`}>
                            <span className="text-xs uppercase tracking-wide text-neutral-500">Sisa Kesempatan</span>
                            <span className={`text-2xl font-black ${quotaReached ? 'text-red-600' : 'text-neutral-900'}`}>
                                {authLoading || riwayat.isLoading ? '—' : remaining}
                            </span>
                        </div>

                        <div className="rounded-sm border border-neutral-900 bg-neutral-100 px-4 py-3 flex items-center">
                            <span className="text-xs text-neutral-600">
                                {quotaReached
                                    ? 'Batas 3x analisis sudah tercapai. Hubungi admin bila memerlukan analisis tambahan.'
                                    : `Anda masih dapat melakukan ${remaining} kali analisis.`}
                            </span>
                        </div>
                    </div>

                    {/* Aksi */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
                        <Link href="/dashboard/buat_stego"
                            className="relative rounded-sm px-6 py-3 flex flex-col gap-3 cursor-pointer bg-neutral-100 border border-neutral-900 text-neutral-900 font-semibold transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[-7px_7px_0_rgba(26,26,46,1)]">
                            Buat Stego
                        </Link>

                        {quotaReached ? (
                            <span className="relative rounded-sm px-6 py-3 flex flex-col gap-3 bg-neutral-200 border border-neutral-400 text-neutral-400 font-semibold cursor-not-allowed">
                                Analisis Stego (Kuota Habis)
                            </span>
                        ) : (
                            <Link href="/dashboard/analisis_stego"
                                className="relative rounded-sm px-6 py-3 flex flex-col gap-3 cursor-pointer bg-neutral-100 border border-neutral-900 text-neutral-900 font-semibold transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[-7px_7px_0_rgba(26,26,46,1)]">
                                Analisis Stego
                            </Link>
                        )}
                    </div>

                    {/* Tabel riwayat analisis milik user */}
                    <TableShell
                        title="Riwayat Analisis Saya"
                        subtitle="Daftar analisis steganografi yang pernah Anda lakukan"
                        badge={riwayat.total}
                        headers={['Metode', 'Jumlah Teknik', 'Tanggal', 'Aksi']}
                        isEmpty={!riwayat.isLoading && riwayat.items.length === 0}
                        emptyText="Anda belum melakukan analisis."
                    >
                        {riwayat.isLoading ? (
                            <SkeletonRows cols={4} />
                        ) : riwayat.items.map((item) => (
                            <tr key={item.id} className="hover:bg-neutral-50 transition-colors border-b border-neutral-200">
                                <td className="px-4 py-3 text-sm text-neutral-900">
                                    {item.metode ?? <span className="text-neutral-300 text-xs">—</span>}
                                </td>

                                <td className="px-4 py-3">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-sm bg-neutral-100 border border-neutral-300 text-xs font-medium text-neutral-700">
                                        {item.teknik_count} teknik
                                    </span>
                                </td>

                                <td className="px-4 py-3 text-xs text-neutral-700 whitespace-nowrap">
                                    <span className="block">{fmt(item.created_at)}</span>
                                    <span className="block text-neutral-500">{fmtTime(item.created_at)}</span>
                                </td>

                                <td className="px-4 py-3">
                                    <ActionBtn
                                        icon={
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
                                                <path d="M128,56C48,56,16,128,16,128s32,72,112,72,112-72,112-72S208,56,128,56Zm0,112a40,40,0,1,1,40-40A40,40,0,0,1,128,168Z" opacity="0.2"></path>
                                                <path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"></path>
                                            </svg>
                                        }
                                        label="Detail"
                                        onClick={() => router.push(`/dashboard/analisis_stego/${item.id}`)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </TableShell>

                    {/* Load more (infinite scroll, bukan page-based) */}
                    {riwayat.hasMore && (
                        <div className="flex justify-center">
                            <button
                                onClick={riwayat.loadMore}
                                disabled={riwayat.isLoadingMore}
                                className="text-xs font-semibold px-4 py-2 rounded-sm border border-neutral-900 bg-neutral-100 text-neutral-900 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {riwayat.isLoadingMore ? 'Memuat...' : 'Muat Lebih Banyak'}
                            </button>
                        </div>
                    )}

                    {riwayat.error && (
                        <p className="text-center text-xs text-red-600">{riwayat.error}</p>
                    )}

                    <p className="text-center text-neutral-800 text-xs">
                        Sebagai himbauan, sistem ini bersifat prototype dan masih dalam tahap
                        pengembangan, jadi sistem ini tidak digunakan sebagai acuan mutlak sistem
                        keamanan informasi.
                    </p>
                </div>
            </section>
        </DashboardLayoutUsers>
    );
}
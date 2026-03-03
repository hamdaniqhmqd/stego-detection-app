'use client'

// components/Dashboard/ChartDashboard.tsx
// Requires: npm install apexcharts react-apexcharts

import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'
import type { AnalysisListItem } from '@/hooks/useAnalysis'
import type { AnalysisInterpretasiAI } from '@/types/analysis'
import type { User } from '@/types/Users'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })

const fmtMonth = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })

/** Group array of dated records by day (last N days) */
function groupByDay<T extends { created_at: string; deleted_at?: string | null }>(
    items: T[],
    days = 7
): { label: string; count: number }[] {
    const now = new Date()
    const result: { label: string; count: number }[] = []

    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(now.getDate() - i)
        const label = fmt(d.toISOString())
        const count = items.filter(item => {
            const created = new Date(item.created_at)
            return (
                created.getFullYear() === d.getFullYear() &&
                created.getMonth() === d.getMonth() &&
                created.getDate() === d.getDate()
            )
        }).length
        result.push({ label, count })
    }
    return result
}

/** Group by month (last N months) */
function groupByMonth<T extends { created_at: string }>(
    items: T[],
    months = 6
): { label: string; count: number }[] {
    const now = new Date()
    const result: { label: string; count: number }[] = []

    for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const label = fmtMonth(d.toISOString())
        const count = items.filter(item => {
            const created = new Date(item.created_at)
            return (
                created.getFullYear() === d.getFullYear() &&
                created.getMonth() === d.getMonth()
            )
        }).length
        result.push({ label, count })
    }
    return result
}

// ─── Sub-chart: Growth Area Chart ─────────────────────────────────────────────

interface GrowthChartProps {
    users: User[]
    analysis: AnalysisListItem[]
    interpretasi: AnalysisInterpretasiAI[]
}

function GrowthChart({ users, analysis, interpretasi }: GrowthChartProps) {
    const [range, setRange] = useState<'7d' | '30d' | '6m'>('7d')

    const { categories, userSeries, analysisSeries, interpretasiSeries } = useMemo(() => {
        if (range === '6m') {
            const ud = groupByMonth(users as User[], 6)
            const ad = groupByMonth(analysis as AnalysisListItem[], 6)
            const id = groupByMonth(interpretasi as AnalysisInterpretasiAI[], 6)
            return {
                categories: ud.map(d => d.label),
                userSeries: ud.map(d => d.count),
                analysisSeries: ad.map(d => d.count),
                interpretasiSeries: id.map(d => d.count),
            }
        }
        const days = range === '30d' ? 30 : 7
        const ud = groupByDay(users as User[], days)
        const ad = groupByDay(analysis as AnalysisListItem[], days)
        const id = groupByDay(interpretasi as AnalysisInterpretasiAI[], days)
        return {
            categories: ud.map(d => d.label),
            userSeries: ud.map(d => d.count),
            analysisSeries: ad.map(d => d.count),
            interpretasiSeries: id.map(d => d.count),
        }
    }, [range, users, analysis, interpretasi])

    const options: ApexCharts.ApexOptions = {
        chart: {
            type: 'area',
            toolbar: { show: false },
            fontFamily: 'inherit',
            background: 'transparent',
            animations: { enabled: true, speed: 600 },
        },
        colors: ['#3b82f6', '#8b5cf6', '#10b981'],
        fill: {
            type: 'gradient',
            gradient: { opacityFrom: 0.3, opacityTo: 0.02, shadeIntensity: 0.8 },
        },
        stroke: { width: 2, curve: 'smooth' },
        xaxis: {
            categories,
            labels: {
                style: { fontSize: '11px', colors: '#94a3b8' },
                rotate: -30,
                rotateAlways: range === '30d',
                hideOverlappingLabels: true,
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            labels: {
                style: { fontSize: '11px', colors: '#94a3b8' },
                formatter: (v) => (v % 1 === 0 ? String(v) : ''),
            },
            min: 0,
        },
        grid: {
            borderColor: '#e2e8f0',
            strokeDashArray: 4,
            xaxis: { lines: { show: false } },
        },
        dataLabels: { enabled: false },
        legend: {
            position: 'top',
            horizontalAlign: 'right',
            fontSize: '12px',
            fontFamily: 'inherit',
            markers: { size: 8 },
            itemMargin: { horizontal: 10 },
        },
        tooltip: {
            theme: 'dark',
            y: { formatter: (v) => `${v} item` },
        },
    }

    const series = [
        { name: 'Pengguna', data: userSeries },
        { name: 'Analisis', data: analysisSeries },
        { name: 'Interpretasi', data: interpretasiSeries },
    ]

    return (
        <div className="bg-white rounded-sm border border-neutral-200 shadow-sm p-5 space-y-3">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-neutral-800">Pertumbuhan Aktivitas</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">Pengguna, Analisis & Interpretasi</p>
                </div>
                <div className="flex gap-2 p-0.5">
                    {(['7d', '30d', '6m'] as const).map(r => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`px-2.5 py-1 rounded-sm text-xs font-medium 
                                border border-neutral-50 hover:border-neutral-400
                                hover:shadow-[-5px_5px_0_rgba(26,26,46,1)] hover:-translate-y-0.5
                                transition-all duration-200 ease-in-out
                                ${range === r
                                    ? 'bg-neutral-50 border-neutral-400 shadow-[-5px_5px_0_rgba(26,26,46,1)] -translate-y-0.5 text-neutral-900'
                                    : 'text-neutral-700 hover:text-neutral-900'}`}
                        >
                            {r === '7d' ? '7 Hari' : r === '30d' ? '30 Hari' : '6 Bulan'}
                        </button>
                    ))}
                </div>
            </div>
            <Chart options={options} series={series} type="area" height={260} />
        </div>
    )
}

// ─── Sub-chart: Threat Status Donut ───────────────────────────────────────────

interface ThreatDonutProps {
    interpretasi: AnalysisInterpretasiAI[]
}

function ThreatDonut({ interpretasi }: ThreatDonutProps) {
    const { aman, mencurigakan, berbahaya } = useMemo(() => {
        let aman = 0, mencurigakan = 0, berbahaya = 0
        interpretasi
            .filter(i => !i.deleted_at)
            .flatMap(i => i.hasil ?? [])
            .forEach(h => {
                if (h.status_ancaman === 'Berbahaya') berbahaya++
                else if (h.status_ancaman === 'Mencurigakan') mencurigakan++
                else aman++
            })
        return { aman, mencurigakan, berbahaya }
    }, [interpretasi])

    const total = aman + mencurigakan + berbahaya

    const options: ApexCharts.ApexOptions = {
        chart: { type: 'donut', fontFamily: 'inherit', background: 'transparent' },
        colors: ['#10b981', '#f59e0b', '#ef4444'],
        labels: ['Aman', 'Mencurigakan', 'Berbahaya'],
        legend: {
            position: 'bottom',
            fontSize: '12px',
            fontFamily: 'inherit',
            markers: { size: 8 },
            itemMargin: { horizontal: 8, vertical: 4 },
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '65%',
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            fontSize: '12px',
                            color: '#64748b',
                            offsetY: -4,
                        },
                        value: {
                            show: true,
                            fontSize: '22px',
                            fontWeight: 700,
                            color: '#1e293b',
                            offsetY: 4,
                        },
                        total: {
                            show: true,
                            label: 'Total',
                            fontSize: '12px',
                            color: '#94a3b8',
                            formatter: () => String(total),
                        },
                    },
                },
            },
        },
        dataLabels: { enabled: false },
        stroke: { width: 0 },
        tooltip: { y: { formatter: (v) => `${v} teknik` } },
    }

    return (
        <div className="bg-white rounded-sm border border-neutral-200 shadow-sm p-5 space-y-3">
            <div>
                <h3 className="text-sm font-semibold text-neutral-800">Status Ancaman</h3>
                <p className="text-xs text-neutral-400 mt-0.5">Distribusi hasil interpretasi AI</p>
            </div>
            {total === 0 ? (
                <div className="flex items-center justify-center h-64 text-sm text-neutral-400">
                    Belum ada data interpretasi
                </div>
            ) : (
                <Chart
                    options={options}
                    series={[aman, mencurigakan, berbahaya]}
                    type="donut"
                    height={260}
                />
            )}
        </div>
    )
}

// ─── Sub-chart: Analysis Bar (top 7 recent) ───────────────────────────────────

interface AnalysisBarProps {
    analysis: AnalysisListItem[]
}

function AnalysisStatusBar({ analysis }: AnalysisBarProps) {
    const { withDecode, withAI, noData, categories } = useMemo(() => {
        const recent = [...analysis]
            .filter(a => !a.deleted_at)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 10)

        // Format manual agar konsisten di semua environment (tidak bergantung locale)
        const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
        const pad = (n: number) => String(n).padStart(2, '0')

        const seen = new Set<string>()
        const uniqueLabels = recent.map(a => {
            const d = new Date(a.created_at)
            const tgl = `${pad(d.getDate())} ${BULAN[d.getMonth()]}`
            const jam = `${pad(d.getHours())}:${pad(d.getMinutes())}`
            let label = `${tgl} ${jam}`

            // Jika masih bentrok (menit sama), tambah detik
            if (seen.has(label)) {
                label = `${tgl} ${jam}:${pad(d.getSeconds())}`
            }
            // Jika masih bentrok juga (sangat jarang), tambah ms
            if (seen.has(label)) {
                label = `${label}.${d.getMilliseconds()}`
            }
            seen.add(label)
            return label
        })

        return {
            categories: uniqueLabels,
            withDecode: recent.map(a => (a.force_decode ? 1 : 0)),
            withAI: recent.map(a => (a.ai_interpretasi ? 1 : 0)),
            noData: recent.map(a => (!a.force_decode ? 1 : 0)),
        }
    }, [analysis])

    const options: ApexCharts.ApexOptions = {
        chart: {
            type: 'bar',
            stacked: true,
            toolbar: { show: false },
            fontFamily: 'inherit',
            background: 'transparent',
            animations: { enabled: true, speed: 600 },
        },
        colors: ['#8b5cf6', '#10b981', '#e2e8f0'],
        plotOptions: {
            bar: {
                borderRadius: 4,
                columnWidth: '55%',
                borderRadiusApplication: 'end',
            },
        },
        xaxis: {
            categories,
            tickPlacement: 'on',
            labels: {
                style: { fontSize: '9px', colors: '#94a3b8' },
                rotate: -45,
                rotateAlways: true,
                trim: false,
                hideOverlappingLabels: false,
                maxHeight: 90,
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            labels: {
                style: { fontSize: '11px', colors: '#94a3b8' },
                formatter: (v) => (v % 1 === 0 ? String(v) : ''),
            },
            max: 1,
        },
        grid: {
            borderColor: '#e2e8f0',
            strokeDashArray: 4,
            xaxis: { lines: { show: false } },
        },
        dataLabels: { enabled: false },
        legend: {
            position: 'top',
            horizontalAlign: 'right',
            fontSize: '12px',
            fontFamily: 'inherit',
            markers: { size: 8 },
            itemMargin: { horizontal: 10 },
        },
        tooltip: {
            theme: 'dark',
            y: {
                formatter: (v) => (v === 1 ? 'Ya' : 'Tidak'),
            },
        },
    }

    const series = [
        { name: 'Ada Force Decode', data: withDecode },
        { name: 'Ada Interpretasi AI', data: withAI },
        { name: 'Belum Diproses', data: noData },
    ]

    return (
        <div className="bg-white rounded-sm border border-neutral-200 shadow-sm p-5 space-y-3">
            <div>
                <h3 className="text-sm font-semibold text-neutral-800">Status Analisis Terbaru</h3>
                <p className="text-xs text-neutral-400 mt-0.5">10 analisis paling baru</p>
            </div>
            {analysis.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-sm text-neutral-400">
                    Belum ada data analisis
                </div>
            ) : (
                <Chart options={options} series={series} type="bar" height={300} />
            )}
        </div>
    )
}

// ─── Sub-chart: User Role Radial ───────────────────────────────────────────────

interface UserRadialProps {
    users: User[]
}

function UserRoleRadial({ users }: UserRadialProps) {
    const { superadmin, pengguna, verified } = useMemo(() => {
        const active = users.filter(u => !u.deleted_at)
        return {
            superadmin: active.filter(u => u.role === 'superadmin').length,
            pengguna: active.filter(u => u.role === 'pengguna').length,
            verified: active.filter(u => u.is_verified).length,
        }
    }, [users])

    const total = superadmin + pengguna
    const verifiedPct = total > 0 ? Math.round((verified / total) * 100) : 0
    const superadminPct = total > 0 ? Math.round((superadmin / total) * 100) : 0

    const options: ApexCharts.ApexOptions = {
        chart: { type: 'radialBar', fontFamily: 'inherit', background: 'transparent' },
        colors: ['#3b82f6', '#8b5cf6', '#10b981'],
        plotOptions: {
            radialBar: {
                hollow: { size: '30%' },
                track: { background: '#f1f5f9', strokeWidth: '97%' },
                dataLabels: {
                    name: { fontSize: '12px', color: '#64748b', offsetY: -4 },
                    value: { fontSize: '16px', fontWeight: 700, color: '#1e293b', offsetY: 4 },
                    total: {
                        show: true,
                        label: 'Total Aktif',
                        fontSize: '11px',
                        color: '#94a3b8',
                        formatter: () => String(total),
                    },
                },
            },
        },
        labels: ['Pengguna', 'Superadmin', 'Terverifikasi'],
        legend: {
            show: true,
            position: 'bottom',
            fontSize: '12px',
            fontFamily: 'inherit',
            markers: { size: 8 },
            itemMargin: { horizontal: 8, vertical: 4 },
        },
        stroke: { lineCap: 'round' },
        dataLabels: { enabled: false },
    }

    return (
        <div className="bg-white rounded-sm border border-neutral-200 shadow-sm p-5 space-y-3">
            <div>
                <h3 className="text-sm font-semibold text-neutral-800">Distribusi Pengguna</h3>
                <p className="text-xs text-neutral-400 mt-0.5">Role & status verifikasi</p>
            </div>
            {total === 0 ? (
                <div className="flex items-center justify-center h-64 text-sm text-neutral-400">
                    Belum ada pengguna
                </div>
            ) : (
                <Chart
                    options={options}
                    series={[
                        total > 0 ? Math.round((pengguna / total) * 100) : 0,
                        superadminPct,
                        verifiedPct,
                    ]}
                    type="radialBar"
                    height={260}
                />
            )}
        </div>
    )
}

// ─── Main Export ──────────────────────────────────────────────────────────────

interface ChartDashboardProps {
    users: User[]
    analysis: AnalysisListItem[]
    interpretasi: AnalysisInterpretasiAI[]
}

export function ChartDashboard({ users, analysis, interpretasi }: ChartDashboardProps) {
    return (
        <div className="space-y-4">
            {/* Full-width area chart */}
            <GrowthChart users={users} analysis={analysis} interpretasi={interpretasi} />

            {/* 3-column grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <ThreatDonut interpretasi={interpretasi} />
                <UserRoleRadial users={users} />
                <AnalysisStatusBar analysis={analysis} />
            </div>
        </div>
    )
}
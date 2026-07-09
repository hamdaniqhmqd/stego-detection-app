// src/

import { User } from "@/types/Users"
import { useMemo } from "react"
import { Chart } from "./ChartDashboard"

interface UserRadialProps {
    users: User[];
    totalPengguna: number;
    totalSuperadmin: number;
    totalVerified: number;
}

export default function ChartUserRoleRadial({ users, totalPengguna, totalSuperadmin, totalVerified }: UserRadialProps) {
    const { superadmin, pengguna, verified } = useMemo(() => {
        return {
            superadmin: totalSuperadmin,
            pengguna: totalPengguna,
            verified: totalVerified,
        }
    }, [users, totalPengguna, totalSuperadmin, totalVerified])

    const total = totalSuperadmin + totalPengguna

    const options: ApexCharts.ApexOptions = {
        chart: { type: 'radialBar', fontFamily: 'inherit', background: 'transparent' },
        colors: ['#3b82f6', '#8b5cf6', '#10b981'],
        plotOptions: {
            radialBar: {
                hollow: { size: '30%' },
                track: { background: '#f1f5f9', strokeWidth: '97%' },
                dataLabels: {
                    name: { fontSize: '12px', color: '#64748b', offsetY: -4 },
                    value: {
                        fontSize: '16px',
                        fontWeight: 700,
                        color: '#1e293b',
                        offsetY: 4,
                        // Tampilkan angka asli, bukan persen
                        formatter: () => String(total),
                    },
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
            // Tampilkan angka asli di legend juga
            formatter: (seriesName, opts) => {
                const idx = opts?.seriesIndex
                if (idx === 0) return `${seriesName}: ${pengguna}`
                if (idx === 1) return `${seriesName}: ${superadmin}`
                if (idx === 2) return `${seriesName}: ${verified}`
                return seriesName
            },
        },
        stroke: { lineCap: 'round' },
        dataLabels: { enabled: false },
        // Tooltip juga tampilkan angka asli
        tooltip: {
            enabled: true,
            y: {
                formatter: (val, opts) => {
                    const idx = opts?.seriesIndex
                    if (idx === 0) return `${pengguna} pengguna`
                    if (idx === 1) return `${superadmin} superadmin`
                    if (idx === 2) return `${verified} terverifikasi`
                    return String(val)
                },
            },
        },
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
                        total > 0 ? Math.round((totalPengguna / total) * 100) : 0,
                        totalSuperadmin > 0 ? Math.round((totalSuperadmin / total) * 100) : 0,
                        totalVerified > 0 ? Math.round((totalVerified / total) * 100) : 0,
                    ]}
                    type="radialBar"
                    height={260}
                />
            )}
        </div>
    )
}
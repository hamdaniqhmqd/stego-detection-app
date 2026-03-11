// src/

import { User } from "@/types/Users"
import { useMemo } from "react"
import { Chart } from "./ChartDashboard"

interface UserRadialProps {
    users: User[]
}

export default function ChartUserRoleRadial({ users }: UserRadialProps) {
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
// src/components/Chart/ChartThreatDonut.tsx

import { AnalysisInterpretasiAI } from "@/types/analysis"
import { useMemo } from "react"
import { Chart } from "./ChartDashboard"

interface ThreatDonutProps {
    interpretasi: AnalysisInterpretasiAI[]
}

export default function ChartThreatDonut({ interpretasi }: ThreatDonutProps) {
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
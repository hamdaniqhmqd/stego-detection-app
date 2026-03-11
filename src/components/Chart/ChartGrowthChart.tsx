// src/components/Chart/ChartGrowthChart.tsx

import { AnalysisListItem } from "@/hooks/useAnalysis"
import { AnalysisInterpretasiAI } from "@/types/analysis"
import { User } from "@/types/Users"
import { groupByDay, groupByMonth } from "@/utils/format"
import { useMemo, useState } from "react"
import { Chart } from "./ChartDashboard"

interface GrowthChartProps {
    users: User[]
    analysis: AnalysisListItem[]
    interpretasi: AnalysisInterpretasiAI[]
}

export function ChartGrowthChart({ users, analysis, interpretasi }: GrowthChartProps) {
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
                                    ? 'border-neutral-400 shadow-[-5px_5px_0_rgba(26,26,46,1)] -translate-y-0.5 text-neutral-900'
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
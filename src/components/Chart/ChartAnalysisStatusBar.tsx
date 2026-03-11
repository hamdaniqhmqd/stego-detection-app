// src/components/Chart/ChartAnalysisStatusBar.tsx

import { AnalysisListItem } from "@/hooks/useAnalysis"
import { useMemo } from "react"
import { Chart } from "./ChartDashboard"

interface AnalysisBarProps {
    analysis: AnalysisListItem[]
}

export default function ChartAnalysisStatusBar({ analysis }: AnalysisBarProps) {
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
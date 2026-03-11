// components/Dashboard/ChartDashboard.tsx
'use client'

import dynamic from 'next/dynamic'
import type { AnalysisListItem } from '@/hooks/useAnalysis'
import type { AnalysisInterpretasiAI } from '@/types/analysis'
import type { User } from '@/types/Users'
import ChartUserRoleRadial from './ChartUserRoleRadial'
import { ChartGrowthChart } from './ChartGrowthChart'
import ChartThreatDonut from './ChartThreatDonut'
import ChartAnalysisStatusBar from './ChartAnalysisStatusBar'

export const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface ChartDashboardProps {
    users: User[]
    analysis: AnalysisListItem[]
    interpretasi: AnalysisInterpretasiAI[]
}

export function ChartDashboard({ users, analysis, interpretasi }: ChartDashboardProps) {
    return (
        <div className="space-y-4">
            {/* Full-width area chart */}
            <ChartGrowthChart users={users} analysis={analysis} interpretasi={interpretasi} />

            {/* 3-column grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <ChartThreatDonut interpretasi={interpretasi} />
                <ChartUserRoleRadial users={users} />
                <ChartAnalysisStatusBar analysis={analysis} />
            </div>
        </div>
    )
}
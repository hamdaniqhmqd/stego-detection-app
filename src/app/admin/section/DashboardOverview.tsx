// components/Dashboard/DashboardOverview.tsx

'use client'

import React, { useState } from 'react'
import { StatCard } from '@/components/Card/StatCard'
import type { AnalysisInterpretasiAI } from '@/types/analysis'
import type { AnalysisListItem } from '@/hooks/useAnalysis'
import type { User } from '@/types/Users'
import { ChartDashboard } from '@/components/Chart/ChartDashboard'
import { Tooltip } from '@/components/Ui/ToolTip'
import { StatusAncaman } from '@/types/aiInterpretasi'

interface DashboardOverviewProps {
    users: User[]
    usersTotal: number

    analysis: AnalysisListItem[]
    analysisTotal: number

    interpretasi: AnalysisInterpretasiAI[]
    interpretasiTotal: number
}

export function DashboardOverview({
    users, usersTotal,

    analysis, analysisTotal,

    interpretasi, interpretasiTotal,
}: DashboardOverviewProps) {

    // Stat counts
    const activeUsers = users.filter(u => !u.deleted_at).length
    const activeAnalysis = analysis.filter(a => !a.deleted_at).length
    const activeInterp = interpretasi.filter(i => !i.deleted_at).length
    const berbahayaCount = interpretasi
        .filter(i => !i.deleted_at)
        .flatMap(i => i.hasil ?? [])
        .filter(h => (h.status_ancaman as StatusAncaman) === 'Berbahaya')
        .length

    return (
        <div className="space-y-8">

            {/* Stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Tooltip text="Total seluruh akun pengguna yang telah terdaftar dalam sistem, termasuk pengguna aktif.">
                    <StatCard
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256">
                                <path d="M136,108A52,52,0,1,1,84,56,52,52,0,0,1,136,108Z" opacity="0.2"></path>
                                <path d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z"></path>
                            </svg>
                        }
                        label="Pengguna"
                        value={usersTotal || activeUsers}
                        sub="Akun terdaftar"
                        accent="blue"
                    />
                </Tooltip>

                <Tooltip text="Jumlah proses analisis yang telah berhasil diselesaikan oleh sistem.">
                    <StatCard
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256">
                                <path d="M192,112a80,80,0,1,1-80-80A80,80,0,0,1,192,112Z" opacity="0.2"></path>
                                <path d="M229.66,218.34,179.6,168.28a88.21,88.21,0,1,0-11.32,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                            </svg>
                        }
                        label="Analisis"
                        value={analysisTotal || activeAnalysis}
                        sub="Proses selesai"
                        accent="violet"
                    />
                </Tooltip>

                <Tooltip text="Total hasil interpretasi yang dihasilkan oleh AI dari proses analisis yang ada.">
                    <StatCard
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256"><path d="M200,56H56A24,24,0,0,0,32,80V192a24,24,0,0,0,24,24H200a24,24,0,0,0,24-24V80A24,24,0,0,0,200,56ZM164,184H92a20,20,0,0,1,0-40h72a20,20,0,0,1,0,40Z" opacity="0.2"></path><path d="M200,48H136V16a8,8,0,0,0-16,0V48H56A32,32,0,0,0,24,80V192a32,32,0,0,0,32,32H200a32,32,0,0,0,32-32V80A32,32,0,0,0,200,48Zm16,144a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V80A16,16,0,0,1,56,64H200a16,16,0,0,1,16,16ZM72,108a12,12,0,1,1,12,12A12,12,0,0,1,72,108Zm88,0a12,12,0,1,1,12,12A12,12,0,0,1,160,108Zm4,28H92a28,28,0,0,0,0,56h72a28,28,0,0,0,0-56Zm-24,16v24H116V152ZM80,164a12,12,0,0,1,12-12h8v24H92A12,12,0,0,1,80,164Zm84,12h-8V152h8a12,12,0,0,1,0,24Z"></path></svg>
                        }
                        label="Interpretasi"
                        value={interpretasiTotal || activeInterp}
                        sub="Hasil AI"
                        accent="emerald"
                    />
                </Tooltip>

                <Tooltip text="Jumlah hasil interpretasi AI yang terdeteksi berstatus 'Berbahaya' dan memerlukan tindakan segera.">
                    <StatCard
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256">
                                <path d="M215.46,216H40.54C27.92,216,20,202.79,26.13,192.09L113.59,40.22c6.3-11,22.52-11,28.82,0l87.46,151.87C236,202.79,228.08,216,215.46,216Z" opacity="0.2"></path><path d="M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM222.93,203.8a8.5,8.5,0,0,1-7.48,4.2H40.55a8.5,8.5,0,0,1-7.48-4.2,7.59,7.59,0,0,1,0-7.72L120.52,44.21a8.75,8.75,0,0,1,15,0l87.45,151.87A7.59,7.59,0,0,1,222.93,203.8ZM120,144V104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,180Z"></path>
                            </svg>
                        }
                        label="Berbahaya"
                        value={berbahayaCount}
                        sub="Perlu perhatian"
                        accent="amber"
                    />
                </Tooltip>
            </div>

            <ChartDashboard
                users={users as User[]}
                analysis={analysis}
                interpretasi={interpretasi}
            />

        </div>
    )
}

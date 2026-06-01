import { SkeletonBlock } from "./SkeletonBlock";

export function SkeletonInterpretasiDetail() {
    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">

            {/* Page header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <SkeletonBlock className="w-8 h-8 rounded-sm" />
                    <div className="flex items-center gap-2">
                        <SkeletonBlock className="w-24 h-3" />
                        <SkeletonBlock className="w-2 h-3" />
                        <SkeletonBlock className="w-12 h-3" />
                    </div>
                </div>
                <SkeletonBlock className="w-8 h-8 rounded-sm" />
            </div>

            {/* AI Summary bar */}
            <SkeletonBlock className="w-full h-12 rounded-sm" />

            {/* 2-col info grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Kiri */}
                <div className="space-y-5">
                    {/* Pengguna */}
                    <div className="border border-neutral-100 rounded-sm p-4 space-y-3">
                        <SkeletonBlock className="w-24 h-3" />
                        <div className="flex items-center gap-3">
                            <SkeletonBlock className="w-10 h-10 rounded-full" />
                            <div className="space-y-1.5">
                                <SkeletonBlock className="w-28 h-3.5" />
                                <SkeletonBlock className="w-36 h-3" />
                            </div>
                        </div>
                    </div>

                    {/* File Analisis */}
                    <div className="border border-neutral-100 rounded-sm p-4 space-y-3">
                        <SkeletonBlock className="w-24 h-3" />
                        <SkeletonBlock className="w-full h-44 rounded-sm" />
                        <SkeletonBlock className="w-48 h-2.5" />
                    </div>
                </div>

                {/* Kanan */}
                <div className="space-y-5">
                    {/* Info Analisis */}
                    <div className="border border-neutral-100 rounded-sm p-4 space-y-3">
                        <SkeletonBlock className="w-28 h-3" />
                        <div className="grid grid-cols-2 gap-4">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="space-y-1.5">
                                    <SkeletonBlock className="w-14 h-2.5" />
                                    <SkeletonBlock className="w-full h-5 rounded-sm" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Force Decode */}
                    <div className="border border-neutral-100 rounded-sm p-4 space-y-3">
                        <SkeletonBlock className="w-28 h-3" />
                        <div className="grid grid-cols-2 gap-4">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="space-y-1.5">
                                    <SkeletonBlock className="w-14 h-2.5" />
                                    <SkeletonBlock className="w-full h-7 rounded-sm" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Info Interpretasi */}
                    <div className="border border-neutral-100 rounded-sm p-4 space-y-3">
                        <SkeletonBlock className="w-32 h-3" />
                        <div className="grid grid-cols-2 gap-4">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="space-y-1.5">
                                    <SkeletonBlock className="w-16 h-2.5" />
                                    <SkeletonBlock className="w-full h-7 rounded-sm" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Token Usage */}
            <div className="border border-neutral-100 rounded-sm p-4 space-y-4">
                <SkeletonBlock className="w-40 h-3" />
                <div className="grid grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="border border-neutral-100 rounded-sm p-3 space-y-2">
                            <SkeletonBlock className="w-16 h-7" />
                            <SkeletonBlock className="w-20 h-2.5" />
                        </div>
                    ))}
                </div>
                {/* Per-kombinasi rows */}
                <div className="space-y-2 mt-2">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-2.5
                            rounded-sm border border-neutral-100">
                            <SkeletonBlock className="w-48 h-3" />
                            <div className="flex items-center gap-3">
                                <SkeletonBlock className="w-16 h-3" />
                                <SkeletonBlock className="w-16 h-3" />
                                <SkeletonBlock className="w-16 h-3" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Hasil Interpretasi header */}
            <div className="border border-neutral-100 rounded-sm p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="space-y-1.5">
                        <SkeletonBlock className="w-44 h-3.5" />
                        <SkeletonBlock className="w-60 h-3" />
                    </div>
                    <div className="flex items-center gap-2">
                        <SkeletonBlock className="w-10 h-5 rounded-full" />
                        <SkeletonBlock className="w-10 h-5 rounded-full" />
                        <SkeletonBlock className="w-10 h-5 rounded-full" />
                    </div>
                </div>
                {/* Teknik rows */}
                <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                        <SkeletonBlock key={i} className="w-full h-12 rounded-sm" />
                    ))}
                </div>
            </div>
        </div>
    )
}
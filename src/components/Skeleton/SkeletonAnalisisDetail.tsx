import { SkeletonBlock } from "./SkeletonBlock";

export function SkeletonAnalisisDetail() {
    return (
        <div className="max-w-7xl mx-auto space-y-8">

            {/* Page header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <SkeletonBlock className="w-8 h-8 rounded-sm" />
                    <div className="flex items-center gap-2">
                        <SkeletonBlock className="w-16 h-3" />
                        <SkeletonBlock className="w-2 h-3" />
                        <SkeletonBlock className="w-12 h-3" />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <SkeletonBlock className="w-20 h-7 rounded-sm" />
                    <SkeletonBlock className="w-8 h-8 rounded-sm" />
                </div>
            </div>

            {/* 2-col info grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Kiri: Pengguna + File Preview */}
                <div className="space-y-4">
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

                    {/* File Preview */}
                    <div className="border border-neutral-100 rounded-sm p-4 space-y-3">
                        <SkeletonBlock className="w-24 h-3" />
                        <SkeletonBlock className="w-full h-44 rounded-sm" />
                    </div>
                </div>

                {/* Kanan: Info Analisis + Force Decode + Teknik */}
                <div className="space-y-4">
                    {/* Info Analisis */}
                    <div className="border border-neutral-100 rounded-sm p-4 space-y-3">
                        <SkeletonBlock className="w-28 h-3" />
                        <div className="grid grid-cols-3 gap-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="space-y-1.5">
                                    <SkeletonBlock className="w-14 h-2.5" />
                                    <SkeletonBlock className="w-20 h-5 rounded-sm" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Force Decode */}
                    <div className="border border-neutral-100 rounded-sm p-4 space-y-3">
                        <SkeletonBlock className="w-28 h-3" />
                        <div className="grid grid-cols-3 gap-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="space-y-1.5">
                                    <SkeletonBlock className="w-14 h-2.5" />
                                    <SkeletonBlock className="w-24 h-7 rounded-sm" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Teknik (8 baris) */}
                    <div className="border border-neutral-100 rounded-sm p-4 space-y-3">
                        <SkeletonBlock className="w-32 h-3" />
                        <div className="space-y-2">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="flex items-center justify-between px-3 py-2
                                    rounded-sm bg-neutral-50 border border-neutral-100">
                                    <SkeletonBlock className="w-40 h-3" />
                                    <div className="flex items-center gap-1">
                                        <SkeletonBlock className="w-5 h-5 rounded" />
                                        <SkeletonBlock className="w-5 h-5 rounded" />
                                        <SkeletonBlock className="w-5 h-5 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Hasil Analisis header */}
            <div className="border border-neutral-100 rounded-sm p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="space-y-1.5">
                        <SkeletonBlock className="w-36 h-3.5" />
                        <SkeletonBlock className="w-64 h-3" />
                    </div>
                    <div className="flex gap-2">
                        <SkeletonBlock className="w-20 h-10 rounded-sm" />
                        <SkeletonBlock className="w-20 h-10 rounded-sm" />
                    </div>
                </div>
            </div>

            {/* Teknik blocks (8 accordion) */}
            <div className="space-y-3">
                {[...Array(8)].map((_, i) => (
                    <SkeletonBlock key={i} className="w-full h-12 rounded-sm" />
                ))}
            </div>
        </div>
    )
}
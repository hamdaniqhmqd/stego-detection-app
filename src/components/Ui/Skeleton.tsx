export function SkeletonBlock({ className }: { className?: string }) {
    return <div className={`bg-neutral-100 rounded animate-pulse ${className}`} />
}

export function PageSkeleton() {
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3">
                <SkeletonBlock className="w-8 h-8 rounded-sm" />
                <div className="space-y-1.5">
                    <SkeletonBlock className="w-48 h-4" />
                    <SkeletonBlock className="w-32 h-3" />
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                    <SkeletonBlock className="w-full h-48 rounded-xl" />
                    <SkeletonBlock className="w-full h-20 rounded-xl" />
                    <SkeletonBlock className="w-full h-32 rounded-xl" />
                </div>
                <div className="lg:col-span-2 space-y-4">
                    <SkeletonBlock className="w-full h-16 rounded-xl" />
                    <SkeletonBlock className="w-full h-64 rounded-xl" />
                </div>
            </div>
        </div>
    )
}
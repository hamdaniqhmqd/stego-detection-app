export function SkeletonItem() {
    return (
        <div className="flex flex-col gap-1.5 px-3.5 py-3 rounded-lg">
            <div className="h-2.5 w-24 bg-gray-800 rounded animate-pulse" />
            <div className="h-2 w-16 bg-gray-800/60 rounded animate-pulse" />
        </div>
    )
}
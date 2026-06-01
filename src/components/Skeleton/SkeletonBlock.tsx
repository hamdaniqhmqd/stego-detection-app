export function SkeletonBlock({ className }: { className?: string }) {
    return <div className={`bg-neutral-100 rounded animate-pulse ${className}`} />
}
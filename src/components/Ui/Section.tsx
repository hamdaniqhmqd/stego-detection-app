export default function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <h3 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest
                pb-2 border-b border-neutral-200">
                {title}
            </h3>
            {children}
        </div>
    )
}
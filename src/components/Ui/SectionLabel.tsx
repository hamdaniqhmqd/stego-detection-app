export default function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2 text-xs tracking-widest uppercase font-normal text-neutral-900 mb-4">
            <span className="shrink-0flex items-center gap-1">{children}</span>
            <div className="flex-1 h-px bg-neutral-300" />
        </div>
    );
}
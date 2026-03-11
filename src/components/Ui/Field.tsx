import { Tooltip } from "./ToolTip";

export function Field({ label, tooltip, children }: { label: string; tooltip?: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1">
            {tooltip ? (
                <Tooltip text={tooltip}>
                    <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wide
                        cursor-default underline decoration-dotted decoration-neutral-300 w-fit">
                        {label}
                    </span>
                </Tooltip>
            ) : (
                <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wide">{label}</span>
            )}
            <div className="text-sm text-neutral-800">{children}</div>
        </div>
    )
}
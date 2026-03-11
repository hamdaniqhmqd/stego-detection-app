import { StatusAncaman } from "@/types/aiInterpretasi";
import { STATUS_COLOR, STATUS_DOT } from "@/utils/Channel";

export function StatusBadge({ status }: { status: StatusAncaman }) {
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5
            rounded-full text-xs font-medium border ${STATUS_COLOR[status]}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />
            {status}
        </span>
    )
}
// src/app/components/Ui/RiwayatItemRow.tsx

import { RiwayatItem } from "@/hooks/useRiwayatAnalisis";
import { formatDateTime } from "@/utils/format";
import Link from "next/link";

export function RiwayatItemRow({ item, isActive }: { item: RiwayatItem; isActive: boolean }) {
    return (
        <li className="">
            <Link
                href={`/dashboard/analisis_stego/${item.id}`}
                className={`flex flex-col px-3.5 py-2.5 rounded-sm transition-all duration-300 ease-in-out
                border border-neutral-900
                ${isActive ? 'bg-neutral-200 hover:-translate-y-0.5 hover:shadow-[-5px_5px_0_rgba(26,26,46,1)]'
                        : 'bg-neutral-100 hover:-translate-y-0.5 hover:shadow-[-5px_5px_0_rgba(26,26,46,1)]'}`}
            >
                <span className="text-xs font-medium line-clamp-1 text-nowrap text-neutral-900">
                    {formatDateTime(item.created_at)}
                </span>
                <span className={`text-xs line-clamp-1 text-nowrap ${isActive ? 'text-neutral-800' : 'text-neutral-600 group-hover:text-neutral-500'}`}>
                    {item.teknik_count > 0
                        ? `${item.teknik_count} kombinasi`
                        : item.metode ?? 'force-decode'
                    }
                </span>
            </Link>
        </li>
    )
}
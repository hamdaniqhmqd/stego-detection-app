// src/app/components/Ui/RiwayatItemRow.tsx

import { RiwayatItem } from "@/hooks/useRiwayatAnalisis";
import { formatDateTime } from "@/utils/format";
import Link from "next/link";

export function RiwayatItemRow({ item, isActive }: { item: RiwayatItem; isActive: boolean }) {
    return (
        <Link
            href={`/dashboard/analisis_stego/${item.id}`}
            className={`flex flex-col px-3.5 py-2 rounded-lg transition-colors duration-150 group
                ${isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                }`}
        >
            <span className="text-xs font-medium line-clamp-1 text-nowrap">
                {formatDateTime(item.created_at)}
            </span>
            <span className={`text-xs line-clamp-1 text-nowrap ${isActive ? 'text-gray-400' : 'text-gray-600 group-hover:text-gray-500'}`}>
                {item.teknik_count > 0
                    ? `${item.teknik_count} kombinasi`
                    : item.metode ?? 'force-decode'
                }
            </span>
        </Link>
    )
}
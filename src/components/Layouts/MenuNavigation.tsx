import { NavigationItem } from "@/types/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";

export
    function MenuNavigation({
        items,
        isCollapsed,
        className,
    }: {
        items: NavigationItem[]
        isCollapsed: boolean
        className?: string
    }) {
    const pathname = usePathname();

    return (
        <span className={className}>
            {items.map((menu, index) => {
                const isDirectActive = pathname === menu.href;
                return (
                    <li key={index} className="relative group my-2">
                        <Link
                            href={menu.href ?? '#'}
                            className={`flex items-center ${isCollapsed ? 'justify-center px-3.5 py-3' : 'px-3.5 py-3'} rounded-sm group border border-neutral-700 transition-all duration-300 ease-in-out
                                ${isDirectActive
                                    ? 'text-neutral-900 bg-neutral-200 hover:-translate-y-0.5 hover:shadow-[-5px_5px_0_rgba(26,26,46,1)]'
                                    : 'text-neutral-800 hover:text-neutral-900 hover:-translate-y-0.5 hover:shadow-[-5px_5px_0_rgba(26,26,46,1)]'
                                }`}
                        >
                            <span className={`${isCollapsed ? '' : 'shrink-0'}`}>
                                {menu.icon ?? ''}
                            </span>
                            {!isCollapsed && (
                                <span className="ms-2 font-medium line-clamp-1 text-nowrap text-sm">{menu.name}</span>
                            )}
                        </Link>

                        {/* Tooltip collapsed */}
                        {isCollapsed && (
                            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-neutral-900 text-white line-clamp-1 text-nowrap text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                                {menu.name}
                                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-neutral-900" />
                            </div>
                        )}
                    </li>
                );
            })}
        </span>
    );
}
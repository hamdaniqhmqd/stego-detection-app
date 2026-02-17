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
                    <li key={index} className="relative group my-1">
                        <Link
                            href={menu.href ?? '#'}
                            className={`flex items-center ${isCollapsed ? 'justify-center p-3' : 'px-3.5 py-2'} rounded-md group transition-colors duration-200
                                ${isDirectActive
                                    ? 'text-white bg-gray-900 hover:bg-gray-800'
                                    : 'text-gray-300 hover:text-white hover:bg-gray-900'
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
                            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 text-white line-clamp-1 text-nowrap text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                                {menu.name}
                                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                            </div>
                        )}
                    </li>
                );
            })}
        </span>
    );
}
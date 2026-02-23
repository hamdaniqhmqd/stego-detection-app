'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { navigationPengguna, navigationSuperadmin } from '@/data/Navigation';
import { useMemo } from 'react';
import { NavigationItem } from '@/types/navigation';
import { useAuth } from '@/provider/AuthProvider';
import Swal from 'sweetalert2';
import RiwayatAnalisisSidebar from './RiwayatAnalisisSidebar';
import { MenuNavigation } from './MenuNavigation';

export default function SidebarLayout({
    isMobileSidebarOpen,
    onCloseMobileSidebar,
    isDesktopSidebarOpen,
    onToggleDesktopSidebar,
}: Readonly<{
    isMobileSidebarOpen: boolean
    onCloseMobileSidebar: () => void
    onToggleDesktopSidebar: () => void
    isDesktopSidebarOpen: boolean
}>) {
    const { user, logout } = useAuth();
    const router = useRouter();

    const navigation = useMemo(() => {
        if (user?.role === 'superadmin') return navigationSuperadmin;
        return navigationPengguna;
    }, [user?.role]);

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Konfirmasi Logout',
            text: 'Apakah Anda yakin ingin keluar?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            background: '#fff',
            confirmButtonText: 'Ya, Logout',
            cancelButtonText: 'Batal',
        });

        if (result.isConfirmed) {
            Swal.fire({
                title: 'Sedang logout...',
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => { Swal.showLoading(); },
            });

            try {
                await logout();
                await Swal.fire({
                    title: 'Berhasil!',
                    text: 'Anda telah logout',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                });
                router.push('/auth/login');
            } catch {
                Swal.fire({
                    title: 'Gagal!',
                    text: 'Terjadi kesalahan saat logout',
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
            }
        }
    };

    // Desktop & Tablet Sidebar
    return (
        <>
            <aside
                id="sidebar-multi-level-sidebar"
                className={`hidden md:flex md:flex-col
                    ${!isDesktopSidebarOpen && 'lg:w-60 '}
                    h-full transition-all duration-300 bg-neutral-100`}
                aria-label="Sidebar"
            >
                {/* Header */}
                <div className="px-4 py-3 flex items-center justify-between">
                    {!isDesktopSidebarOpen && (
                        <Link href="/dashboard" className="hidden md:flex items-center text-lg font-semibold text-neutral-950 line-clamp-1 text-nowrap">
                            Deteksi Stego
                        </Link>
                    )}

                    <button
                        type="button"
                        onClick={onToggleDesktopSidebar}
                        className={`hidden md:block p-1 bg-neutral-100 rounded-sm border border-neutral-700 
                            text-neutral-950 transition-all duration-300 ease-in-out
                            ${isDesktopSidebarOpen ? 'rotate-180 mx-auto hover:-translate-y-0.5 hover:shadow-[5px_-5px_0_rgba(26,26,46,1)]'
                                : 'hover:-translate-y-0.5 hover:shadow-[-5px_5px_0_rgba(26,26,46,1)]'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14.29 6.29 8.59 12l5.7 5.71 1.42-1.42-4.3-4.29 4.3-4.29z" />
                        </svg>
                    </button>
                </div>

                {/* Navigation Menu */}
                <div className={`${isDesktopSidebarOpen ? 'flex-1' : 'shrink-0'} min-h-0 overflow-y-auto scrollbar_y_custom px-4`}>
                    {!isDesktopSidebarOpen && (
                        <p className="text-neutral-700 hidden md:block text-xs mb-2 font-normal line-clamp-1 text-nowrap">Menu</p>
                    )}
                    <ul className="font-medium space-y-1">
                        <MenuNavigation items={navigation} isCollapsed={true} className="sm:block md:hidden" />
                        <div className="hidden md:block">
                            <MenuNavigation items={navigation} isCollapsed={isDesktopSidebarOpen} />
                        </div>
                    </ul>
                </div>

                {/* Riwayat Analisis */}
                {!isDesktopSidebarOpen && (
                    <div className={`flex-1 min-h-0`}>

                        {/* Header section riwayat — hanya tampil di desktop expanded */}
                        <p className="text-neutral-700 hidden md:block text-xs font-normal line-clamp-1 text-nowrap px-4">
                            Riwayat Analisis
                        </p>

                        <div className="overflow-y-auto scrollbar_y_custom h-full px-4 pt-2">
                            {/* Desktop expanded — full list */}
                            <div className="sm:block h-full">
                                <RiwayatAnalisisSidebar
                                    userId={user?.id}
                                    isCollapsed={isDesktopSidebarOpen}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* User Profile & Logout */}
                <div className="px-3 pt-3 pb-6">
                    {/* Desktop */}
                    <div className={`hidden lg:flex items-center gap-3 ${isDesktopSidebarOpen ? 'flex-col' : 'justify-between'}`}>
                        {!isDesktopSidebarOpen && (
                            <Link href="/dashboard/profile" className="flex items-center gap-2 min-w-0 flex-1">
                                <img
                                    src={user?.photo || `https://ui-avatars.com/api/?name=${user?.username || ''}&background=random&color=fff`}
                                    alt="Avatar"
                                    className="w-8 h-8 rounded-full object-cover shrink-0"
                                />
                                <div className="flex flex-col min-w-0">
                                    <h3 className="font-semibold text-sm text-neutral-900 truncate">{user?.username || ''}</h3>
                                    <h3 className="font-light text-xs text-neutral-700 truncate">{user?.email || ''}</h3>
                                </div>
                            </Link>
                        )}
                        {isDesktopSidebarOpen && (
                            <Link href="/dashboard/profile" className="flex items-center px-2 py-2 gap-2 bg-neutral-100 border border-neutral-700 rounded-sm
                            hover:shadow-[-5px_5px_0_rgba(26,26,46,1)] hover:-translate-y-0.5 transition-all duration-300 ease-in-out">
                                <img
                                    src={user?.photo || `https://ui-avatars.com/api/?name=${user?.username || ''}&background=random&color=fff`}
                                    alt="Avatar"
                                    className="w-8 h-8 rounded-full object-cover border border-neutral-700"
                                />
                            </Link>
                        )}
                        {!isDesktopSidebarOpen && (
                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center p-2 rounded-sm 
                                    bg-neutral-100 border border-neutral-700
                                    text-neutral-900
                                    transition-all duration-300 ease-in-out 
                                    hover:-translate-y-0.5 hover:shadow-[-5px_5px_0_rgba(26,26,46,1)]
                                    group relative"
                                title="Logout"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M16 13v-2H7V8l-5 4 5 4v-3z" />
                                    <path d="M20 3h-9c-1.103 0-2 .897-2 2v4h2V5h9v14h-9v-4H9v4c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2z" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Tablet */}
                    <div className={`lg:hidden flex items-center gap-2 ${isDesktopSidebarOpen ? 'flex-col' : 'justify-between'}`}>
                        <Link href="/dashboard/profile" className='flex items-center gap-2'>
                            <img
                                src={user?.photo || `https://ui-avatars.com/api/?name=${user?.username}&background=random&color=fff`}
                                alt="Avatar"
                                className="w-8 h-8 rounded-full object-cover"
                            />

                            {!isDesktopSidebarOpen && (
                                <div className="flex flex-col min-w-0">
                                    <h3 className="font-semibold text-xs text-neutral-200 line-clamp-1">{user?.username || ''}</h3>
                                    <h3 className="font-light text-[10px] text-neutral-400 line-clamp-1">{user?.email || ''}</h3>
                                </div>
                            )}
                        </Link>
                        {!isDesktopSidebarOpen && (
                            <button
                                onClick={handleLogout}
                                className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors group relative"
                                title="Logout"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M16 13v-2H7V8l-5 4 5 4v-3z" />
                                    <path d="M20 3h-9c-1.103 0-2 .897-2 2v4h2V5h9v14h-9v-4H9v4c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2z" />
                                </svg>
                                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-neutral-900 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                                    Logout
                                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-neutral-900" />
                                </div>
                            </button>
                        )}
                    </div>
                </div>
            </aside >

            {/* Mobile Sidebar */}
            <aside
                id="mobile-sidebar"
                className={`fixed top-0 left-0 z-40 w-80 h-screen flex flex-col transition-transform duration-300
                    ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
                }
                aria-label="Mobile Sidebar"
            >
                <div className="flex flex-col h-full bg-neutral-100 shadow-2xl border-r border-neutral-700">
                    {/* Mobile Header */}
                    <div className="px-4 py-3 flex items-center justify-between border-b border-neutral-900">
                        <h2 className="text-xl font-bold text-neutral-950">Stego Detection</h2>
                        <button
                            type="button"
                            onClick={onCloseMobileSidebar}
                            className="p-2 rounded-lg bg-neutral-100 border border-neutral-900 text-neutral-800 hover:text-white
                            shadow-[-5px_5px_0_rgba(26,26,46,1)] -translate-y-0.5
                            "
                            aria-label="Close sidebar"
                        >
                            <svg className="w-4 h-4 text-neutral-900 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="h-full overflow-y-auto scrollbar_y_custom">
                        {/* Mobile Nav */}
                        <div className="shrink-0 px-4 py-3">
                            <p className="text-neutral-700 text-sm mb-2 font-normal">Menu</p>
                            <ul className="font-medium space-y-1">
                                <MenuNavigation items={navigation} isCollapsed={false} />
                            </ul>
                        </div>

                        {/* Mobile Riwayat */}
                        <div className="flex-1 min-h-0 px-4 py-3">
                            <p className="text-neutral-700 text-sm mb-2 font-normal">Riwayat Analisis</p>
                            <RiwayatAnalisisSidebar
                                userId={user?.id}
                                isCollapsed={false}
                            />
                        </div>
                    </div>

                    {/* Mobile User */}
                    <div className="px-4 py-2 flex items-center justify-between border-t border-neutral-900">
                        <Link href={'/dashboard/profile'} className="flex items-center gap-3">
                            <img
                                src={user?.photo || `https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=random&color=fff`}
                                alt="Avatar"
                                className="w-12 h-12 rounded-full object-cover border-2 border-neutral-800"
                            />
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-neutral-950 line-clamp-1">{user?.username || ''}</h3>
                                <p className="text-xs text-neutral-800 line-clamp-1">{user?.email || ''}</p>
                            </div>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center gap-2 p-2 rounded-lg bg-neutral-100 text-neutral-900 hover:text-white
                            border border-neutral-700
                            shadow-[-5px_5px_0_rgba(26,26,46,1)] -translate-y-0.5 transition-colors duration-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16 13v-2H7V8l-5 4 5 4v-3z" />
                                <path d="M20 3h-9c-1.103 0-2 .897-2 2v4h2V5h9v14h-9v-4H9v4c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {
                isMobileSidebarOpen && (
                    <div
                        className="fixed inset-0 z-30 bg-black/60 md:hidden transition-opacity duration-300 backdrop-blur-sm"
                        onClick={onCloseMobileSidebar}
                        aria-hidden="true"
                    />
                )
            }
        </>
    );
}
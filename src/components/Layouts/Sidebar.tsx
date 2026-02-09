'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { navigationPengguna, navigationSuperadmin } from '@/data/Navigation';
import { useState, useEffect, useRef, useMemo } from 'react';
import { NavigationItem } from '@/types/navigation';
import { useAuth } from '@/provider/AuthProvider';
import Swal from 'sweetalert2';

function MenuNavigation({ items, isCollapsed, className }: { items: NavigationItem[]; isCollapsed: boolean; className?: string }) {
    const pathname = usePathname();
    const activeMenuRef = useRef<HTMLLIElement>(null);

    return (
        <span className={className}>
            {items.map((menu, index) => {
                const isDirectActive = pathname === menu.href;

                return (
                    <li key={index} ref={isDirectActive ? activeMenuRef : null} className="relative group">
                        <Link
                            href={menu.href ?? '#'}
                            className={`flex items-center ${isCollapsed ? 'justify-center p-3' : 'p-3.5'} rounded-lg hover:bg-gray-800 group transition-colors duration-200 ${isDirectActive ? 'text-white bg-gray-700' : 'text-gray-300 hover:text-white'}`}
                        >
                            <span className={isCollapsed ? '' : 'shrink-0'}>
                                {menu.icon ?? ''}
                            </span>
                            {!isCollapsed && (
                                <span className="ms-2 font-medium">{menu.name}</span>
                            )}
                        </Link>

                        {/* Tooltip for collapsed state */}
                        {isCollapsed && (
                            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                                {menu.name}
                                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                            </div>
                        )}
                    </li>
                );
            })}
        </span>
    );
}

export default function SidebarLayout({
    isMobileSidebarOpen,
    onCloseMobileSidebar,
    isDesktopSidebarOpen,
    onToggleDesktopSidebar,
}: Readonly<{
    isMobileSidebarOpen: boolean;
    onCloseMobileSidebar: () => void;
    onToggleDesktopSidebar: () => void;
    isDesktopSidebarOpen: boolean;
}>) {
    const { user, logout } = useAuth();
    const router = useRouter();

    // Pilih navigasi berdasarkan role user
    const navigation = useMemo(() => {
        if (user?.role === 'superadmin') {
            return navigationSuperadmin;
        }
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
            confirmButtonText: 'Ya, Logout',
            cancelButtonText: 'Batal',
        });

        if (result.isConfirmed) {
            Swal.fire({
                title: 'Sedang logout...',
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                },
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
            } catch (error) {
                Swal.fire({
                    title: 'Gagal!',
                    text: 'Terjadi kesalahan saat logout',
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
                // console.error('Logout error:', error);
            }
        }
    };

    return (
        <>
            {/* Desktop & Tablet Sidebar - Hidden di mobile */}
            <aside
                id="sidebar-multi-level-sidebar"
                className={`hidden md:flex md:flex-col ${
                    // Tablet (md): selalu collapsed (icon only)
                    // Desktop (lg): bisa toggle
                    'md:w-20 lg:w-20'
                    } ${!isDesktopSidebarOpen && 'lg:w-80'} h-full transition-all duration-300 bg-gray-950 border-r border-gray-700`}
                aria-label="Sidebar"
            >
                {/* Header */}
                <div className="px-4 py-3 flex items-center justify-between bg-gray-950 border-b border-gray-700">
                    {/* Logo - Only show on desktop when not collapsed */}
                    {!isDesktopSidebarOpen && (
                        <Link href={'/'} className='hidden lg:flex items-center p-3.5 text-xl font-semibold text-white'>
                            Stego Detection
                        </Link>
                    )}

                    {/* Toggle Button - Only on desktop */}
                    <button
                        type="button"
                        onClick={onToggleDesktopSidebar}
                        className={`hidden lg:block p-1 bg-gray-800 hover:bg-gray-900 rounded-md text-white transition-transform duration-300 ${isDesktopSidebarOpen ? 'rotate-180 mx-auto' : ''}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                            fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14.29 6.29 8.59 12l5.7 5.71 1.42-1.42-4.3-4.29 4.3-4.29z"></path>
                        </svg>
                    </button>
                </div>

                {/* Navigation Menu */}
                <div className="flex-1 min-h-0 overflow-y-auto scrollbar_y_custom px-4 py-3">
                    <ul className="font-medium space-y-1">
                        {/* Tablet: selalu collapsed, Desktop: ikut state */}
                        <MenuNavigation items={navigation} isCollapsed={true} className="md:block lg:hidden" />
                        <div className="hidden lg:block">
                            <MenuNavigation items={navigation} isCollapsed={isDesktopSidebarOpen} />
                        </div>
                    </ul>
                </div>

                {/* User Profile & Logout */}
                <div className="px-4 py-3 border-t border-gray-700">
                    {/* Desktop - Full Profile */}
                    <div className={`hidden lg:flex items-center gap-3 ${isDesktopSidebarOpen ? 'flex-col' : 'justify-between'}`}>
                        {!isDesktopSidebarOpen && (
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=random&color=fff`}
                                    alt="Avatar"
                                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                />
                                <div className="flex flex-col min-w-0">
                                    <h3 className="font-semibold text-sm text-white truncate">{user?.username || 'User'}</h3>
                                    <h3 className="font-light text-xs text-gray-400 truncate">{user?.email || ''}</h3>
                                </div>
                            </div>
                        )}

                        {isDesktopSidebarOpen && (
                            <img
                                src={`https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=random&color=fff`}
                                alt="Avatar"
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        )}

                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center p-3 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors duration-200 group relative"
                            title="Logout"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16 13v-2H7V8l-5 4 5 4v-3z"></path>
                                <path d="M20 3h-9c-1.103 0-2 .897-2 2v4h2V5h9v14h-9v-4H9v4c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2z"></path>
                            </svg>

                            {/* Tooltip for collapsed desktop */}
                            {isDesktopSidebarOpen && (
                                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                                    Logout
                                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                                </div>
                            )}
                        </button>
                    </div>

                    {/* Tablet - Icon Only */}
                    <div className="lg:hidden flex flex-col items-center gap-3">
                        <img
                            src={`https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=random&color=fff`}
                            alt="Avatar"
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors group relative"
                            title="Logout"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16 13v-2H7V8l-5 4 5 4v-3z"></path>
                                <path d="M20 3h-9c-1.103 0-2 .897-2 2v4h2V5h9v14h-9v-4H9v4c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2z"></path>
                            </svg>

                            {/* Tooltip */}
                            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                                Logout
                                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                            </div>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar - Slide dari kiri */}
            <aside
                id="mobile-sidebar"
                className={`fixed top-0 left-0 z-40 w-80 h-screen flex flex-col transition-transform duration-300 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden`}
                aria-label="Mobile Sidebar"
            >
                <div className="flex flex-col h-full bg-gray-950 shadow-2xl border-r border-gray-700">
                    {/* Mobile Header */}
                    <div className="px-4 py-4 border-b border-gray-700 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Stego Detection</h2>
                        <button
                            type="button"
                            onClick={onCloseMobileSidebar}
                            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
                            aria-label="Close sidebar"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Mobile Navigation */}
                    <div className="flex-1 min-h-0 overflow-y-auto scrollbar_y_custom px-4 py-4">
                        <ul className="font-medium space-y-1">
                            <MenuNavigation items={navigation} isCollapsed={false} />
                        </ul>
                    </div>

                    {/* Mobile User Section */}
                    <div className="px-4 py-4 border-t border-gray-700">
                        <div className="flex items-center gap-3 mb-3">
                            <img
                                src={`https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=random&color=fff`}
                                alt="Avatar"
                                className="w-12 h-12 rounded-full object-cover border-2 border-gray-700"
                            />
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-white truncate">{user?.username || 'User'}</h3>
                                <p className="text-sm text-gray-400 truncate">{user?.email || ''}</p>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16 13v-2H7V8l-5 4 5 4v-3z"></path>
                                <path d="M20 3h-9c-1.103 0-2 .897-2 2v4h2V5h9v14h-9v-4H9v4c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2z"></path>
                            </svg>
                            <span className="font-semibold">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/60 md:hidden transition-opacity duration-300 backdrop-blur-sm"
                    onClick={onCloseMobileSidebar}
                    aria-hidden="true"
                />
            )}
        </>
    );
}
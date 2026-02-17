'use client';

import { useState } from 'react';
import SidebarLayout from './Sidebar';
import { useAuth } from '@/provider/AuthProvider';
import Link from 'next/link';

export default function DashboardLayoutUsers({ children, className }: Readonly<{ children: React.ReactNode; className?: string }>) {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(false);
    const { user, isLoading } = useAuth();

    const closeMobileSidebar = () => {
        setIsMobileSidebarOpen(false);
    };

    const toggleMobileSidebar = () => {
        setIsMobileSidebarOpen(!isMobileSidebarOpen);
    };

    const toggleDesktopSidebar = () => {
        setIsDesktopSidebarOpen(!isDesktopSidebarOpen);
    };

    return (
        <main className={`bg-gray-50 h-screen flex flex-col w-full overflow-hidden ${className}`}>
            {/* Header untuk Mobile dan Tablet */}
            <header className="md:hidden bg-gray-950 border-b border-gray-700 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    {/* Toggle Button */}
                    <button
                        onClick={toggleMobileSidebar}
                        className="p-2 rounded-md bg-gray-800 hover:bg-gray-700 text-white transition-colors"
                        aria-label="Toggle sidebar"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/* Logo/Title */}
                    <h1 className="text-xl font-bold text-white">Deteksi Stego</h1>
                </div>

                {/* User Info - Mobile */}
                <Link href={'/dashboard/profile'} className="flex items-center gap-2">
                    <img
                        src={user?.photo || `https://ui-avatars.com/api/?name=${user?.username || ''}&background=random&color=fff`}
                        alt="User avatar"
                        className="w-9 h-9 rounded-full object-cover border-2 border-gray-700"
                    />
                    <div className="hidden sm:block">
                        <p className="text-sm font-semibold text-white">{user?.username || ''}</p>
                        <p className="text-xs text-gray-400">{user?.email || ''}</p>
                    </div>
                </Link>
            </header>

            {/* Main Content Area */}
            <div className="flex flex-1 w-full overflow-hidden">
                {/* Sidebar - Hidden di mobile, icon-only di tablet, full di desktop */}
                <SidebarLayout
                    isMobileSidebarOpen={isMobileSidebarOpen}
                    onCloseMobileSidebar={closeMobileSidebar}
                    onToggleDesktopSidebar={toggleDesktopSidebar}
                    isDesktopSidebarOpen={isDesktopSidebarOpen}
                />

                {/* Content Area */}
                <div className="relative p-4 md:p-6 lg:p-8 pb-8 md:pb-10 lg:pb-12 flex flex-col gap-3 md:gap-6 flex-1 overflow-y-auto scrollbar_y_custom bg-gray-950">
                    {children}
                </div>
            </div>
        </main>
    );
}
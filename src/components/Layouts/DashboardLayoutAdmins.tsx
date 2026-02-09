'use client';

import { useState } from 'react';
import SidebarLayout from './Sidebar';
import Link from 'next/link';

export default function DashboardLayoutAdmins({ children, className }: Readonly<{ children: React.ReactNode; className?: string }>) {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(false);

    const closeMobileSidebar = () => {
        setIsMobileSidebarOpen(false);
    };

    const toggleDesktopSidebar = () => {
        setIsDesktopSidebarOpen(!isDesktopSidebarOpen);
    };

    return (
        <main className={`bg-gray-50 h-screen flex flex-col w-full overflow-hidden ${className}`}>
            {/* Bagian bawah fleksibel isi sisa tinggi */}
            <div className="flex flex-col flex-1 w-full overflow-hidden">

                <SidebarLayout
                    isMobileSidebarOpen={isMobileSidebarOpen}
                    onCloseMobileSidebar={closeMobileSidebar}
                    onToggleDesktopSidebar={toggleDesktopSidebar}
                    isDesktopSidebarOpen={isDesktopSidebarOpen}
                />
                <div className="relative p-4 md:p-6 lg:p-8 pb-8 md:pb-10 lg:pb-12 flex flex-col gap-3 md:gap-6 flex-1 overflow-y-auto scrollbar_y_custom">
                    {children}
                </div>
            </div>
        </main>
    );
}
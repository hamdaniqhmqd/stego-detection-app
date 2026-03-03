'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { UserRole } from '@/types/Users';
import { useAuth } from '@/provider/AuthProvider';

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: UserRole[];
    redirectTo?: string;
}

const ROLE_DASHBOARD: Record<UserRole, string> = {
    pengguna: '/dashboard',
    superadmin: '/admin',
};

const LOGIN_URL = process.env.NODE_ENV === 'production'
    ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/login` || process.env.NEXT_PUBLIC_APP_URL
    : `${process.env.NEXT_PUBLIC_APP_URL_DEVELOPMENT}/auth/login` || process.env.NEXT_PUBLIC_APP_URL_DEVELOPMENT;

export default function ProtectedRoute({
    children,
    allowedRoles,
    redirectTo,
}: ProtectedRouteProps) {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (isLoading) {
            return;
        }

        if (!isAuthenticated || !user) {
            const currentPath = encodeURIComponent(pathname);
            window.location.href = `${LOGIN_URL}?redirect=${currentPath}`;
            return;
        }

        const userRole = user.role as UserRole;

        if (allowedRoles && allowedRoles.length > 0) {
            const hasAccess = allowedRoles.includes(userRole);

            if (!hasAccess) {
                const targetUrl = redirectTo || ROLE_DASHBOARD[userRole] || '/';
                router.replace(targetUrl);
                return;
            }
        }

        if (pathname === '/') {
            const dashboardUrl = ROLE_DASHBOARD[userRole];
            if (dashboardUrl) {
                router.replace(dashboardUrl);
                return;
            }
        }
    }, [isLoading, isAuthenticated, user, allowedRoles, redirectTo, pathname, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-600 mx-auto"></div>
                    {/* <p className="mt-4 text-neutral-600">Memuat...</p> */}
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-600 mx-auto"></div>
                    <p className="mt-4 text-neutral-600">Mengalihkan ke halaman login...</p>
                </div>
            </div>
        );
    }

    if (allowedRoles && allowedRoles.length > 0) {
        const userRole = user.role as UserRole;
        const hasAccess = allowedRoles.includes(userRole);

        if (!hasAccess) {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-600 mx-auto"></div>
                        <p className="mt-4 text-neutral-600">Mengalihkan...</p>
                    </div>
                </div>
            );
        }
    }

    return <>{children}</>;
}
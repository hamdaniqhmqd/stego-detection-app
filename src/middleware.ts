import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/libs/auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Route untuk pengguna biasa
  const penggunaRoutes = [
    '/dashboard/buat_stego',
    '/dashboard/analisis_stego',
  ];

  // Route untuk superadmin (tambahkan route admin di sini nanti)
  const superadminRoutes = [
    '/dashboard/admin',
  ];

  // Route yang bisa diakses kedua role
  const sharedRoutes = [
    '/dashboard',
  ];

  const authRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/verify-email',
    '/auth/forgot-password',
    '/auth/reset-password',
  ];

  const isPenggunaRoute = penggunaRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isSuperadminRoute = superadminRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isSharedRoute = sharedRoutes.some((route) =>
    pathname === route
  );

  const isProtectedRoute = isPenggunaRoute || isSuperadminRoute || isSharedRoute;

  const isAuthRoute = authRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;

    // console.log('🔐 Middleware - Protected Route:', pathname);
    // console.log('🍪 Access Token exists:', !!accessToken);
    // console.log('🍪 Refresh Token exists:', !!refreshToken);

    if (!accessToken && !refreshToken) {
      // console.log('❌ No tokens found, redirecting to login');
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Jika ada accessToken, verify
    if (accessToken) {
      try {
        const decoded = await verifyAccessToken(accessToken);
        // console.log('✅ Token decoded:', decoded);

        if (!decoded) {
          // console.log('❌ Token decoded is null/undefined');
          throw new Error('Token decode failed');
        }

        const userRole = decoded.role as 'pengguna' | 'superadmin';
        // console.log('👤 User role:', userRole);

        // Cek akses berdasarkan role
        if (isSuperadminRoute && userRole !== 'superadmin') {
          // console.log('❌ User is not superadmin, blocking access to:', pathname);
          const dashboardUrl = new URL('/dashboard', request.url);
          dashboardUrl.searchParams.set('error', 'unauthorized');
          return NextResponse.redirect(dashboardUrl);
        }

        // Pengguna dan superadmin bisa akses route pengguna dan shared route
        if (isPenggunaRoute || isSharedRoute) {
          // console.log('✅ User has access to route:', pathname);
          return NextResponse.next();
        }

        // Superadmin bisa akses semua
        if (userRole === 'superadmin') {
          // console.log('✅ Superadmin access granted to:', pathname);
          return NextResponse.next();
        }

        // console.log('✅ Access granted, continuing to:', pathname);
        return NextResponse.next();
      } catch (error) {
        // console.log('❌ Token verification error:', error);

        // Jika ada refresh token, biarkan client handle refresh
        if (refreshToken) {
          // console.log('⚠️ Access token invalid but refresh token exists, allowing through');
          return NextResponse.next();
        }

        // console.log('❌ No refresh token, redirecting to login');
        const loginUrl = new URL('/auth/login', request.url);
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete('accessToken');
        response.cookies.delete('refreshToken');
        return response;
      }
    }

    // Jika hanya ada refreshToken (accessToken sudah expired)
    // console.log('⚠️ Only refresh token exists, allowing through for client-side refresh');
    return NextResponse.next();
  }

  if (isAuthRoute) {
    const accessToken = request.cookies.get('accessToken')?.value;
    // console.log('🔓 Auth Route:', pathname, '- Token exists:', !!accessToken);

    if (accessToken) {
      try {
        const decoded = await verifyAccessToken(accessToken);

        if (decoded) {
          // console.log('✅ Valid token on auth page, redirecting to dashboard');
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      } catch (error) {
        // console.log('⚠️ Token invalid on auth page, continuing to auth');
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|image|images|api).*)',
  ],
};
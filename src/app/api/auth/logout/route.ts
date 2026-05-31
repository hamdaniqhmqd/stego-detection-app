// app/api/auth/logout/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/libs/auth/jwt';
import { supabaseClient } from '@/libs/supabase/client';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 0,
  path: '/',
  domain: process.env.NODE_ENV === 'production'
    ? process.env.COOKIE_DOMAIN
    : process.env.COOKIE_DEVELOPMENT_DOMAIN,
};

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (accessToken) {
      try {
        const decoded = await verifyAccessToken(accessToken);

        if (decoded && refreshToken) {
          await supabaseClient
            .from('refresh_tokens')
            .delete()
            .eq('user_id', decoded.userId)
            .eq('refresh_token', refreshToken);
        }
      } catch {
        // Token sudah expired, tetap lanjutkan logout
      }
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logout berhasil',
    });

    // Gunakan .set() dengan maxAge: 0, bukan .delete()
    // agar domain & path ikut terkirim dalam Set-Cookie header
    response.cookies.set('accessToken', '', COOKIE_OPTIONS);
    response.cookies.set('refreshToken', '', COOKIE_OPTIONS);

    return response;

  } catch {
    const response = NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat logout' },
      { status: 500 }
    );

    response.cookies.set('accessToken', '', COOKIE_OPTIONS);
    response.cookies.set('refreshToken', '', COOKIE_OPTIONS);

    return response;
  }
}
// src/app/api/auth/refresh/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/libs/supabase/server';
import { verifyRefreshToken, generateAccessToken } from '@/libs/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    // Ambil refresh token dari cookie
    const refreshToken = request.cookies.get('refreshToken')?.value;
    const Utc = new Date();
    const Wib = new Date(Utc.getTime() + 7 * 60 * 60 * 1000);

    // console.log('🍪 Refresh token from cookie:', refreshToken ? 'EXISTS' : 'NOT FOUND');

    if (!refreshToken) {
      return NextResponse.json({
        success: false,
        message: 'Refresh token tidak ditemukan'
      }, { status: 401 });
    }

    // Verify refresh token
    const payload = await verifyRefreshToken(refreshToken);

    if (!payload) {
      return NextResponse.json({
        success: false,
        message: 'Refresh token tidak valid'
      }, { status: 401 });
    }

    // Cek apakah refresh token masih ada di database dan belum di-soft delete
    const { data: tokenRecord, error: tokenError } = await supabaseServer
      .from('refresh_tokens')
      .select('id, expires_at, deleted_at')
      .eq('refresh_token', refreshToken)
      .is('deleted_at', null)
      .single();

    if (tokenError || !tokenRecord) {
      return NextResponse.json({
        success: false,
        message: 'Refresh token tidak valid atau telah dihapus'
      }, { status: 401 });
    }

    // Cek apakah token sudah expired
    const expiresAt = new Date(tokenRecord.expires_at);
    if (expiresAt < Wib) {
      // Soft delete token yang expired
      await supabaseServer
        .from('refresh_tokens')
        .update({ deleted_at: Wib.toISOString() })
        .eq('id', tokenRecord.id);

      return NextResponse.json({
        success: false,
        message: 'Refresh token telah expired'
      }, { status: 401 });
    }

    // Cek apakah user masih aktif
    const { data: user, error: userError } = await supabaseServer
      .from('users')
      .select('id, username, email, role')
      .eq('id', payload.userId)
      .is('deleted_at', null)
      .single();

    if (userError || !user) {
      return NextResponse.json({
        success: false,
        message: 'User tidak ditemukan'
      }, { status: 401 });
    }

    // Generate access token baru
    const newAccessToken = await generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Set cookie dengan access token baru
    const response = NextResponse.json({
      success: true,
      message: 'Token berhasil diperbarui',
    });

    // 🔧 FIX: Cookie settings untuk localhost
    const isProduction = process.env.NODE_ENV === 'production';

    response.cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: isProduction, // false di development
      sameSite: isProduction ? 'none' : 'lax', // 'lax' untuk localhost
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
      // Hapus domain di localhost
      ...(isProduction && { domain: process.env.COOKIE_DOMAIN }),
    });

    // console.log('✅ Access token refreshed successfully');

    return response;
  } catch (error) {
    // console.error('Refresh token error:', error);
    return NextResponse.json({
      success: false,
      message: 'Terjadi kesalahan server'
    }, { status: 500 });
  }
}
// app/api/auth/logout/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/libs/auth/jwt';
import supabase from '@/libs/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;

    // Verify access token untuk mendapatkan user ID
    if (accessToken) {
      try {
        const decoded = await verifyAccessToken(accessToken);

        if (decoded && refreshToken) {
          // Delete refresh token dari database
          await supabase
            .from('refresh_tokens')
            .delete()
            .eq('user_id', decoded.userId)
            .eq('refresh_token', refreshToken);
        }
      } catch (error) {
        // Token sudah expired, tapi tetap lanjutkan logout
        // console.log('Token already expired during logout');
      }
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logout berhasil',
    });

    // Delete cookies
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');

    return response;

  } catch (error) {
    // console.error('Logout error:', error);

    // Tetap hapus cookies meskipun ada error
    const response = NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat logout' },
      { status: 500 }
    );

    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');

    return response;
  }
}
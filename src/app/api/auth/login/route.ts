// src/app/api/auth/login/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/libs/supabase/server';
import { generateAccessToken, generateRefreshToken, getRefreshTokenExpiry } from '@/libs/auth/jwt';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password: password_input } = body;

    // Validasi input
    if (!email || !password_input) {
      return NextResponse.json({
        success: false, message: 'Email dan password harus diisi',
        redirect_url: null,
        data: null
      }, { status: 400 });
    }

    // Cari user berdasarkan email
    const { data: user, error: userError } = await supabaseServer
      .from('users')
      .select('id, username, email, password, role, verifed_at, created_at, deleted_at')
      .eq('email', email.toLowerCase())
      .single();

    if (userError || !user) {
      return NextResponse.json({
        success: false,
        message: 'Akun tidak ditemukan',
        redirect_url: null,
        data: null
      }, { status: 401 });
    }

    if (user.deleted_at) {
      return NextResponse.json({
        success: false,
        message: 'Akun tidak aktif, silahkan hubungi admin untuk mengaktifkannya kembali',
        redirect_url: null,
        data: null
      }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = password_input === user.password;

    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        message: 'Email atau password salah',
        redirect_url: null,
        data: null
      }, { status: 401 });
    }

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await generateAccessToken(tokenPayload);
    const refreshToken = await generateRefreshToken(tokenPayload);

    // Simpan refresh token ke database
    const userAgent = request.headers.get('user-agent') || null;
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    const payloadRefreshToken = {
      user_id: user.id,
      refresh_token: refreshToken,
      user_agent: userAgent,
      ip_address: ipAddress,
      expires_at: getRefreshTokenExpiry().toISOString(),
    };

    const { error: insertError } = await supabaseServer
      .from('refresh_tokens')
      .insert(payloadRefreshToken);

    if (insertError) {
      // console.error('Error inserting refresh token:', insertError);
      return NextResponse.json({
        success: false,
        message: `Error inserting refresh token: ${insertError.message}`,
        redirect_url: null,
        data: null
      }, { status: 500 });
    }

    // Prepare user response (tanpa password)
    const { password, ...userResponse } = user;

    // Set cookies
    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil',
      user: userResponse,
      redirect_url: null,
      data: null,
    });

    // 🔧 FIX: Cookie settings untuk localhost
    const isProduction = process.env.NODE_ENV === 'production';

    // Set access token cookie
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction, // false di development
      sameSite: isProduction ? 'none' : 'lax', // 'lax' untuk localhost
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
      // Hapus domain di localhost, biarkan browser auto-detect
      ...(isProduction && { domain: process.env.COOKIE_DOMAIN }),
    });

    // Set refresh token cookie
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction, // false di development
      sameSite: isProduction ? 'none' : 'lax', // 'lax' untuk localhost
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      // Hapus domain di localhost
      ...(isProduction && { domain: process.env.COOKIE_DOMAIN }),
    });

    // console.log('✅ Cookies set successfully');
    // console.log('Access Token length:', accessToken.length);
    // console.log('Refresh Token length:', refreshToken.length);

    return response;
  } catch (error) {
    // console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Terjadi kesalahan server'
    }, { status: 500 });
  }
}
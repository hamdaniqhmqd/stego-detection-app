// src/app/api/auth/login/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/libs/supabase/server';
import { generateAccessToken, generateRefreshToken, getRefreshTokenExpiry } from '@/libs/auth/jwt';
import { getWaktuWIB } from '@/utils/format';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password: password_input } = body;
    const nowWIB = getWaktuWIB();

    // Validasi input
    if (!email || !password_input) {
      return NextResponse.json({
        success: false,
        message: 'Email/Username dan password harus diisi',
        redirect_url: null,
        data: null
      }, { status: 400 });
    }

    // ✅ PERBAIKAN: Cari user berdasarkan email ATAU username
    const { data: users, error: userError } = await supabaseServer
      .from('users')
      .select('id, username, email, password, role, is_verified, verified_at, created_at, deleted_at')
      .or(`email.eq.${email.toLowerCase()},username.eq.${email}`) // Cari di email atau username
      .is('deleted_at', null)
      .limit(1);

    // Cek apakah user ditemukan
    if (userError || !users || users.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Email/Username atau password salah',
        redirect_url: null,
        data: null
      }, { status: 401 });
    }

    const user = users[0];

    // Cek apakah akun sudah dihapus
    if (user.deleted_at) {
      return NextResponse.json({
        success: false,
        message: 'Akun tidak aktif, silahkan hubungi admin untuk mengaktifkannya kembali',
        redirect_url: null,
        data: null
      }, { status: 401 });
    }

    // ✅ Verify password dengan bcrypt
    const isPasswordValid = await bcrypt.compare(password_input, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        message: 'Email/Username atau password salah',
        redirect_url: null,
        data: null
      }, { status: 401 });
    }

    // ✅ PERBAIKAN: Cek apakah email sudah diverifikasi
    if (!user.is_verified) {
      // User belum verifikasi email
      return NextResponse.json({
        success: false,
        message: 'Email Anda belum diverifikasi. Silakan cek inbox email Anda.',
        redirect_url: `/auth/check-email?email=${encodeURIComponent(user.email)}`,
        data: null,
        needsVerification: true,
      }, { status: 403 }); // 403 Forbidden
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
    const ipAddress = request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const payloadRefreshToken = {
      user_id: user.id,
      refresh_token: refreshToken,
      user_agent: userAgent,
      ip_address: ipAddress,
      expires_at: getRefreshTokenExpiry().toISOString(),
      created_at: nowWIB.toISOString(),
    };

    const { error: insertError } = await supabaseServer
      .from('refresh_tokens')
      .insert(payloadRefreshToken);

    if (insertError) {
      console.error('Error inserting refresh token:', insertError);
      return NextResponse.json({
        success: false,
        message: 'Gagal menyimpan sesi login',
        redirect_url: null,
        data: null
      }, { status: 500 });
    }

    // Prepare user response (tanpa password)
    const { password, deleted_at, ...userResponse } = user;

    // Set cookies
    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil',
      user: userResponse,
      redirect_url: null,
      data: userResponse,
    });

    // Cookie settings
    const isProduction = process.env.NODE_ENV === 'production';

    // Set access token cookie
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
      ...(isProduction && { domain: process.env.COOKIE_DOMAIN }),
    });

    // Set refresh token cookie
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      ...(isProduction && { domain: process.env.COOKIE_DOMAIN }),
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Terjadi kesalahan server',
      redirect_url: null,
      data: null
    }, { status: 500 });
  }
}
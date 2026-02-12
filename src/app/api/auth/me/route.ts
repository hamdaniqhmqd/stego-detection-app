// src/app/api/auth/me/route.ts
// Endpoint untuk mendapatkan user yang sedang login berdasarkan access token di cookie

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/libs/auth/jwt';
import { supabaseServer } from '@/libs/supabase/server';

export async function GET(request: NextRequest) {
    try {
        // Ambil access token dari cookie
        const accessToken = request.cookies.get('accessToken')?.value;

        if (!accessToken) {
            return NextResponse.json(
                { success: false, message: 'Token tidak ditemukan' },
                { status: 401 }
            );
        }

        // Verify token
        const decoded = await verifyAccessToken(accessToken);
        // console.log('Decoded token:', decoded);

        if (!decoded) {
            return NextResponse.json(
                { success: false, message: 'Token tidak valid' },
                { status: 401 }
            );
        }

        // Ambil data user terbaru dari database
        const { data: user, error } = await supabaseServer
            .from('users')
            .select('id, username, email, role, is_verified, verified_at, created_at, updated_at')
            .eq('id', decoded.userId)
            .is('deleted_at', null)
            .single();

        if (error || !user) {
            return NextResponse.json(
                { success: false, message: 'User tidak ditemukan' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            user,
        });
    } catch (error) {
        // console.error('Get current user error:', error);
        return NextResponse.json(
            { success: false, message: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
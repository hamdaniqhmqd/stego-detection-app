// src/app/api/auth/register/route.ts

import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/libs/supabase/client';
import bcrypt from 'bcryptjs';
import { generateVerificationToken, getVerificationTokenExpiry, sendVerificationEmail } from '@/libs/auth/email-service';
import { generateAccessToken, generateRefreshToken, getRefreshTokenExpiry } from '@/libs/auth/jwt';
import { getWaktuWIB } from '@/utils/format';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, email, password, role } = body;
        const nowWIB = getWaktuWIB();

        if (!username || !email || !password || !role) {
            return NextResponse.json(
                { success: false, message: 'Semua field harus diisi' },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { success: false, message: 'Password minimal 8 karakter' },
                { status: 400 }
            );
        }

        if (!['pengguna', 'superadmin'].includes(role)) {
            return NextResponse.json(
                { success: false, message: 'Role tidak valid' },
                { status: 400 }
            );
        }

        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email.toLowerCase())
            .is('deleted_at', null)
            .single();

        if (existingUser) {
            return NextResponse.json(
                { success: false, message: 'Email sudah terdaftar' },
                { status: 409 }
            );
        }

        const { data: existingUsername } = await supabase
            .from('users')
            .select('id')
            .eq('username', username)
            .is('deleted_at', null)
            .single();

        if (existingUsername) {
            return NextResponse.json(
                { success: false, message: 'Username sudah digunakan' },
                { status: 409 }
            );
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const payloadInsertUser = {
            username,
            email: email.toLowerCase(),
            password: passwordHash,
            role,
            is_verified: false,
            created_at: nowWIB.toISOString(),
            updated_at: nowWIB.toISOString(),
        };

        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert(payloadInsertUser)
            .select('id, username, email, role, is_verified, verified_at, created_at')
            .single();

        if (insertError || !newUser) {
            console.error('Insert user error:', insertError);
            return NextResponse.json(
                { success: false, message: 'Gagal membuat akun' },
                { status: 500 }
            );
        }

        // Generate verification token (bukan OTP)
        const verificationToken = generateVerificationToken();
        const tokenExpiry = getVerificationTokenExpiry();

        const payloadInsertEmailVerification = {
            user_id: newUser.id,
            email: newUser.email,
            verification_code: verificationToken, // Simpan token di field ini
            type: 'register' as const,
            expires_at: tokenExpiry.toISOString(),
            created_at: nowWIB.toISOString(),
            updated_at: nowWIB.toISOString(),
        };

        const { data: tokenData, error: tokenError } = await supabase
            .from('email_verifications')
            .insert(payloadInsertEmailVerification)
            .select('id, verification_code, expires_at')
            .single();

        if (tokenError) {
            await supabase.from('users').delete().eq('id', newUser.id);
            return NextResponse.json(
                { success: false, message: 'Gagal membuat token verifikasi' },
                { status: 500 }
            );
        }

        // Kirim email dengan link verifikasi (bukan OTP)
        const emailResult = await sendVerificationEmail(
            newUser.email,
            newUser.username,
            verificationToken
        );

        if (!emailResult.success) {
            try {
                await supabase.from('email_logs').insert({
                    user_id: newUser.id,
                    email: newUser.email,
                    type: 'verification',
                    status: 'failed',
                    error_message: emailResult.error,
                    created_at: nowWIB.toISOString(),
                });
            } catch (logError) {
                console.error('Failed to log email error:', logError);
            }
        } else {
            // Log email sukses
            try {
                await supabase.from('email_logs').insert({
                    user_id: newUser.id,
                    email: newUser.email,
                    type: 'verification',
                    status: 'sent',
                    message_id: emailResult.messageId,
                    created_at: nowWIB.toISOString(),
                });
            } catch (logError) {
                console.error('Failed to log email success:', logError);
            }
        }

        const tokenPayload = {
            userId: newUser.id,
            email: newUser.email,
            role: newUser.role,
        };

        const accessToken = await generateAccessToken(tokenPayload);
        const refreshToken = await generateRefreshToken(tokenPayload);

        const userAgent = request.headers.get('user-agent') || null;
        const ipAddress = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';

        await supabase.from('refresh_tokens').insert({
            user_id: newUser.id,
            refresh_token: refreshToken,
            user_agent: userAgent,
            ip_address: ipAddress,
            expires_at: getRefreshTokenExpiry().toISOString(),
            created_at: nowWIB.toISOString(),
        });

        const response = NextResponse.json({
            success: true,
            message: emailResult.success
                ? 'Akun berhasil dibuat. Silakan cek email Anda untuk verifikasi.'
                : 'Akun berhasil dibuat. Email verifikasi akan dikirim segera.',
            user: newUser,
            needsVerification: true,
            emailSent: emailResult.success,
        });

        // response.cookies.set('accessToken', accessToken, {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV === 'production',
        //     sameSite: 'lax',
        //     maxAge: 60 * 15,
        //     path: '/',
        //     domain: process.env.COOKIE_DOMAIN || process.env.COOKIE_DEVELOPMENT_DOMAIN,
        // });

        // response.cookies.set('refreshToken', refreshToken, {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV === 'production',
        //     sameSite: 'lax',
        //     maxAge: 60 * 60 * 24 * 7,
        //     path: '/',
        //     domain: process.env.COOKIE_DOMAIN || process.env.COOKIE_DEVELOPMENT_DOMAIN,
        // });

        return response;
    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json(
            { success: false, message: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
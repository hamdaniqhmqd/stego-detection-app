// src/app/api/auth/resend-verification/route.ts

import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/libs/supabase/client';
import { generateVerificationToken, getVerificationTokenExpiry, sendVerificationEmail } from '@/libs/auth/email-service';
import { getWaktuWIB } from '@/utils/format';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;
        const nowWIB = getWaktuWIB();

        if (!email) {
            return NextResponse.json(
                { success: false, message: 'Email harus diisi' },
                { status: 400 }
            );
        }

        // Cari user berdasarkan email
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, username, email, is_verified')
            .eq('email', email.toLowerCase())
            .is('deleted_at', null)
            .single();

        if (userError || !user) {
            // Untuk keamanan, jangan kasih tau kalau email tidak terdaftar
            // Biar orang ga bisa cek email mana yang terdaftar
            return NextResponse.json(
                { success: true, message: 'Jika email terdaftar, kami telah mengirim link verifikasi.' },
                { status: 200 }
            );
        }

        // Cek apakah user sudah verified
        if (user.is_verified) {
            return NextResponse.json(
                { success: false, message: 'Email Anda sudah terverifikasi. Silakan login.' },
                { status: 400 }
            );
        }

        // RATE LIMITING: Cek apakah ada request resend dalam 1 menit terakhir
        const oneMinuteAgo = new Date(nowWIB.getTime() - 60000); // 1 menit yang lalu

        const { data: recentVerification } = await supabase
            .from('email_verifications')
            .select('created_at')
            .eq('user_id', user.id)
            .eq('type', 'register')
            .gte('created_at', oneMinuteAgo.toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (recentVerification) {
            const timeSinceLastRequest = nowWIB.getTime() - new Date(recentVerification.created_at).getTime();
            const secondsRemaining = Math.ceil((60000 - timeSinceLastRequest) / 1000);

            return NextResponse.json(
                {
                    success: false,
                    message: `Silakan tunggu ${secondsRemaining} detik sebelum mengirim ulang email.`
                },
                { status: 429 } // Too Many Requests
            );
        }

        // Invalidate semua token lama yang belum verified untuk user ini
        await supabase
            .from('email_verifications')
            .delete()
            .eq('user_id', user.id)
            .eq('type', 'register')
            .is('verified_at', null);

        // Generate token verifikasi baru
        const verificationToken = generateVerificationToken();
        const tokenExpiry = getVerificationTokenExpiry();

        const payloadInsertEmailVerification = {
            user_id: user.id,
            email: user.email,
            verification_code: verificationToken,
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
            console.error('Error creating verification token:', tokenError);
            return NextResponse.json(
                { success: false, message: 'Gagal membuat token verifikasi' },
                { status: 500 }
            );
        }

        // Kirim email dengan link verifikasi
        const emailResult = await sendVerificationEmail(
            user.email,
            user.username,
            verificationToken
        );

        // Log email attempt
        try {
            await supabase.from('email_logs').insert({
                user_id: user.id,
                email: user.email,
                type: 'verification_resend',
                status: emailResult.success ? 'sent' : 'failed',
                message_id: emailResult.messageId,
                error_message: emailResult.error,
                created_at: nowWIB.toISOString(),
            });
        } catch (logError) {
            console.error('Failed to log email:', logError);
        }

        if (!emailResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Gagal mengirim email. Silakan coba lagi nanti.'
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Email verifikasi berhasil dikirim. Silakan cek inbox Anda.',
        });

    } catch (error) {
        console.error('Resend verification error:', error);
        return NextResponse.json(
            { success: false, message: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
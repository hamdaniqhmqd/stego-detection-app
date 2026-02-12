// src/app/api/auth/verify-email/route.ts

import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/libs/supabase/client';
import { getWaktuWIB } from '@/utils/format';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.redirect(
                new URL('/auth/verification-failed?error=missing_token', request.url)
            );
        }

        const nowWIB = getWaktuWIB();

        // Cari token verifikasi
        const { data: verification, error: verificationError } = await supabase
            .from('email_verifications')
            .select('*')
            .eq('verification_code', token)
            .eq('type', 'register')
            .is('verified_at', null)
            .single();

        if (verificationError || !verification) {
            return NextResponse.redirect(
                new URL('/auth/verification-failed?error=invalid_token', request.url)
            );
        }

        // Cek apakah token sudah expired
        const expiresAt = new Date(verification.expires_at);
        if (nowWIB > expiresAt) {
            return NextResponse.redirect(
                new URL('/auth/verification-failed?error=expired_token', request.url)
            );
        }

        // Update user menjadi verified
        const { error: updateUserError } = await supabase
            .from('users')
            .update({
                is_verified: true,
                verified_at: nowWIB.toISOString(),
                updated_at: nowWIB.toISOString(),
            })
            .eq('id', verification.user_id);

        if (updateUserError) {
            console.error('Error updating user:', updateUserError);
            return NextResponse.redirect(
                new URL('/auth/verification-failed?error=update_failed', request.url)
            );
        }

        // Update email verification record
        const { error: updateVerificationError } = await supabase
            .from('email_verifications')
            .update({
                verified_at: nowWIB.toISOString(),
                updated_at: nowWIB.toISOString(),
            })
            .eq('id', verification.id);

        if (updateVerificationError) {
            console.error('Error updating verification:', updateVerificationError);
        }

        // Log successful verification
        try {
            await supabase.from('email_logs').insert({
                user_id: verification.user_id,
                email: verification.email,
                type: 'verification_success',
                status: 'verified',
                created_at: nowWIB.toISOString(),
            });
        } catch (logError) {
            console.error('Failed to log verification success:', logError);
        }

        // Redirect ke halaman sukses
        return NextResponse.redirect(
            new URL('/auth/verification-success', request.url)
        );

    } catch (error) {
        console.error('Verify email error:', error);
        return NextResponse.redirect(
            new URL('/auth/verification-failed?error=server_error', request.url)
        );
    }
}
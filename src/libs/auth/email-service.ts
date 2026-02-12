// src/libs/email-service.ts

import nodemailer from 'nodemailer';
import supabase from '@/libs/supabase/client';
import { getWaktuWIB } from '@/utils/format';
import crypto from 'crypto';

interface EmailConfig {
    mail_mailer: string;
    mail_host: string;
    mail_port: number;
    mail_username: string;
    mail_password: string;
    mail_encryption: string;
    mail_from_address: string;
    mail_from_name: string;
}

async function getEmailConfig(): Promise<EmailConfig | null> {
    try {
        const { data, error } = await supabase
            .from('email_config')
            .select('*')
            .eq('is_active', true)
            .limit(1)
            .single();

        if (error) {
            console.error('Error getting email config:', error);
            return null;
        }

        if (!data) {
            console.error('No active email config found');
            return null;
        }

        return data as EmailConfig;
    } catch (error) {
        console.error('Exception in getEmailConfig:', error);
        return null;
    }
}

async function createEmailTransporter() {
    const config = await getEmailConfig();

    if (!config) {
        throw new Error('Email configuration not found in database. Please configure SMTP settings in admin panel.');
    }

    const transporter = nodemailer.createTransport({
        host: config.mail_host,
        port: config.mail_port,
        secure: config.mail_encryption === 'ssl',
        auth: {
            user: config.mail_username,
            pass: config.mail_password,
        },
        tls: {
            rejectUnauthorized: false,
        },
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 15000,
    });

    try {
        await transporter.verify();
    } catch (error) {
        console.error('Failed to verify email transporter:', error);
        throw new Error('Failed to verify email configuration');
    }

    return { transporter, config };
}

export function generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

export function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getOTPExpiry() {
    const nowWIB = getWaktuWIB();
    nowWIB.setMinutes(nowWIB.getMinutes() + 10);
    return nowWIB;
}

export function getVerificationTokenExpiry() {
    const nowWIB = getWaktuWIB();
    nowWIB.setHours(nowWIB.getHours() + 24); // Token berlaku 24 jam
    return nowWIB;
}

export async function verifyEmailConfig() {
    try {
        const { transporter } = await createEmailTransporter();
        await transporter.verify();
        return true;
    } catch (error) {
        console.error('Email config verification failed:', error);
        return false;
    }
}

async function sendEmailWithRetry(
    transporter: nodemailer.Transporter,
    mailOptions: nodemailer.SendMailOptions,
    maxRetries = 3,
    retryDelay = 2000
): Promise<{ success: boolean; messageId?: string; error?: string }> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const info = await transporter.sendMail(mailOptions);
            console.log(`Email sent successfully on attempt ${attempt}:`, info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            lastError = error as Error;
            console.error(`Email send attempt ${attempt} failed:`, error);

            if (attempt < maxRetries) {
                console.log(`Retrying in ${retryDelay}ms...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                retryDelay *= 2;
            }
        }
    }

    return {
        success: false,
        error: lastError?.message || 'Unknown error after retries'
    };
}

export async function sendVerificationEmail(
    email: string,
    username: string,
    verificationToken: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
        const { transporter, config } = await createEmailTransporter();

        // URL verifikasi
        const baseUrl = process.env.NODE_ENV === 'production'
            ? process.env.NEXT_PUBLIC_APP_URL
            : (process.env.NEXT_PUBLIC_APP_URL_DEVELOPMENT || 'http://localhost:3000');

        const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${verificationToken}`;

        const mailOptions = {
            from: `${config.mail_from_name} <${config.mail_from_address}>`,
            to: email,
            subject: 'Verifikasi Akun Anda',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
                        <h2 style="color: #333; margin-bottom: 20px;">Halo ${username},</h2>
                        
                        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                            Terima kasih telah mendaftar! Untuk mengaktifkan akun Anda, silakan klik tombol di bawah ini:
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${verificationUrl}" 
                               style="display: inline-block; 
                                      padding: 15px 40px; 
                                      background-color: #16a34a; 
                                      color: white; 
                                      text-decoration: none; 
                                      border-radius: 8px; 
                                      font-weight: bold;
                                      font-size: 16px;">
                                Verifikasi Akun Saya
                            </a>
                        </div>

                        <p style="color: #666; line-height: 1.6; margin-top: 30px; font-size: 14px;">
                            Atau salin dan tempel link berikut di browser Anda:
                        </p>
                        <div style="background-color: #fff; 
                                    padding: 15px; 
                                    border-radius: 5px; 
                                    border: 1px solid #e5e7eb;
                                    word-break: break-all;
                                    font-size: 13px;
                                    color: #666;">
                            ${verificationUrl}
                        </div>

                        <p style="color: #666; line-height: 1.6; margin-top: 20px;">
                            Link ini berlaku selama <strong style="color: #dc2626;">24 jam</strong>.
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                        
                        <p style="color: #999; font-size: 14px;">
                            Jika Anda tidak mendaftar akun ini, abaikan email ini.
                        </p>
                    </div>
                </div>
            `
        };

        return await sendEmailWithRetry(transporter, mailOptions);

    } catch (error) {
        console.error('Error in sendVerificationEmail:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

export async function sendForgotPasswordEmail(
    email: string,
    username: string,
    otp: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
        const { transporter, config } = await createEmailTransporter();

        const mailOptions = {
            from: `${config.mail_from_name} <${config.mail_from_address}>`,
            to: email,
            subject: 'Reset Password - Kode Verifikasi',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
                        <h2 style="color: #333;">Halo ${username},</h2>
                        <p style="color: #666; line-height: 1.6;">
                            Kami menerima permintaan untuk mereset password akun Anda. 
                            Gunakan kode verifikasi berikut:
                        </p>
                        
                        <div style="background-color: #fff; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center;">
                            <h1 style="letter-spacing: 8px; color: #dc2626; margin: 0; font-size: 36px;">
                                ${otp}
                            </h1>
                        </div>

                        <p style="color: #666; line-height: 1.6;">
                            Kode ini berlaku selama <strong style="color: #dc2626;">10 menit</strong>.
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                        
                        <p style="color: #999; font-size: 14px;">
                            ⚠️ Jika Anda tidak meminta reset password, abaikan email ini dan pastikan akun Anda aman.
                        </p>
                    </div>
                </div>
            `
        };

        return await sendEmailWithRetry(transporter, mailOptions);

    } catch (error) {
        console.error('Error in sendForgotPasswordEmail:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

export async function sendAdminNotification(
    subject: string,
    htmlContent: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const { transporter, config } = await createEmailTransporter();

        const { data: adminEmails, error } = await supabase
            .from('admin_emails')
            .select('email')
            .eq('is_active', true);

        if (error || !adminEmails || adminEmails.length === 0) {
            return { success: false, error: 'No active admin emails' };
        }

        const emailList = adminEmails.map(admin => admin.email).join(', ');

        const mailOptions = {
            from: `${config.mail_from_name} <${config.mail_from_address}>`,
            to: emailList,
            subject: subject,
            html: htmlContent,
        };

        const result = await sendEmailWithRetry(transporter, mailOptions);
        return { success: result.success, error: result.error };

    } catch (error) {
        console.error('Error in sendAdminNotification:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}
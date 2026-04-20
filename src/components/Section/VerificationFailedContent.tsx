'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerificationFailed() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    const getErrorMessage = () => {
        switch (error) {
            case 'missing_token':
                return {
                    title: 'Link Tidak Valid',
                    message: 'Link verifikasi tidak lengkap. Pastikan Anda mengklik link dari email yang benar.',
                    showResend: true,
                };
            case 'invalid_token':
                return {
                    title: 'Token Tidak Valid',
                    message: 'Token verifikasi tidak ditemukan atau sudah digunakan. Silakan minta link verifikasi baru.',
                    showResend: true,
                };
            case 'expired_token':
                return {
                    title: 'Link Kadaluarsa',
                    message: 'Link verifikasi sudah kadaluarsa. Link hanya berlaku selama 24 jam. Silakan minta link verifikasi baru.',
                    showResend: true,
                };
            case 'update_failed':
                return {
                    title: 'Gagal Memverifikasi',
                    message: 'Terjadi kesalahan saat memverifikasi akun Anda. Silakan coba lagi nanti atau hubungi customer support.',
                    showResend: false,
                };
            case 'server_error':
                return {
                    title: 'Kesalahan Server',
                    message: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
                    showResend: false,
                };
            default:
                return {
                    title: 'Verifikasi Gagal',
                    message: 'Terjadi kesalahan yang tidak diketahui. Silakan hubungi customer support.',
                    showResend: true,
                };
        }
    };

    const { title, message, showResend } = getErrorMessage();

    return (
        <section className="">
            <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        {/* Error Icon */}
                        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100 mb-6">
                            <svg
                                className="h-16 w-16 text-red-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </div>

                        {/* Title */}
                        <h2 className="text-3xl font-bold text-neutral-900 mb-1">
                            {title}
                        </h2>

                        {/* Description */}
                        <p className="text-neutral-700 text-base mb-8">
                            {message}
                        </p>

                        {/* Error details */}
                        {error && (
                            <div className="bg-red-50 border border-red-300 rounded-sm p-4 mb-6">
                                <p className="text-xs text-red-600 font-mono">
                                    Error code: {error}
                                </p>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="space-y-3">
                            {showResend && (
                                <Link
                                    href="/auth/resend-verification"
                                    className="w-full inline-flex justify-center items-center px-6 py-3 
                                    border border-transparent text-base font-medium rounded-sm 
                                    text-neutral-50 bg-neutral-900 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900
                                    transition-all duration-300 ease-in-out hover:border-neutral-500
                                    hover:-translate-y-0.5 hover:shadow-[-5px_6px_0_rgba(107,114,128,1)]"
                                >
                                    Kirim Ulang Email Verifikasi
                                </Link>
                            )}

                            <Link
                                href="/auth/login"
                                className="w-full inline-flex justify-center items-center px-6 py-3 
                                border border-neutral-300 text-base font-medium rounded-sm text-neutral-700 
                                bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 
                                transition-all duration-300 ease-in-out hover:border-neutral-500
                                hover:-translate-y-0.5 hover:shadow-[-5px_6px_0_rgba(24,24,25,1)]"
                            >
                                Kembali ke Login
                            </Link>

                            <Link
                                href="/"
                                className="w-full inline-flex justify-center items-center px-6 py-3 text-base font-medium text-neutral-600 hover:text-neutral-800 hover:underline transition-colors"
                            >
                                Kembali ke Beranda
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
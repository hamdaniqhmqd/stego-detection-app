// src/app/auth/verification-success/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function VerificationSuccess() {
    const router = useRouter();
    const [countdown, setCountdown] = useState(5);

    // useEffect(() => {
    //     // Auto redirect ke login setelah 5 detik
    //     const timer = setInterval(() => {
    //         setCountdown((prev) => {
    //             if (prev <= 1) {
    //                 clearInterval(timer);
    //                 router.push('/auth/login');
    //                 return 0;
    //             }
    //             return prev - 1;
    //         });
    //     }, 1000);

    //     return () => clearInterval(timer);
    // }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    {/* Success Icon with Animation */}
                    <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6 animate-bounce">
                        <svg
                            className="h-16 w-16 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Verifikasi Berhasil!
                    </h2>

                    {/* Description */}
                    <p className="text-gray-600 mb-8">
                        Selamat! Email Anda telah berhasil diverifikasi.
                        Akun Anda sekarang aktif dan siap digunakan.
                    </p>

                    {/* Success Message Box */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start">
                            <svg
                                className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <div className="text-left">
                                <p className="text-sm font-medium text-green-800">
                                    Akun Anda telah diaktifkan
                                </p>
                                <p className="text-sm text-green-700 mt-1">
                                    Anda sekarang dapat login dan mengakses semua fitur.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Countdown Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-blue-800">
                            Anda akan diarahkan ke halaman login dalam{' '}
                            <strong className="text-blue-900 text-lg">{countdown}</strong> detik...
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <Link
                            href="/auth/login"
                            className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors"
                        >
                            Login Sekarang
                        </Link>

                        <Link
                            href="/"
                            className="w-full inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                        >
                            Kembali ke Beranda
                        </Link>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-500">
                            💡 <strong>Tips:</strong> Gunakan email dan password yang sama
                            untuk login ke akun Anda.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
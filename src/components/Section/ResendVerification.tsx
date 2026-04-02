'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ResendVerification() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/resend-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();

            if (result.success) {
                setSuccess(true);
                // Redirect ke check-email page setelah 2 detik
                setTimeout(() => {
                    router.push(`/auth/check-email?email=${encodeURIComponent(email)}`);
                }, 2000);
            } else {
                setError(result.message || 'Gagal mengirim email verifikasi');
            }
        } catch (err) {
            setError('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 lg:py-20 sm:py-14 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg w-full space-y-8">
                <div className="text-center">
                    {/* Icon */}
                    <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-blue-100 mb-6">
                        <svg
                            className="h-16 w-16 text-blue-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                        </svg>
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl font-bold text-neutral-900 mb-2">
                        Kirim Ulang Email Verifikasi
                    </h2>

                    {/* Description */}
                    <p className="text-neutral-600 mb-8">
                        Masukkan email Anda dan kami akan mengirimkan link verifikasi baru.
                    </p>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-sm p-4 mb-6">
                        <div className="flex items-start">
                            <svg
                                className="h-5 w-5 text-green-600 mt-0.5 mr-3"
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
                            <div>
                                <p className="text-sm font-medium text-green-800">
                                    Email verifikasi berhasil dikirim!
                                </p>
                                <p className="text-sm text-green-700 mt-1">
                                    Silakan cek inbox Anda. Anda akan diarahkan ke halaman selanjutnya...
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-sm p-4 mb-6">
                        <div className="flex items-start">
                            <svg
                                className="h-5 w-5 text-red-600 mt-0.5 mr-3"
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
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                            Alamat Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full px-4 h-12 text-neutral-700 placeholder-neutral-500 bg-neutral-50 border border-neutral-400 rounded-sm 
                            focus:border-neutral-600 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-neutral-600"
                            placeholder="nama@email.com"
                            required
                            disabled={isLoading || success}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || success}
                        className="w-full py-3 text-white bg-neutral-900 hover:bg-neutral-800 rounded-sm 
                        disabled:bg-neutral-600 disabled:text-neutral-400 disabled:cursor-not-allowed font-medium
                        transition-all duration-300 ease-in-out hover:border-neutral-500
                        hover:-translate-y-0.5 hover:shadow-[-5px_6px_0_rgba(107,114,128,1)]"
                    >
                        {isLoading ? 'Mengirim...' : success ? 'Berhasil Dikirim!' : 'Kirim Email Verifikasi'}
                    </button>
                </form>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-400 rounded-sm p-4">
                    <p className="text-sm text-blue-800">
                        <strong>Catatan:</strong> Anda hanya bisa mengirim ulang email setiap 1 menit.
                        Jika tidak menemukan email, periksa folder spam/junk Anda.
                    </p>
                </div>

                {/* Back to Login */}
                <div className="text-center">
                    <Link
                        href="/auth/login"
                        className="text-sm text-neutral-600 hover:text-neutral-800 hover:underline transition-colors"
                    >
                        ← Kembali ke Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
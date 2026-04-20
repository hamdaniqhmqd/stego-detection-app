'use client';

import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-black font-mono">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-8 lg:py-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

                    {/* Brand — full width on mobile, spans 2 cols on lg */}
                    <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                        <Link
                            href="#"
                            className="flex items-center space-x-2 rtl:space-x-reverse mb-2"
                        >
                            <h2 className="whitespace-nowrap text-xl font-semibold text-white">
                                Deteksi Stego
                            </h2>
                        </Link>
                        <p className="text-sm text-gray-500 leading-relaxed max-w-prose">
                            Aplikasi Deteksi Steganografi LSB untuk membuat dan menganalisa pesan
                            tersembunyi dengan bantuan AI sebagai media Interpretasinya.
                            Sebagai himbauan, sistem ini bersifat prototype dan masih dalam tahap
                            pengembangan, jadi sistem ini tidak digunakan sebagai acuan mutlak
                            sistem keamanan informasi.
                        </p>
                    </div>

                    {/* Links — stacked on mobile, side by side on sm+ */}
                    <div className="col-span-1 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-1 gap-6 lg:gap-4">
                        <div>
                            <h2 className="text-base lg:text-lg text-gray-50 mb-2 font-semibold">
                                Menu
                            </h2>
                            <div className="flex flex-col gap-2 text-sm">
                                <Link
                                    href="/dashboard/buat_stego"
                                    className="text-gray-500 hover:text-gray-300 hover:underline transition-colors duration-200"
                                >
                                    Buat Stego
                                </Link>
                                <Link
                                    href="/dashboard/analisis_stego"
                                    className="text-gray-500 hover:text-gray-300 hover:underline transition-colors duration-200"
                                >
                                    Analisis Stego
                                </Link>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-base lg:text-lg text-gray-50 mb-2 font-semibold">
                                Autentikasi
                            </h2>
                            <div className="flex flex-col gap-2 text-sm">
                                <Link
                                    href="/auth/login"
                                    className="text-gray-500 hover:text-gray-300 hover:underline transition-colors duration-200"
                                >
                                    Masuk
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="text-gray-500 hover:text-gray-300 hover:underline transition-colors duration-200"
                                >
                                    Daftar
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="my-6 border-neutral-800" />

                <div className="flex items-center justify-center">
                    <span className="text-sm text-gray-400 text-center">
                        © 2026{' '}
                        <Link href="#" className="hover:underline hover:text-gray-200 transition-colors duration-200">
                            Stego Detection
                        </Link>
                        . All Rights Reserved.
                    </span>
                </div>
            </div>
        </footer>
    );
}
'use client';

import Link from 'next/link';
import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-black">
            <div className="mx-auto w-full p-4 py-6 lg:py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {/* Brand */}
                    <div className="w-full col-span-2">
                        <Link
                            href={"#"}
                            className="flex items-center space-x-3 rtl:space-x-reverse mb-1"
                        >
                            <h2 className="self-center whitespace-nowrap text-xl font-semibold text-heading">
                                Deteksi Stego
                            </h2>
                        </Link>
                        <p className="text-sm text-gray-500">
                            Aplikasi Deteksi Steganografi LSB untuk membuat dan menganalisa pesan tersembunyi dengan bantuan AI sebagai media Interpretasinya.
                            Sebagai himbauan, sistem ini bersifat prototype dan masih dalam tahap pengembangan, jadi sistem ini tidak digunakan sebagai acuan mutlak sistem keamanan informasi.
                        </p>
                    </div>

                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="w-full flex flex-col">
                            <h2 className="text-lg text-gray-50 mb-1 font-semibold">Menu</h2>
                            <div className="flex items-center flex-wrap gap-2 text-sm">
                                <Link href={'/dashboard/buat_stego'}
                                    className={`relative flex items-center text-gray-500 hover:text-gray-300 hover:underline text-nowrap`}>
                                    Buat Stego
                                </Link>

                                <Link href={'/dashboard/analisis_stego'}
                                    className={`relative flex items-center text-gray-500 hover:text-gray-300 hover:underline text-nowrap`}>
                                    Analisis Stego
                                </Link>
                            </div>
                        </div>

                        <div className="w-full flex flex-col">
                            <h2 className="text-lg text-gray-50 mb-1 font-semibold">Autentikasi</h2>
                            <div className="flex items-center flex-wrap gap-2 text-sm">
                                <Link href={'/auth/login'}
                                    className={`relative flex items-center text-gray-500 hover:text-gray-300 hover:underline text-nowrap`}>
                                    Masuk
                                </Link>

                                <Link href={'/auth/register'}
                                    className={`relative flex items-center text-gray-500 hover:text-gray-300 hover:underline text-nowrap`}>
                                    Daftar
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="my-4 border-default sm:mx-auto lg:my-6" />

                <div className="flex items-center justify-center">
                    <span className="text-sm text-gray-200 sm:text-center">
                        © 2026 <Link href="#" className="hover:underline">Stego Detection</Link>. All Rights Reserved.
                    </span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
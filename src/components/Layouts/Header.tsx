'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const Navbar: React.FC = () => {
    return (
        <nav className="relative w-full container mx-auto bg-gray-950">
            <div className="flex items-center justify-between px-4 py-3">
                {/* Brand */}
                <Link
                    href={"#"}
                    className="flex items-center space-x-3 rtl:space-x-reverse"
                >
                    <span className="self-center whitespace-nowrap text-xl font-semibold text-heading">
                        Deteksi Stego
                    </span>
                </Link>

                {/* Right */}
                <div className="flex items-center gap-2">
                    <Link href={'/auth/login'}
                        className={`relative flex items-center rounded bg-gray-800 py-1.5 px-4 text-sm font-semibold text-white hover:bg-gray-700`}>
                        Masuk
                    </Link>

                    <Link href={'/auth/register'}
                        className={`relative flex items-center rounded py-1.5 px-4 text-sm font-semibold text-gray-50 hover:bg-gray-900`}>
                        Daftar
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
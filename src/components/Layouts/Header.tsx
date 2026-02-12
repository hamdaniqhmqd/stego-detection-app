'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

/* =====================
 * Component
 * ===================== */
const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="relativez-20 w-full bg-gray-950">
            <div className="container mx-auto flex max-w-screen-xl flex-wrap items-center justify-between py-3">
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

                    <Link href={'#'}
                        className={`relative flex items-center rounded py-1.5 px-4 text-sm font-semibold text-gray-50 hover:bg-gray-900`}>
                        Daftar
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
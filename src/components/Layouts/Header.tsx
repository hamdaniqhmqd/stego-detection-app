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
        <nav className="relativez-20 w-full bg-teal-950">
            <div className="container mx-auto flex max-w-screen-xl flex-wrap items-center justify-between py-3">
                {/* Brand */}
                <Link
                    href={"#"}
                    className="flex items-center space-x-3 rtl:space-x-reverse"
                >
                    <span className="self-center whitespace-nowrap text-xl font-semibold text-heading">
                        Stego Detection
                    </span>
                </Link>

                {/* Right */}
                <div className="flex items-center gap-2">
                    <Link href={'/auth/login'}
                        className={`relative flex items-center rounded bg-teal-600 py-1.5 px-4 text-sm font-medium text-white hover:bg-teal-700`}>
                        Masuk
                    </Link>

                    <Link href={'#'}
                        className={`relative flex items-center rounded bg-teal-50 py-1.5 px-4 text-sm font-medium text-teal-950 hover:bg-teal-100`}>
                        Daftar
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
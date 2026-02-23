'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const Navbar: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={`
                fixed top-0 left-0 right-0 z-50
                transition-all duration-300 ease-in-out
                ${scrolled
                    ? 'mx-4 mt-3 rounded-lg bg-white/40 backdrop-blur-md shadow-lg shadow-neutral-900/10 border border-neutral-200/60'
                    : 'mx-0 mt-0 rounded-none bg-neutral-100 border-b border-neutral-200'
                }
            `}
        >
            <div className="container mx-auto flex items-center justify-between px-4 py-4">
                {/* Brand */}
                <Link
                    href={"#"}
                    className="flex items-center space-x-3 rtl:space-x-reverse"
                >
                    <span className="self-center whitespace-nowrap text-xl font-semibold text-neutral-900">
                        Deteksi Stego
                    </span>
                </Link>

                {/* Right */}
                <div className="flex items-center gap-2 md:gap-3">
                    <Link
                        href={'/auth/login'}
                        className="
                        relative flex items-center 
                        rounded-sm py-1.5 md:py-2 px-4 md:px-6 text-sm
                        bg-neutral-800 font-semibold text-white hover:bg-neutral-900
                        transition-all duration-300 ease-in-out
                        hover:-translate-y-0.5 hover:shadow-[-4px_4px_0_rgba(107,114,128,1)]
                        "
                    >
                        Masuk
                    </Link>

                    <Link
                        href={'/auth/register'}
                        className="
                        relative flex items-center 
                        rounded-sm py-1.5 md:py-2 px-4 md:px-6 text-sm
                        font-semibold text-neutral-700 border border-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 hover:border hover:border-neutral-900 
                        transition-all duration-300 ease-in-out
                        hover:-translate-y-0.5 hover:shadow-[-4px_4px_0_rgba(26,26,46,1)]"
                    >
                        Daftar
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
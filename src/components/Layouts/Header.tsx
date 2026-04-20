'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
            if (window.scrollY > 20) setMenuOpen(false);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close menu on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) setMenuOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <nav
            className={`
                fixed top-0 left-0 right-0 z-50 font-mono
                transition-all duration-300 ease-in-out
                ${scrolled
                    ? 'mx-3 sm:mx-6 mt-3 rounded-lg bg-white/40 backdrop-blur-md shadow-lg shadow-neutral-900/10 border border-neutral-200'
                    : 'mx-0 mt-0 rounded-none bg-neutral-50 border-b border-neutral-200'
                }
            `}
        >
            <div className="container mx-auto flex items-center justify-between px-4 py-3 md:py-4">
                {/* Brand */}
                <Link
                    href="/"
                    className="flex items-center space-x-2 rtl:space-x-reverse"
                >
                    <span className="self-center whitespace-nowrap text-lg md:text-xl font-semibold text-neutral-900">
                        Deteksi Stego
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-2 md:gap-3">
                    <Link
                        href="/auth/login"
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
                        href="/auth/register"
                        className="
                            relative flex items-center
                            rounded-sm py-1.5 md:py-2 px-4 md:px-6 text-sm
                            font-semibold text-neutral-700 border border-neutral-400
                            hover:text-neutral-900 hover:bg-neutral-50 hover:border hover:border-neutral-900
                            transition-all duration-300 ease-in-out
                            hover:-translate-y-0.5 hover:shadow-[-4px_4px_0_rgba(26,26,46,1)]
                        "
                    >
                        Daftar
                    </Link>
                </div>

                {/* Hamburger Button (Mobile) */}
                <button
                    className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded-sm border border-neutral-300 bg-white/70 hover:bg-neutral-100 transition-colors duration-200"
                    onClick={() => setMenuOpen((prev) => !prev)}
                    aria-label="Toggle menu"
                    aria-expanded={menuOpen}
                >
                    <span className={`block w-4.5 h-0.5 bg-neutral-800 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} style={{ width: '18px' }} />
                    <span className={`block h-0.5 bg-neutral-800 transition-all duration-300 ${menuOpen ? 'opacity-0 scale-x-0' : 'opacity-100'}`} style={{ width: '18px' }} />
                    <span className={`block h-0.5 bg-neutral-800 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} style={{ width: '18px' }} />
                </button>
            </div>

            {/* Mobile Dropdown Menu */}
            <div
                className={`
                    md:hidden overflow-hidden transition-all duration-300 ease-in-out
                    ${menuOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}
                `}
            >
                <div className="flex flex-col gap-2 px-4 pb-4">
                    <Link
                        href="/auth/login"
                        onClick={() => setMenuOpen(false)}
                        className="
                            flex items-center justify-center
                            rounded-sm py-2 px-4 text-sm
                            bg-neutral-800 font-semibold text-white hover:bg-neutral-900
                            transition-all duration-200
                        "
                    >
                        Masuk
                    </Link>
                    <Link
                        href="/auth/register"
                        onClick={() => setMenuOpen(false)}
                        className="
                            flex items-center justify-center
                            rounded-sm py-2 px-4 text-sm
                            font-semibold text-neutral-700 border border-neutral-400
                            hover:text-neutral-900 hover:bg-neutral-50 hover:border-neutral-900
                            transition-all duration-200
                        "
                    >
                        Daftar
                    </Link>
                </div>
            </div>
        </nav>
    );
}
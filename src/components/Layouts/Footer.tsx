'use client';

import Link from 'next/link';
import React from 'react';

type FooterLink = {
    label: string;
    href: string;
};

type FooterSection = {
    title: string;
    links: FooterLink[];
};

const BRAND = {
    name: 'Flowbite',
    url: 'https://flowbite.com/',
    logo: 'https://flowbite.com/docs/images/logo.svg',
};

const FOOTER_SECTIONS: FooterSection[] = [
    {
        title: 'Resources',
        links: [
            { label: 'Flowbite', href: 'https://flowbite.com/' },
            { label: 'Tailwind CSS', href: 'https://tailwindcss.com/' },
        ],
    },
    {
        title: 'Follow us',
        links: [
            { label: 'Github', href: 'https://github.com/themesberg/flowbite' },
            { label: 'Discord', href: 'https://discord.gg/4eeurUVvTy' },
        ],
    },
    {
        title: 'Legal',
        links: [
            { label: 'Privacy Policy', href: '#' },
            { label: 'Terms & Conditions', href: '#' },
        ],
    },
];

const COPYRIGHT = {
    year: 2023,
    text: 'All Rights Reserved.',
};

const Footer: React.FC = () => {
    return (
        <footer className="bg-black">
            <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
                <div className="md:flex md:justify-between">
                    {/* Brand */}
                    <div className="">
                        <Link
                            href={"#"}
                            className="flex items-center space-x-3 rtl:space-x-reverse"
                        >
                            <span className="self-center whitespace-nowrap text-xl font-semibold text-heading">
                                Stego Detection App
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <div className="flex items-center gap-2 md:gap-4">
                            <Link href={'#'}
                                className={`relative flex items-center text-white hover:text-gray-200`}>
                                Buat Stego
                            </Link>

                            <Link href={'#'}
                                className={`relative flex items-center text-white hover:text-gray-200`}>
                                Analisis Stego
                            </Link>
                        </div>

                        <div className="flex items-center gap-2 md:gap-4">
                            <Link href={'#'}
                                className={`relative flex items-center text-white hover:text-gray-200`}>
                                Masuk
                            </Link>

                            <Link href={'#'}
                                className={`relative flex items-center text-white hover:text-gray-200`}>
                                Daftar
                            </Link>
                        </div>
                    </div>
                </div>

                <hr className="my-6 border-default sm:mx-auto lg:my-8" />

                <div className="flex items-center justify-center">
                    <span className="text-sm text-body sm:text-center">
                        © 2026 <Link href="#" className="hover:underline">Stego Detection</Link>. All Rights Reserved.
                    </span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
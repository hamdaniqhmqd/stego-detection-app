'use client';

import DashboardLayoutUsers from "@/components/Layouts/DashboardLayoutUsers";
import Link from "next/link";

export default function DashboardPage() {
    return (
        <DashboardLayoutUsers>
            <section className="w-full h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 w-4/5 md:w-2/3">
                    <div className="flex flex-col items-center gap-2 mb-4">
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-center text-neutral-900">Selamat Datang di Dashboard</h1>

                        <p className="text-center text-sm text-neutral-700">
                            Aplikasi Deteksi Steganografi LSB untuk membuat dan menganalisa pesan tersembunyi dengan bantuan AI sebagai media Interpretasinya.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <Link href="/dashboard/buat_stego"
                            className={`
                                relative rounded-sm px-6 py-3
                                flex flex-col gap-3 cursor-pointer
                                bg-neutral-100 border border-neutral-900
                                text-neutral-900 font-semibold
                                transition-all duration-300 ease-in-out
                                hover:-translate-y-0.5 hover:shadow-[-7px_7px_0_rgba(26,26,46,1)]
                            `}>
                            Buat Stego
                        </Link>

                        <Link href="/dashboard/analisis_stego"
                            className={`
                            relative rounded-sm px-6 py-3
                            flex flex-col gap-3 cursor-pointer
                            bg-neutral-100 border border-neutral-900
                            text-neutral-900 font-semibold
                            transition-all duration-300 ease-in-out
                            hover:-translate-y-0.5 hover:shadow-[-7px_7px_0_rgba(26,26,46,1)]
                            `}>
                            Analisis Stego
                        </Link>
                    </div>

                    <div className="w-full max-w-2xl">
                        <p className="text-center text-neutral-800 text-xs">
                            Sebagai himbauan, sistem ini bersifat prototype dan masih dalam tahap pengembangan, jadi sistem ini tidak digunakan sebagai acuan mutlak sistem keamanan informasi.
                        </p>
                    </div>
                </div>
            </section>
        </DashboardLayoutUsers>
    );
}
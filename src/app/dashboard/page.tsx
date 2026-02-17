'use client';

import DashboardLayoutUsers from "@/components/Layouts/DashboardLayoutUsers";
import Link from "next/link";

export default function DashboardPage() {
    return (
        <DashboardLayoutUsers>
            <section className="w-full h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 w-4/5 md:w-2/3">
                    <div className="flex flex-col items-center gap-2 mb-4">
                        <h1 className="text-2xl font-bold text-center">Selamat Datang di Dashboard</h1>

                        <p className="text-center text-sm">
                            Aplikasi Deteksi Steganografi LSB untuk membuat dan menganalisa pesan tersembunyi dengan bantuan AI sebagai media Interpretasinya.
                            Sebagai himbauan, sistem ini bersifat prototype dan masih dalam tahap pengembangan, jadi sistem ini tidak digunakan sebagai acuan mutlak sistem keamanan informasi.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href="/dashboard/buat_stego"
                            className={`relative flex items-center rounded bg-gray-900 py-2 px-6 text-lg font-semibold text-white hover:shadow-lg hover:shadow-gray-900`}>
                            Buat Stego
                        </Link>

                        <Link href="/dashboard/analisis_stego"
                            className={`relative flex items-center rounded bg-gray-50 py-2 px-6 text-lg font-semibold border-2 border-gray-900 text-gray-950 hover:shadow-lg hover:shadow-gray-800`}>
                            Analisis Stego
                        </Link>
                    </div>
                </div>
            </section>
        </DashboardLayoutUsers>
    );
}
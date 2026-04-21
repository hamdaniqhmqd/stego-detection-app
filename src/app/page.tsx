import MainLayouts from '@/components/Layouts/MainLayouts';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Stego App | Buat & Analisa Steganografi',
  description:
    'Aplikasi steganografi untuk membuat dan menganalisa pesan tersembunyi dengan cepat dan aman.',
  keywords: [
    'steganografi',
    'stego',
    'keamanan data',
    'analisa stego',
    'enkripsi pesan',
  ],
  authors: [{ name: 'Stego App Team' }],
  openGraph: {
    title: 'Stego App',
    description:
      'Platform steganografi untuk menyisipkan dan menganalisa pesan tersembunyi.',
    type: 'website',
    locale: 'id_ID',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Home() {
  return (
    <MainLayouts>
      {/* Hero Section */}
      <section className="w-full min-h-screen bg-neutral-100 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-24 sm:py-28 lg:py-32">
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-8 text-center">

          {/* Heading + Description */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center">
              <span className="inline-block w-auto rounded-sm border border-neutral-400 bg-white px-3 py-1 text-xs font-medium text-neutral-600 tracking-widest uppercase">
                Prototype
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase text-neutral-900 leading-tight tracking-tight">
              Deteksi<br className="sm:hidden" /> Steganografi
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 font-normal max-w-2xl mx-auto leading-relaxed">
              Aplikasi Deteksi Steganografi LSB untuk membuat dan menganalisa
              pesan tersembunyi dengan bantuan AI sebagai media interpretasinya.
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-3 w-full">
            <span className="text-xs text-neutral-600 font-normal tracking-wide">
              Coba Sekarang:
            </span>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <Link
                href="/dashboard/buat_stego"
                className="
                  relative rounded-sm px-8 py-3
                  flex items-center justify-center
                  bg-neutral-100 border border-neutral-900
                  text-neutral-900 text-sm font-semibold
                  transition-all duration-300 ease-in-out
                  hover:-translate-y-0.5 hover:border-neutral-900 hover:shadow-[-5px_5px_0_rgba(26,26,46,0.8)]
                  active:translate-y-0 active:shadow-none
                  w-full sm:w-auto
                "
              >
                Buat Stego
              </Link>
              <Link
                href="/dashboard/analisis_stego"
                className="
                  relative rounded-sm px-8 py-3
                  flex items-center justify-center
                  bg-neutral-100 border border-neutral-400
                  text-neutral-800 text-sm font-semibold
                  transition-all duration-300 ease-in-out
                  hover:-translate-y-0.5 hover:border-neutral-900 hover:shadow-[-5px_5px_0_rgba(26,26,46,0.8)]
                  active:translate-y-0 active:shadow-none
                  w-full sm:w-auto
                "
              >
                Analisis Stego
              </Link>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-neutral-600 max-w-md mx-auto leading-relaxed">
            Sistem ini bersifat prototype dan masih dalam tahap pengembangan.
            Tidak digunakan sebagai acuan mutlak sistem keamanan informasi.
          </p>
        </div>
      </section>
    </MainLayouts>
  );
}
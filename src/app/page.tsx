import MainLayouts from '@/components/Layouts/MainLayouts';
import type { Metadata } from 'next';
import Link from 'next/link';

/**
 * SEO Metadata
 */
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
    <>
      <MainLayouts>
        {/* Hero Section */}
        <section className="w-full min-h-screen bg-neutral-100 lg:py-20 sm:py-14 py-10 flex items-center justify-center">
          <div className="container mx-auto flex flex-col items-center justify-center gap-6 text-center">

            <div className="flex flex-col gap-4">
              {/* Title */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase text-neutral-900">Deteksi Steganografi</h1>

              {/* Description */}
              <div className="flex w-full max-w-2xl flex-col gap-2 text-neutral-700 text-md">
                <p className="text-center text-base font-normal">
                  Aplikasi Deteksi Steganografi LSB untuk membuat dan menganalisa pesan tersembunyi dengan bantuan AI sebagai media Interpretasinya.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-6 flex flex-col items-center gap-2">
              <span className="text-sm text-neutral-800 font-normal">Coba Sekarang:</span>
              <div className="flex items-center gap-4">
                <Link href="/dashboard/buat_stego"
                  className={`
                  relative rounded-sm px-6 py-3
                  flex flex-col gap-3 cursor-pointer
                  bg-neutral-100 border border-neutral-900
                  text-neutral-900 font-semibold
                  transition-all duration-300 ease-in-out
                  hover:-translate-y-0.5 hover:shadow-[-5px_5px_0_rgba(26,26,46,1)]
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
                    hover:-translate-y-0.5 hover:shadow-[-5px_5px_0_rgba(26,26,46,1)]
                  `}>
                  Analisis Stego
                </Link>
              </div>
            </div>

            <div className="w-full max-w-2xl">
              <p className="text-center text-neutral-800 text-xs">
                Sebagai himbauan, sistem ini bersifat prototype dan masih dalam tahap pengembangan, jadi sistem ini tidak digunakan sebagai acuan mutlak sistem keamanan informasi.
              </p>
            </div>
          </div>
        </section>



        <section className="w-full bg-neutral-200 lg:py-20 sm:py-14 py-10">

        </section>

        <section className=""></section>

        <section className=""></section>

        <section className=""></section>
      </MainLayouts>
    </>
  );
}
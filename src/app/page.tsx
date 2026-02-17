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
        <section className="w-full lg:py-20 sm:py-14 py-10">
          <div className="container mx-auto flex flex-col items-center justify-center gap-6 text-center">

            <div className="flex flex-col gap-4">
              {/* Title */}
              <h1 className="text-3xl font-black uppercase text-gray-950">Deteksi Stegonografi</h1>

              {/* Description */}
              <div className="flex w-full max-w-2xl flex-col gap-2 text-gray-900 text-md">
                <p className="text-center text-base">
                  Aplikasi Deteksi Steganografi LSB untuk membuat dan menganalisa pesan tersembunyi dengan bantuan AI sebagai media Interpretasinya.
                  Sebagai himbauan, sistem ini bersifat prototype dan masih dalam tahap pengembangan, jadi sistem ini tidak digunakan sebagai acuan mutlak sistem keamanan informasi.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-6 flex flex-col items-center gap-4">
              <span className="text-sm text-gray-900 font-semibold">Coba Sekarang</span>
              <div className="flex items-center gap-2">
                <Link href="/dashboard/buat_stego"
                  className={`relative flex items-center rounded bg-gray-900 py-2 px-6 text-lg font-semibold text-white hover:bg-gray-950`}>
                  Buat Stego
                </Link>

                <Link href="/dashboard/analisis_stego"
                  className={`relative flex items-center rounded bg-gray-50 py-2 px-6 text-lg font-semibold border-2 border-gray-900 text-gray-950 hover:bg-gray-100`}>
                  Analisis Stego
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Information Section */}
        <section className="py-10 hidden">

          <div className="container mx-auto flex flex-col items-center gap-6 text-center">

            <div className="w-full grid grid-cols-1 gap-6 md:grid-cols-2">

              <div className="w-full flex flex-col bg-gray-300 p-4 rounded-md">
                <div className="h-8 w-2/3 bg-gray-50 rounded-md"></div>

                <div className="flex flex-col gap-2 mt-4">
                  <div className="h-4 w-full bg-gray-50 rounded-md"></div>
                  <div className="h-4 w-full bg-gray-50 rounded-md"></div>
                  <div className="h-4 w-full bg-gray-50 rounded-md"></div>
                  <div className="h-4 w-2/3 bg-gray-50 rounded-md"></div>
                </div>
              </div>

              <div className="w-full flex flex-col bg-gray-300 p-4 rounded-md">
                <div className="h-8 w-2/3 bg-gray-50 rounded-md"></div>

                <div className="flex flex-col gap-2 mt-4">
                  <div className="h-4 w-full bg-gray-50 rounded-md"></div>
                  <div className="h-4 w-full bg-gray-50 rounded-md"></div>
                  <div className="h-4 w-full bg-gray-50 rounded-md"></div>
                  <div className="h-4 w-2/3 bg-gray-50 rounded-md"></div>
                </div>
              </div>

              <div className="w-full flex flex-col bg-gray-300 p-4 rounded-md">
                <div className="h-8 w-2/3 bg-gray-50 rounded-md"></div>

                <div className="flex flex-col gap-2 mt-4">
                  <div className="h-4 w-full bg-gray-50 rounded-md"></div>
                  <div className="h-4 w-full bg-gray-50 rounded-md"></div>
                  <div className="h-4 w-full bg-gray-50 rounded-md"></div>
                  <div className="h-4 w-2/3 bg-gray-50 rounded-md"></div>
                </div>
              </div>

              <div className="w-full flex flex-col bg-gray-300 p-4 rounded-md">
                <div className="h-8 w-2/3 bg-gray-50 rounded-md"></div>

                <div className="flex flex-col gap-2 mt-4">
                  <div className="h-4 w-full bg-gray-50 rounded-md"></div>
                  <div className="h-4 w-full bg-gray-50 rounded-md"></div>
                  <div className="h-4 w-full bg-gray-50 rounded-md"></div>
                  <div className="h-4 w-2/3 bg-gray-50 rounded-md"></div>
                </div>
              </div>
            </div>

          </div>
        </section>
      </MainLayouts>
    </>
  );
}
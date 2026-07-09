// app/page.tsx

import MainLayouts from '@/components/Layouts/MainLayouts';
import type { Metadata } from 'next';
import Link from 'next/link';
import ForceDecodeSimulation from '@/components/Section/ForceDecodeSimulation';
import { Check, TriangleAlert } from 'lucide-react';

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
        <div className="w-full max-w-7xl mx-auto flex flex-col items-center gap-8 text-center">

          {/* Heading + Description */}
          <div className="flex flex-col gap-4">
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
                  bg-neutral-100 border border-neutral-900
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

      {/* Apa itu Steganografi */}
      <section className="w-full bg-white px-4 sm:px-6 lg:px-8 py-20 sm:py-24 border-t border-neutral-200">
        <div className="max-w-7xl mx-auto flex flex-col gap-10">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
              Dasar-dasar
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-neutral-900 tracking-tight">
              Apa Itu Steganografi?
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
              Steganografi merupakan teknik keamanan informasi yang digunakan untuk menyembunyikan keberadaan suatu pesan di dalam media digital, seperti gambar, audio, maupun video, sehingga pihak lain tidak menyadari adanya informasi yang disisipkan. Berbeda dengan kriptografi yang berfokus pada penyandian isi pesan agar tidak dapat dibaca oleh pihak yang tidak berwenang, steganografi bertujuan menyamarkan keberadaan pesan itu sendiri. Pada media gambar, proses penyisipan dilakukan sedemikian rupa sehingga perubahan visual yang dihasilkan sangat kecil dan umumnya tidak dapat dibedakan oleh penglihatan manusia. Konsep ini menjadikan steganografi banyak dimanfaatkan untuk menjaga kerahasiaan informasi, meskipun pada praktiknya juga dapat disalahgunakan sebagai media penyembunyian data berbahaya.
            </p>
          </div>

          {/* Istilah kunci */}
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                term: 'Citra Cover',
                desc: 'Gambar asli yang dipakai sebagai wadah untuk menyisipkan data tersembunyi.',
              },
              {
                term: 'Citra Stego',
                desc: 'Gambar hasil penyisipan pesan, yang secara visual terlihat sama seperti citra cover.',
              },
              {
                term: 'Pesan Tersembunyi',
                desc: 'Informasi yang ingin disamarkan keberadaannya di dalam citra cover.',
              },
              {
                term: 'Marker',
                desc: 'Penanda awal/akhir pesan agar proses ekstraksi tahu di mana pesan dimulai dan berhenti.',
              },
            ].map((item) => (
              <div
                key={item.term}
                className="border border-neutral-200 rounded-sm p-5 flex flex-col gap-1.5
                transition-all duration-300 ease-in-out
                hover:-translate-y-0.5 hover:border-neutral-900 hover:shadow-[-5px_5px_0_rgba(26,26,46,0.8)]"
              >
                <span className="text-sm font-semibold text-neutral-900">{item.term}</span>
                <span className="text-xs text-neutral-600 leading-relaxed">{item.desc}</span>
              </div>
            ))}
          </div>

          {/* Alur */}
          <div className="border border-neutral-900 rounded-sm p-5 sm:p-6 bg-neutral-50">
            <span className="text-[11px] uppercase tracking-wide text-neutral-500 font-semibold">
              Dua tahap utama
            </span>
            <div className="mt-3 flex flex-col sm:flex-row gap-4 sm:gap-0 sm:items-stretch">
              <div className="flex-1">
                <div className="text-sm font-semibold text-neutral-900">1. Embedding (Penyisipan)</div>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  Pesan diubah ke biner, citra cover dipecah ke kanal RGB, lalu bit pesan
                  disisipkan ke piksel citra hingga terbentuk citra stego.
                </p>
              </div>
              <div className="hidden sm:flex text-neutral-400 px-4 items-center justify-center">
                <span className="">→</span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-neutral-900">2. Extraction (Ekstraksi)</div>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  Citra stego dipecah ke kanal RGB, bit tersembunyi diambil kembali, marker
                  diidentifikasi, lalu bit didekode menjadi teks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LSB */}
      <section className="w-full bg-neutral-100 px-4 sm:px-6 lg:px-8 py-20 sm:py-24 border-t border-neutral-200">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
              Metode
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-neutral-900 tracking-tight">
              Least Significant Bit (LSB)
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
              Least Significant Bit (LSB) merupakan salah satu metode steganografi yang paling banyak digunakan pada citra digital karena proses implementasinya sederhana dan mampu mempertahankan kualitas visual gambar. Metode ini bekerja dengan mengganti bit paling rendah pada setiap nilai piksel dengan bit-bit pesan rahasia. Karena perubahan hanya terjadi pada bit yang memiliki pengaruh paling kecil terhadap nilai warna, citra hasil penyisipan atau stego image tetap tampak hampir sama dengan citra asli (cover image). Meskipun demikian, metode LSB memiliki keterbatasan karena rentan terhadap kompresi lossy maupun perubahan format file yang dapat merusak bit-bit penyusun pesan sehingga informasi tersembunyi sulit atau bahkan tidak dapat diekstraksi kembali
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white border border-neutral-200 rounded-sm p-5
                transition-all duration-300 ease-in-out
                hover:-translate-y-0.5 hover:border-neutral-900 hover:shadow-[-5px_5px_0_rgba(26,26,46,0.8)]">
              <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Kelebihan
              </span>
              <div className="mt-3 space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 mt-0.5 text-emerald-600 shrink-0" />
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    Mudah diimplementasikan dan cepat diproses
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 mt-0.5 text-emerald-600 shrink-0" />
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    Tidak mengubah ukuran file gambar
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 mt-0.5 text-emerald-600 shrink-0" />
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    Perubahan visual nyaris tidak terlihat
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white border border-neutral-200 rounded-sm p-5
                transition-all duration-300 ease-in-out
                hover:-translate-y-0.5 hover:border-neutral-900 hover:shadow-[-5px_5px_0_rgba(26,26,46,0.8)]">
              <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Kerentanan
              </span>
              <div className="mt-3 space-y-3">
                <div className="flex items-start gap-3">
                  <TriangleAlert className="w-4 h-4 mt-0.5 text-amber-500 shrink-0" />
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    Rentan rusak akibat kompresi lossy (mis. saat diunggah ke media sosial)
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <TriangleAlert className="w-4 h-4 mt-0.5 text-amber-500 shrink-0" />
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    Bisa dideteksi lewat analisis pola distribusi bit
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <TriangleAlert className="w-4 h-4 mt-0.5 text-amber-500 shrink-0" />
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    Sering disalahgunakan untuk menyisipkan kode berbahaya
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steganalisis */}
      <section className="w-full bg-white px-4 sm:px-6 lg:px-8 py-20 sm:py-24 border-t border-neutral-200">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
              Deteksi
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-neutral-900 tracking-tight">
              Steganalisis
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
              Steganalisis adalah proses analisis terhadap media digital untuk mendeteksi kemungkinan adanya informasi yang disembunyikan menggunakan teknik steganografi. Jika steganografi bertujuan menyembunyikan pesan, maka steganalisis berperan sebagai metode untuk menemukan indikasi keberadaan pesan tersebut. Proses ini dilakukan dengan mengamati karakteristik citra, seperti distribusi bit, pola statistik, maupun perubahan pada nilai piksel yang dapat mengindikasikan adanya penyisipan data. Dalam konteks keamanan informasi, steganalisis memiliki peran penting karena teknik penyembunyian data tidak hanya digunakan untuk menjaga privasi, tetapi juga dapat dimanfaatkan untuk menyembunyikan malware, komunikasi ilegal, atau payload berbahaya yang sulit dikenali oleh mekanisme keamanan konvensional.
            </p>
          </div>
        </div>
      </section>

      {/* Force Decode + Simulasi */}
      <section className="w-full bg-neutral-100 px-4 sm:px-6 lg:px-8 py-20 sm:py-24 border-t border-neutral-200">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
              Metode Inti Aplikasi Ini
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-neutral-900 tracking-tight">
              Force Decode
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
              Force Decode merupakan pendekatan steganalisis yang melakukan ekstraksi data secara eksploratif tanpa memerlukan informasi awal mengenai metode penyisipan maupun parameter decoding yang digunakan. Pada steganografi berbasis LSB, metode ini bekerja dengan mengambil seluruh bit LSB dari setiap piksel citra, kemudian menyusunnya menjadi rangkaian data biner yang selanjutnya didekode menjadi karakter ASCII. Karena proses ekstraksi dilakukan secara menyeluruh, hasil yang diperoleh tidak selalu berupa pesan yang bermakna, tetapi sering kali bercampur dengan noise, karakter acak, atau data yang tidak terstruktur. Oleh sebab itu, pada penelitian ini hasil ekstraksi Force Decode diinterpretasikan menggunakan Artificial Intelligence melalui Gemini API untuk mengenali pola informasi, membedakan pesan tersembunyi dari data acak, serta memberikan analisis yang lebih mudah dipahami oleh pengguna.
            </p>
          </div>

          {/* Cara kerja */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-900">
              Bagaimana Force Decode Bekerja
            </h3>
            <ol className="text-sm text-neutral-700 leading-relaxed space-y-2 list-decimal pl-7">
              <li>Citra stego dipecah ke kanal warna Red, Green, dan Blue.</li>
              <li>Nilai setiap piksel pada tiap kanal dikonversi ke bentuk biner.</li>
              <li>
                Bit LSB diambil dari setiap piksel, mengikuti salah satu dari{' '}
                <strong>delapan pola arah pembacaan</strong> — karena posisi awal pesan tidak
                diketahui, sistem mencoba tiap pola satu per satu.
              </li>
              <li>Bit-bit hasil ekstraksi digabung menjadi satu rangkaian bit biner panjang.</li>
              <li>
                Rangkaian bit dipecah per 8 bit dan didekode ke karakter ASCII untuk melihat
                apakah hasilnya berupa teks bermakna atau sekadar noise.
              </li>
            </ol>
          </div>

          {/* Simulasi interaktif */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-900">
              Simulasi Urutan Pembacaan Piksel
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Pilih salah satu dari delapan pola di bawah, lalu tekan “Putar” untuk melihat
              urutan piksel yang dibaca oleh sistem force decode. Angka pada tiap kotak
              menunjukkan urutan ke berapa piksel tersebut dibaca.
            </p>
            <ForceDecodeSimulation />
          </div>
        </div>
      </section>
    </MainLayouts>
  );
}
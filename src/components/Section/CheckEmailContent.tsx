import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function CheckEmailContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email');

    return (
        <section className="container mx-auto min-h-screen flex items-center justify-center lg:py-20 sm:py-14 py-10">
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="w-full flex flex-col items-center">
                    {/* Email Icon */}
                    <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-blue-100 mb-4">
                        <svg
                            className="h-16 w-16 text-blue-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                        </svg>
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl font-bold text-neutral-900 mb-1">
                        Cek Email Anda
                    </h2>

                    {/* Description */}
                    <p className="text-neutral-600 mb-4">
                        Kami telah mengirimkan link verifikasi ke:
                    </p>

                    {email && (
                        <p className="text-lg font-semibold text-neutral-900 mb-6 py-4 px-6 bg-neutral-200 rounded">
                            {email}
                        </p>
                    )}
                </div>

                <div className="w-full md:w-4/5">
                    {/* Instructions */}
                    <div className="bg-neutral-50 border border-neutral-400 rounded-sm p-6 mb-3 text-left">
                        <h3 className="font-semibold text-neutral-900 mb-3">Langkah selanjutnya:</h3>
                        <ol className="space-y-2 text-sm text-neutral-600">
                            <li className="flex items-start">
                                <span className="shrink-0 inline-flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">
                                    1.
                                </span>
                                <span className="flex-1">Buka inbox email Anda</span>
                            </li>
                            <li className="flex items-start">
                                <span className="shrink-0 inline-flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">
                                    2.
                                </span>
                                <span className="flex-1">Cari email dari kami dengan subjek "Verifikasi Akun Anda"</span>
                            </li>
                            <li className="flex items-start">
                                <span className="shrink-0 inline-flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">
                                    3.
                                </span>
                                <span className="flex-1">Klik tombol "Verifikasi Akun Saya" di dalam email</span>
                            </li>
                        </ol>
                    </div>

                    {/* Tips */}
                    <div className="bg-yellow-50 border border-yellow-400 rounded-sm p-4 mb-6">
                        <p className="text-sm text-yellow-900">
                            <strong>💡 Tips:</strong> Jika tidak menemukan email, periksa folder spam/junk Anda.
                            Link verifikasi berlaku selama 24 jam.
                        </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-4">
                        <Link
                            href="/auth/resend-verification"
                            className="w-full inline-flex justify-center items-center px-6 py-3 
                                border border-neutral-300 text-base font-medium rounded-sm 
                                text-neutral-700 hover:text-neutral-900 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500
                                transition-all duration-300 ease-in-out hover:border-neutral-500
                                hover:-tranneutral-y-0.5 hover:shadow-[-7px_7px_0_rgba(26,26,46,1)]"
                        >
                            Kirim Ulang Email
                        </Link>

                        <Link
                            href="/auth/login"
                            className="w-full inline-flex justify-center items-center px-6 py-3 
                                border border-neutral-50 text-base font-medium text-neutral-700 hover:text-neutral-900
                                transition-all duration-300 ease-in-out hover:border-neutral-500
                                hover:-tranneutral-y-0.5 hover:shadow-[-7px_7px_0_rgba(26,26,46,1)]"
                        >
                            Kembali ke Login
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
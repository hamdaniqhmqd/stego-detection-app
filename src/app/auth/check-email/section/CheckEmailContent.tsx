import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function CheckEmailContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email');

    return (
        <section className="lg:py-20 sm:py-14 py-10 container mx-auto">
            <div className="flex items-center justify-center">
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
                        <h2 className="text-3xl font-bold text-gray-900 mb-1">
                            Cek Email Anda
                        </h2>

                        {/* Description */}
                        <p className="text-gray-600 mb-4">
                            Kami telah mengirimkan link verifikasi ke:
                        </p>

                        {email && (
                            <p className="text-lg font-semibold text-gray-900 mb-6 py-4 px-6 bg-gray-100 rounded">
                                {email}
                            </p>
                        )}
                    </div>

                    <div className="w-full">
                        {/* Instructions */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-3 text-left">
                            <h3 className="font-semibold text-gray-900 mb-3">Langkah selanjutnya:</h3>
                            <ol className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start">
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold mr-3 mt-0.5">
                                        1
                                    </span>
                                    <span>Buka inbox email Anda</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold mr-3 mt-0.5">
                                        2
                                    </span>
                                    <span>Cari email dari kami dengan subjek "Verifikasi Akun Anda"</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold mr-3 mt-0.5">
                                        3
                                    </span>
                                    <span>Klik tombol "Verifikasi Akun Saya" di dalam email</span>
                                </li>
                            </ol>
                        </div>

                        {/* Tips */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-yellow-800">
                                <strong>💡 Tips:</strong> Jika tidak menemukan email, periksa folder spam/junk Anda.
                                Link verifikasi berlaku selama 24 jam.
                            </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-4">
                            <Link
                                href="/auth/resend-verification"
                                className="w-full inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                            >
                                Kirim Ulang Email
                            </Link>

                            <Link
                                href="/auth/login"
                                className="w-full inline-flex justify-center items-center px-6 py-3 text-base font-medium text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Kembali ke Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
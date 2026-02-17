'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/libs/auth/auth-service';
import Link from 'next/link';

export default function FormRegister() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak sama');
      return;
    }

    if (password.length < 8) {
      setError('Password minimal 8 karakter');
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.register({
        username,
        email,
        password,
        role: 'pengguna',
      });

      if (result.success) {
        // Redirect ke halaman info untuk cek email
        router.push(`/auth/check-email?email=${encodeURIComponent(email)}`);
      } else {
        setError(result.message || 'Registrasi gagal');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="form_login lg:py-20 sm:py-14 py-10 container mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="flex flex-col justify-center gap-6 items-center p-4 md:p-0">
          <div className="md:hidden w-full flex flex-col justify-center items-center">
            <h3 className="heading3 text-center text-2xl font-bold text-gray-950">
              Daftar Akun Baru
            </h3>
            <p className="text-center text-gray-600 text-sm mt-2 max-w-md md:w-2/3">
              Bergabunglah dengan kami! Lengkapi formulir untuk membuat akun baru.
              Kami akan mengirimkan link verifikasi ke email Anda.
            </p>
          </div>

          <div className="content sm:w-md w-full bg-white p-6 md:p-8 rounded-lg shadow-[0_-2px_20px_rgba(209,213,219,0.3),0_4px_20px_rgba(209,213,219,0.3)] hover:shadow-[0_-6px_30px_rgba(209,213,219,0.4),0_6px_30px_rgba(209,213,219,0.4)] transition-shadow duration-300">

            {error && (
              <div className="mt-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <form className="form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="block font-medium text-gray-600 text-md">
                  Username <span className="text-red-600 font-semibold">*</span>
                </label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full px-4 h-12 mt-2 text-gray-700 placeholder-gray-500 bg-white border border-gray-400 rounded-lg focus:border-gray-900 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-gray-900"
                  placeholder="Masukkan username Anda"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group mt-3">
                <label className="block font-medium text-md text-gray-600">
                  Email <span className="text-red-600 font-semibold">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 h-12 mt-2 text-gray-700 placeholder-gray-500 bg-white border border-gray-400 rounded-lg focus:border-gray-900 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-gray-900"
                  placeholder="Masukkan email Anda"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="relative form-group mt-3">
                <label className="block font-medium text-md text-gray-600">
                  Kata Sandi{' '}
                  <span className="text-xs text-gray-500">
                    (minimal 8 karakter) <span className="text-red-600 font-semibold">*</span>
                  </span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-4 h-12 mt-2 text-gray-700 placeholder-gray-500 bg-white border border-gray-400 rounded-lg focus:border-gray-900 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-gray-900"
                    placeholder="Masukkan kata sandi Anda"
                    required
                    minLength={8}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[50%] -translate-y-1/2 text-gray-600"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <path
                          stroke="currentColor"
                          strokeWidth="2"
                          d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z"
                        />
                        <path
                          stroke="currentColor"
                          strokeWidth="2"
                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3.933 13.909A4.357 4.357 0 0 1 3 12c0-1 4-6 9-6m7.6 3.8A5.068 5.068 0 0 1 21 12c0 1-3 6-9 6-.314 0-.62-.014-.918-.04M5 19 19 5m-4 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="form-group mt-3">
                <label className="block font-medium text-md text-gray-600">
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full px-4 h-12 mt-2 text-gray-700 placeholder-gray-500 bg-white border border-gray-400 rounded-lg focus:border-gray-900 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-gray-900"
                    placeholder="Masukkan kata sandi Anda Lagi"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-[50%] -translate-y-1/2 text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <path
                          stroke="currentColor"
                          strokeWidth="2"
                          d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z"
                        />
                        <path
                          stroke="currentColor"
                          strokeWidth="2"
                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3.933 13.909A4.357 4.357 0 0 1 3 12c0-1 4-6 9-6m7.6 3.8A5.068 5.068 0 0 1 21 12c0 1-3 6-9 6-.314 0-.62-.014-.918-.04M5 19 19 5m-4 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="block-button mt-4">
                <button
                  type="submit"
                  className="w-full py-3 text-white bg-gray-900 hover:bg-gray-800 rounded-lg disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? 'Memproses...' : 'Daftar'}
                </button>
              </div>

              <div className="navigate mt-4">
                <div className="flex items-center justify-center gap-2 text-base">
                  <span className="text-gray-600">Sudah memiliki akun?</span>
                  <Link
                    className="text-gray-700 hover:underline hover:text-gray-800 font-medium"
                    href="/auth/login"
                  >
                    Masuk
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center hidden md:flex">
          <h3 className="heading3 text-center text-2xl font-bold text-gray-950">
            Daftar Akun Baru
          </h3>
          <p className="text-center text-gray-600 text-sm mt-2 max-w-2/3">
            Bergabunglah dengan kami! Lengkapi formulir untuk membuat akun baru.
            Kami akan mengirimkan link verifikasi ke email Anda.
          </p>
          <img src="/assets/image/photo-gallery.png" alt="" className="mt-6 h-52" />
        </div>
      </div>

    </section>
  );
}
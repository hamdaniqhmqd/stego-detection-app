// src/components/Section/FormRegister.tsx

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
    <section className="form_login min-h-screen flex items-center justify-center lg:py-20 py-14 container mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="flex flex-col justify-center gap-6 items-center p-4 md:p-0">
          <div className="md:hidden w-full flex flex-col justify-center items-center">
            <h3 className="heading3 text-center text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-950">
              Daftar Akun Baru
            </h3>
            <p className="text-center text-neutral-600 text-sm mt-2 max-w-md md:w-2/3">
              Bergabunglah dengan kami! Lengkapi formulir untuk membuat akun baru.
              Kami akan mengirimkan link verifikasi ke email Anda.
            </p>
          </div>

          <div className="
            content sm:w-md w-full bg-white p-6 md:p-8 
            rounded-md border border-neutral-900
            shadow-[-7px_7px_0_rgba(26,26,46,1)]
            md:shadow-[-10px_10px_0_rgba(26,26,46,1)]
          ">

            {error && (
              <div className="mt-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <form className="form mt-2" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="block font-medium text-neutral-600 text-md">
                  Username <span className="text-red-600 font-semibold">*</span>
                </label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full px-4 h-12 mt-3 text-neutral-700 placeholder-neutral-500 bg-white border border-neutral-400 rounded-sm focus:border-neutral-700 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-neutral-900"
                  placeholder="Masukkan username Anda"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group mt-3">
                <label className="block font-medium text-md text-neutral-600">
                  Email <span className="text-red-600 font-semibold">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 h-12 mt-3 text-neutral-700 placeholder-neutral-500 bg-white border border-neutral-400 rounded-sm focus:border-neutral-700 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-neutral-900"
                  placeholder="Masukkan email Anda"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="relative form-group mt-3">
                <label className="block font-medium text-md text-neutral-600">
                  Kata Sandi{' '}
                  <span className="text-xs text-neutral-500">
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
                    className="block w-full px-4 h-12 mt-3 text-neutral-700 placeholder-neutral-500 bg-white border border-neutral-400 rounded-sm focus:border-neutral-700 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-neutral-900"
                    placeholder="Masukkan kata sandi Anda"
                    required
                    minLength={8}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[30%] -tranneutral-y-1/2 text-neutral-600"
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
                <label className="block font-medium text-md text-neutral-600">
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full px-4 h-12 mt-3 text-neutral-700 placeholder-neutral-500 bg-white border border-neutral-400 rounded-sm focus:border-neutral-700 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-neutral-900"
                    placeholder="Masukkan kata sandi Anda Lagi"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-[30%] -tranneutral-y-1/2 text-neutral-600"
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

              <div className="block-button mt-8">
                <button
                  type="submit"
                  className="
                    w-full py-3 text-neutral-900 font-medium
                    bg-neutral-100 border border-neutral-900
                    hover:bg-neutral-50 rounded-sm 
                    cursor-pointer
                    disabled:bg-neutral-200 disabled:cursor-not-allowed 
                    transition-all duration-300 ease-in-out
                    hover:-tranneutral-y-0.5 hover:shadow-[-7px_7px_0_rgba(26,26,46,1)] 
                  "
                  disabled={isLoading}
                >
                  {isLoading ? 'Memproses...' : 'Daftar'}
                </button>
              </div>

              <div className="navigate mt-4">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <span className="text-neutral-600">Sudah memiliki akun?{' '}
                    <Link
                      className="text-neutral-700 hover:underline hover:text-neutral-800 font-medium"
                      href="/auth/login"
                    >
                      Masuk
                    </Link>
                  </span>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="flex-col items-center justify-center hidden md:flex">
          <h3 className="heading3 text-center text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-950">
            Daftar Akun Baru
          </h3>
          <p className="text-center text-neutral-600 text-sm mt-2 max-w-2/3">
            Bergabunglah dengan kami! Lengkapi formulir untuk membuat akun baru.
            Kami akan mengirimkan link verifikasi ke email Anda.
          </p>

          {/* Ganti <img> dengan ilustrasi SVG */}
          <div className="mt-8 w-full max-w-sm flex flex-col items-center gap-4">
            <svg viewBox="0 0 320 240" xmlns="http://www.w3.org/2000/svg" className="w-72 h-auto">
              {/* Background card */}
              <rect x="30" y="20" width="260" height="200" rx="16" fill="#f8f8f6" stroke="#e2e2de" strokeWidth="1" />

              {/* Avatar circle */}
              <circle cx="160" cy="80" r="38" fill="#e8e4fe" />
              <circle cx="160" cy="68" r="16" fill="#7f77dd" />
              <ellipse cx="160" cy="102" rx="24" ry="14" fill="#7f77dd" />

              {/* Check badge */}
              <circle cx="192" cy="56" r="12" fill="#1d9e75" />
              <path d="M186 56 L190 60 L198 52" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

              {/* Form lines */}
              <rect x="60" y="134" width="200" height="10" rx="5" fill="#d3d1c7" />
              <rect x="60" y="154" width="160" height="10" rx="5" fill="#e2e2de" />
              <rect x="60" y="174" width="180" height="10" rx="5" fill="#e2e2de" />

              {/* Floating dots decoration */}
              <circle cx="50" cy="40" r="5" fill="#afa9ec" opacity="0.6" />
              <circle cx="270" cy="190" r="7" fill="#9fe1cb" opacity="0.5" />
              <circle cx="285" cy="50" r="4" fill="#f5c4b3" opacity="0.7" />
              <circle cx="40" cy="185" r="6" fill="#fac775" opacity="0.5" />
            </svg>
          </div>
        </div>
      </div>

    </section>
  );
}
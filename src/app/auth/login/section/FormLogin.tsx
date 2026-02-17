// src/app/auth/login/FormLogin.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/provider/AuthProvider';

export default function FormLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState(''); // ✅ Ubah state name
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'email_not_registered') {
      setError('Email Anda belum terdaftar. Silakan mendaftar terlebih dahulu.');
    } else if (errorParam === 'google_auth_failed') {
      setError('Gagal login dengan Google. Silakan coba lagi.');
    } else if (errorParam) {
      setError('Terjadi kesalahan saat login dengan Google.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const result = await login(emailOrUsername, password);

      console.log('Login result:', result);

      // ✅ Handle redirect untuk email belum verified
      if (!result.success && result.redirectUrl) {
        setError(result.message || 'Email Anda belum diverifikasi.');
        setTimeout(() => {
          router.push(result.redirectUrl!);
        }, 2000);
        return;
      }

      // Handle error lainnya
      if (!result.success) {
        setError(result.message || 'Login gagal');
        return;
      }

      // Handle success
      if (result.success && result.data) {
        const role = result.data.role;

        setSuccess('Login berhasil! Mengalihkan...');

        // Redirect berdasarkan role
        let redirectPath = '/dashboard'; // default

        if (role === 'pengguna') {
          redirectPath = '/dashboard';
        } else if (role === 'superadmin') {
          redirectPath = '/admin';
        }

        // Delay untuk user melihat success message
        setTimeout(() => {
          router.push(redirectPath);
        }, 500);
      }
    } catch (err) {
      console.error('Login error:', err);
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
              Masuk ke Akun Anda
            </h3>
            <p className="text-center text-gray-600 text-sm mt-2 max-w-md md:w-2/3">
              Selamat datang kembali! Masukkan email/username dan password Anda untuk mengakses akun.
            </p>
          </div>

          <div className="content sm:w-md w-full bg-white p-6 md:p-8 rounded-lg shadow-[0_-2px_20px_rgba(209,213,219,0.3),0_4px_20px_rgba(209,213,219,0.3)] hover:shadow-[0_-6px_30px_rgba(209,213,219,0.4),0_6px_30px_rgba(209,213,219,0.4)] transition-shadow duration-300">

            {/* Error Alert */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-red-600 mt-0.5 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Success Alert */}
            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-green-600 mt-0.5 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              </div>
            )}

            <form className="form mt-2" onSubmit={handleSubmit}>
              {/* ✅ Email/Username Field */}
              <div className="form-group">
                <label className="block font-medium text-gray-900 text-md">
                  Username atau Email
                </label>
                <input
                  id="emailOrUsername"
                  type="text"
                  name="emailOrUsername"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  className="block w-full px-4 h-12 mt-3 text-gray-700 placeholder-gray-500 bg-white border border-gray-400 rounded-lg focus:border-gray-900 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-gray-900"
                  placeholder="Masukkan email atau username"
                  required
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>

              {/* Password Field */}
              <div className="form-group mt-6 relative">
                <label className="block font-medium text-gray-900 text-md">
                  Kata Sandi
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-4 h-12 mt-3 text-gray-700 placeholder-gray-500 bg-white border border-gray-400 rounded-lg focus:border-gray-900 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-gray-900"
                    placeholder="Masukkan kata sandi Anda"
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-[50%] -translate-y-1/2 text-gray-600 hover:text-gray-800"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeWidth="2" d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z" />
                        <path stroke="currentColor" strokeWidth="2" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
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

              <div className="flex items-center justify-end mt-3">
                <Link className="text-gray-800 hover:underline hover:text-gray-900 text-sm" href="#">
                  Lupa kata sandi?
                </Link>
              </div>

              <div className="block-button mt-6">
                <button
                  type="submit"
                  className="w-full py-3 text-white bg-gray-900 hover:bg-gray-950 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Memproses...
                    </span>
                  ) : (
                    'Masuk'
                  )}
                </button>
              </div>

              <div className="navigate mt-3">
                <div className="flex items-center justify-center gap-1 text-sm">
                  <span className="text-gray-600">Belum memiliki akun?</span>
                  <Link className="text-gray-700 hover:underline hover:text-gray-800 font-medium" href="/auth/register">
                    Daftar di sini
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="flex-col items-center justify-center hidden md:flex">
          <h3 className="heading3 text-center text-2xl font-bold text-gray-950">
            Masuk ke Akun Anda
          </h3>
          <p className="text-center text-gray-600 text-sm mt-2 max-w-2/3">
            Selamat datang kembali! Masukkan email/username dan password Anda untuk mengakses akun.
          </p>
          <img src="/assets/image/photo-gallery.png" alt="" className="mt-6 h-52" />
        </div>
      </div>
    </section>
  );
}
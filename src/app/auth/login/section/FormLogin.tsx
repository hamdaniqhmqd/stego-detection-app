'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/provider/AuthProvider';

export default function FormLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ✨ Handle error dari Google OAuth callback
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
    setIsLoading(true);

    try {
      const result = await login(email, password);

      // Debug: lihat structure result
      // console.log('Login result:', result);

      // Handle redirect untuk verifikasi email
      if (result.success === false && result.redirectUrl) {
        setError('Akun Anda belum menyelesaikan pendaftaran. Silakan verifikasi email terlebih dahulu.');
        setTimeout(() => {
          router.push(result.redirectUrl!);
        }, 2000);
        return;
      }

      // Handle error lainnya
      if (result.success === false) {
        setError(result.message || 'Login gagal');
        return;
      }

      // Handle success - pastikan ada explicit check
      if (result.success === true) {
        const role = result.data?.role;

        // console.log('User role:', role); // Debug

        let redirect = '';

        if (role === 'pengguna') {
          redirect = '/dashboard';
        } else if (role === 'superadmin') {
          redirect = '/admin';
        } else {
          // Fallback jika role tidak dikenali
          setError('Role pengguna tidak valid');
          return;
        }

        setSuccess('Login berhasil!');

        // Pastikan redirect dilakukan
        // console.log('Redirecting to:', redirect); // Debug
        router.push(redirect);
      }
    } catch (err) {
      // console.error('Login error:', err); // Debug
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="form_login lg:py-20 sm:py-14 py-10">
      <div className="container flex items-center justify-center">
        <div className="content sm:w-[448px] w-full bg-white p-8 rounded-lg shadow-[0_-2px_20px_rgba(209,213,219,0.3),0_4px_20px_rgba(209,213,219,0.3)] hover:shadow-[0_-6px_30px_rgba(209,213,219,0.4),0_6px_30px_rgba(209,213,219,0.4)] transition-shadow duration-300">
          <h3 className="heading3 text-center text-2xl font-bold text-gray-950">Masuk ke Akun Anda</h3>
          <p className="text-center text-gray-600 text-sm mt-2">Selamat datang kembali! Silakan masuk untuk melanjutkan.</p>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          <form className="form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="block font-medium text-gray-600">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 h-[50px] mt-3 text-gray-700 placeholder-gray-500 bg-white border border-gray-400 rounded-lg focus:border-[#04B2B2] focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-[#04B2B2]"
                placeholder="Masukkan email Anda"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group mt-6 relative">
              <label className="block font-medium text-gray-600">Kata Sandi</label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-4 h-[50px] mt-3 text-gray-700 placeholder-gray-500 bg-white border border-gray-400 rounded-lg focus:border-[#04B2B2] focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-[#04B2B2]"
                  placeholder="Masukkan kata sandi Anda"
                  required
                  disabled={isLoading}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[50%] -translate-y-1/2 text-gray-600"
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

            <div className="flex items-center justify-end mt-6">
              <Link className="text-black hover:underline text-sm" href="/forgot-password">
                Lupa kata sandi?
              </Link>
            </div>

            <div className="block-button mt-6">
              <button
                type="submit"
                className="w-full py-3 text-white bg-teal-900 rounded-lg disabled:cursor-not-allowed transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Memproses...' : 'Masuk'}
              </button>
            </div>

            <div className="navigate mt-6">
              <div className="flex items-center justify-center gap-1 text-sm">
                <span className="text-gray-600">Belum memiliki akun?</span>
                <Link className="text-primary hover:underline font-medium" href="/auth/register">
                  Daftar di sini
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
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
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    emailOrUsername: '',
    password: '',
  });

  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'email_not_registered') {
      setServerError('Email Anda belum terdaftar. Silakan mendaftar terlebih dahulu.');
    } else if (errorParam === 'google_auth_failed') {
      setServerError('Gagal login dengan Google. Silakan coba lagi.');
    } else if (errorParam) {
      setServerError('Terjadi kesalahan saat login dengan Google.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setServerError('');

    const newErrors = {
      emailOrUsername: '',
      password: '',
    };

    let hasError = false;

    if (!emailOrUsername.trim()) {
      newErrors.emailOrUsername =
        'Username atau email wajib diisi';
      hasError = true;
    }

    if (!password) {
      newErrors.password = 'Password wajib diisi';
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) return;

    setSuccess('');
    setIsLoading(true);

    try {
      const result = await login(
        emailOrUsername,
        password
      );

      if (!result.success && result.redirectUrl) {
        setServerError(
          result.message || 'Email belum diverifikasi'
        );

        setTimeout(() => {
          router.push(result.redirectUrl!);
        }, 2000);

        return;
      }

      if (!result.success) {
        setServerError(
          result.message || 'Login gagal'
        );
        return;
      }

      if (result.success && result.data) {
        const role = result.data.role;

        setSuccess('Login berhasil! Mengalihkan...');

        let redirectPath = '/dashboard';

        if (role === 'superadmin') {
          redirectPath = '/admin';
        }

        setTimeout(() => {
          router.push(redirectPath);
        }, 500);
      }
    } catch (err) {
      setServerError(
        'Terjadi kesalahan. Silakan coba lagi.'
      );
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
              Masuk ke Akun Anda
            </h3>
            <p className="text-center text-neutral-600 text-sm mt-2 max-w-md md:w-2/3">
              Selamat datang kembali! Masukkan email/username dan password Anda untuk mengakses akun.
            </p>
          </div>

          <div className="
            content sm:w-md w-full bg-white p-6 md:p-8 
            rounded-md border border-neutral-900
            shadow-[-7px_7px_0_rgba(26,26,46,1)]
            md:shadow-[-10px_10px_0_rgba(26,26,46,1)]
          ">

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
              {/* Email/Username Field */}
              <div className="form-group">
                <label className="block font-medium text-neutral-900 text-md">
                  Username atau Email
                </label>
                <input
                  id="emailOrUsername"
                  type="text"
                  name="emailOrUsername"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  className={`block w-full px-4 h-12 mt-3 text-neutral-700 placeholder-neutral-500 bg-white border border-neutral-400 rounded-sm focus:border-neutral-700 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-neutral-900
                    ${errors.emailOrUsername
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-neutral-400'
                    }`}
                  placeholder="Masukkan email atau username"
                  required
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>

              {/* Password Field */}
              <div className="form-group mt-6 relative">
                <label className="block font-medium text-neutral-900 text-md">
                  Kata Sandi
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`block w-full px-4 h-12 mt-3 text-neutral-700 placeholder-neutral-500 bg-white border border-neutral-400 rounded-sm focus:border-neutral-700 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-neutral-900
                      ${errors.password
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-neutral-400'
                      }`}
                    placeholder="Masukkan kata sandi Anda"
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-[30%] -tranneutral-y-1/2 text-neutral-600 hover:text-neutral-800"
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

              <div className="hidden items-center justify-end mt-3">
                <Link className="text-neutral-800 hover:underline hover:text-neutral-900 text-sm" href="#">
                  Lupa kata sandi?
                </Link>
              </div>

              <div className="block-button mt-6">
                <button
                  type="submit"
                  className="
                  w-full py-3 text-neutral-900 font-medium
                  bg-neutral-100 border border-neutral-900
                  hover:bg-neutral-50 rounded-sm 
                  cursor-pointer
                  disabled:bg-neutral-300 disabled:cursor-not-allowed 
                  transition-all duration-300 ease-in-out
                  hover:-translate-y-0.5 hover:shadow-[-7px_7px_0_rgba(26,26,46,1)] 
                  "
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
                  <span className="text-neutral-600 text-center">Belum memiliki akun?{' '}
                    <Link className="text-neutral-700 hover:underline hover:text-neutral-800 font-medium" href="/auth/register">
                      Daftar di sini
                    </Link>
                  </span>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="flex-col items-center justify-center hidden md:flex">
          <h3 className="heading3 text-center text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-950">
            Masuk ke Akun Anda
          </h3>
          <p className="text-center text-neutral-600 text-sm mt-2 max-w-2/3">
            Selamat datang kembali! Masukkan email/username dan password Anda untuk mengakses akun.
          </p>

          {/* Ganti <img> dengan ilustrasi SVG */}
          <div className="mt-8 w-full max-w-sm flex flex-col items-center gap-4">
            <svg viewBox="0 0 320 240" xmlns="http://www.w3.org/2000/svg" className="w-72 h-auto">
              {/* Background */}
              <rect x="30" y="20" width="260" height="200" rx="16" fill="#f8f8f6" stroke="#e2e2de" strokeWidth="1" />

              {/* Lock icon area */}
              <rect x="120" y="55" width="80" height="60" rx="10" fill="#e8e4fe" />
              <rect x="136" y="75" width="48" height="38" rx="6" fill="#7f77dd" />
              <path d="M148 55 Q148 42 160 42 Q172 42 172 55" stroke="#afa9ec" strokeWidth="5" fill="none" strokeLinecap="round" />
              <circle cx="160" cy="90" r="6" fill="white" />
              <rect x="157" y="90" width="6" height="10" rx="3" fill="white" />

              {/* Input field mockups */}
              <rect x="55" y="136" width="210" height="18" rx="5" fill="white" stroke="#d3d1c7" strokeWidth="1" />
              <rect x="63" y="142" width="80" height="6" rx="3" fill="#d3d1c7" />

              <rect x="55" y="164" width="210" height="18" rx="5" fill="white" stroke="#d3d1c7" strokeWidth="1" />
              <rect x="63" y="170" width="60" height="6" rx="3" fill="#d3d1c7" />
              {/* Password dots */}
              <circle cx="130" cy="173" r="3" fill="#888780" />
              <circle cx="140" cy="173" r="3" fill="#888780" />
              <circle cx="150" cy="173" r="3" fill="#888780" />
              <circle cx="160" cy="173" r="3" fill="#888780" />
              <circle cx="170" cy="173" r="3" fill="#888780" />

              {/* Decorative dots */}
              <circle cx="52" cy="38" r="5" fill="#afa9ec" opacity="0.6" />
              <circle cx="272" cy="195" r="7" fill="#9fe1cb" opacity="0.5" />
              <circle cx="285" cy="48" r="4" fill="#f5c4b3" opacity="0.7" />
              <circle cx="38" cy="188" r="5" fill="#fac775" opacity="0.5" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
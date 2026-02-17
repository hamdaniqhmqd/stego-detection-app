// src/libs/auth-service.ts
// FRONTEND AUTH SERVICE - Single file untuk semua operasi autentikasi

import { AuthResponse, LoginRequest, RegisterRequest } from "@/types/auth";
import { User } from "@supabase/supabase-js";

const API_BASE = '/api/auth';

class AuthService {
    /**
     * Register user baru
     */
    async register(data: RegisterRequest): Promise<AuthResponse> {
        try {
            const response = await fetch(`${API_BASE}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Registration failed');
            }

            return result;
        } catch (error) {
            // console.error('Register error:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Registration failed',
            };
        }
    }

    /**
     * Login user
     */
    async login(data: LoginRequest): Promise<AuthResponse> {
        try {
            const response = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // PENTING: Untuk mengirim dan menerima cookies
                body: JSON.stringify(data),
            });

            const result = await response.json();

            // console.log('📥 Login response:', {
            //     status: response.status,
            //         success: result.success,
            //             hasCookies: document.cookie.includes('accessToken')
            // });

            return {
                success: result.success,
                message: result.message,
                user: result.user,
                redirectUrl: result.redirect_url ?? null,
                accessToken: result.accessToken,
            };
        } catch (error) {
            // console.error('Login error:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Login failed',
            };
        }
    }

    /**
     * Logout user
     */
    async logout(): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await fetch(`${API_BASE}/logout`, {
                method: 'POST',
                credentials: 'include',
            });

            const result = await response.json();
            return result;
        } catch (error) {
            // console.error('Logout error:', error);
            return {
                success: false,
                message: 'Logout failed',
            };
        }
    }

    /**
     * Refresh access token
     */
    async refreshToken(): Promise<{ success: boolean; accessToken?: string }> {
        try {
            const response = await fetch(`${API_BASE}/refresh`, {
                method: 'POST',
                credentials: 'include',
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Refresh token error:', error);
            return { success: false };
        }
    }

    /**
     * Get current user dari access token
     */
    async getCurrentUser(): Promise<User | null> {
        try {
            const response = await fetch(`${API_BASE}/me`, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                const refreshResult = await this.refreshToken();
                if (refreshResult.success) {
                    const retryResponse = await fetch(`${API_BASE}/me`, {
                        method: 'GET',
                        credentials: 'include',
                    });
                    console.log('Retry response:', retryResponse);

                    if (retryResponse.ok) {
                        const data = await retryResponse.json();
                        return data.user;
                    }
                }
                return null;
            }

            const data = await response.json();
            return data.user;
        } catch (error) {
            console.error('Get current user error:', error);
            return null;
        }
    }
}

export const authService = new AuthService();
export default authService;
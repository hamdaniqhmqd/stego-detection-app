// src/types/auth.ts

export type UserRole = 'pengguna' | 'superadmin';

export interface User {
    id: string;
    username: string;
    email: string;
    password: string;
    role: UserRole;
    fullname?: string;
    photo?: string;
    bg_photo?: string;
    created_at: string;
    is_verified?: boolean;
    verified_at?: string; // ✅ Ikuti typo di database
    updated_at?: string;
    deleted_at?: string;
}

export interface AuthUser {
    id: string;
    email: string;
    username?: string;
    role?: string;
}

export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
    [key: string]: any;
}

export interface AuthResponse {
    success: boolean;
    message?: string;
    redirectUrl?: string;
    user?: User;
    accessToken?: string;
    needsVerification?: boolean;
    emailSent?: boolean;
}

export interface RefreshToken {
    id: string;
    user_id: string;
    refresh_token: string;
    user_agent: string | null;
    ip_address: string | null;
    expires_at: string;
    created_at: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    role: UserRole;
}

export interface EmailVerification {
    id: string;
    user_id: string;
    email: string;
    verification_code: string;
    type: 'register' | 'forgot_password';
    expires_at: string;
    is_verified?: boolean;
    verified_at?: string; // ✅ Ikuti typo di database
    created_at: string;
    updated_at?: string;
}

export interface VerifyEmailRequest {
    token: string;
}
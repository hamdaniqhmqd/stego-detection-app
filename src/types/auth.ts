// src/types/auth.ts

export interface User {
    id: string;
    username: string;
    email: string;
    password: string;
    role: 'pengguna' | 'superadmin';
    fullname?: string;
    photo?: string;
    created_at: string;
    verifed_at?: boolean;
    updated_at?: string; // timestamp
    deleted_at?: string; // timestamp
}

export interface AuthUser {
    id: string;
    email: string;
    username?: string;
    role?: string;
}

// Custom JWT Payload dengan index signature untuk kompatibilitas dengan jose
export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
    [key: string]: any; // Index signature untuk kompatibilitas dengan jose
}

export interface AuthResponse {
    success: boolean;
    message?: string;
    user?: User;
    accessToken?: string;
    needsVerification?: boolean; // Flag untuk redirect ke verification page
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
    role: 'klien' | 'freelancer' | 'superadmin';
}

export interface VerifyOTPRequest {
    email: string;
    verification_code: string;
}

export interface EmailVerification {
    id: string;
    user_id: string;
    email: string;
    verification_code: string;
    type: 'register' | 'forgot_password';
    expires_at: string;
    verified_at?: string;
    created_at: string;
    updated_at?: string;
}

export interface AuthResponse {
    success: boolean;
    message?: string;
    redirectUrl?: string;
    user?: User;
    accessToken?: string;
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
    role: 'freelancer' | 'klien' | 'superadmin';
}
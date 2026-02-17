// types/Users.ts

export type UserRole = 'pengguna' | 'superadmin';

export interface User {
    id: string;
    username: string;
    email: string;
    password: string;
    role: UserRole;
    fullname?: string;
    photo?: string;
    is_verified?: boolean;
    created_at: string;
    updated_at?: string; // timestamp
    deleted_at?: string; // timestamp
    verified_at?: string;
}

export interface AuthUser {
    id: string;
    email: string;
    username?: string;
    role?: string;
    fullname?: string;
    photo?: string;
}

export interface UserProfile {
    id: string;
    username: string;
    email: string;
    password: string;
    role: string;
    fullname?: string | null;
    photo?: string | null;
}
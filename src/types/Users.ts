// types/Users.ts

export interface User {
    id: string;
    username: string;
    email: string;
    password: string;
    role: 'pengguna' | 'superadmin';
    fullname?: string;
    photo?: string;
    is_verified?: boolean;
    verified_at?: boolean;
    created_at: string;
    updated_at?: string; // timestamp
    deleted_at?: string; // timestamp
}

export interface AuthUser {
    id: string;
    email: string;
    username?: string;
    role?: string;
}
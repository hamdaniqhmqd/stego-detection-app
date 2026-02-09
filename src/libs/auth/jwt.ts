// src/lib/jwt.ts

import { JWTPayload } from '@/types/auth';
import { SignJWT, jwtVerify } from 'jose';

const ACCESS_TOKEN_EXPIRY = '15m'; // 15 menit
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 hari

// Convert secret string to Uint8Array
const getSecretKey = (secret: string) => new TextEncoder().encode(secret);

const ACCESS_SECRET = getSecretKey(process.env.JWT_ACCESS_SECRET || '');
const REFRESH_SECRET = getSecretKey(process.env.JWT_REFRESH_SECRET || '');

/**
 * Generate Access Token (short-lived)
 */
export async function generateAccessToken(payload: JWTPayload): Promise<string> {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(ACCESS_TOKEN_EXPIRY)
        .sign(ACCESS_SECRET);
}

/**
 * Generate Refresh Token (long-lived)
 */
export async function generateRefreshToken(payload: JWTPayload): Promise<string> {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(REFRESH_TOKEN_EXPIRY)
        .sign(REFRESH_SECRET);
}

/**
 * Verify Access Token
 */
export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, ACCESS_SECRET);
        return payload as JWTPayload;
    } catch (error) {
        // console.error('Access token verification failed:', error);
        return null;
    }
}

/**
 * Verify Refresh Token
 */
export async function verifyRefreshToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, REFRESH_SECRET);
        return payload as JWTPayload;
    } catch (error) {
        // console.error('Refresh token verification failed:', error);
        return null;
    }
}

/**
 * Get token expiry date
 */
export function getRefreshTokenExpiry(): Date {
    const Utc = new Date();
    const expiry = new Date(Utc.getTime() + 7 * 60 * 60 * 1000);
    expiry.setDate(expiry.getDate() + 7); // 7 hari
    return expiry;
}
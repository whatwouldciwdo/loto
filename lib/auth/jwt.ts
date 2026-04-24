import { SignJWT, jwtVerify } from 'jose'
import { JWT_SECRET, JWT_EXPIRES_IN } from '@/lib/constants'

const secret = new TextEncoder().encode(JWT_SECRET)

export interface JWTPayload {
    userId: string
    username: string
    role: string
    email: string
}

export async function createTokenJose(payload: JWTPayload): Promise<string> {
    return await new SignJWT(payload as any)
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime(JWT_EXPIRES_IN)
        .setIssuedAt()
        .sign(secret)
}

export async function verifyTokenJose(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, secret)
        return payload as unknown as JWTPayload
    } catch (error) {
        console.error('[verifyTokenJose] Error:', error)
        return null
    }
}

// Keep old functions for backward compatibility with server-side code
import jwt from 'jsonwebtoken'

export function createToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    })
}

export function verifyToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload
    } catch (error) {
        return null
    }
}

export async function hashPassword(password: string): Promise<string> {
    const bcrypt = await import('bcryptjs')
    return bcrypt.hash(password, 10)
}

export async function comparePassword(
    password: string,
    hash: string
): Promise<boolean> {
    const bcrypt = await import('bcryptjs')
    return bcrypt.compare(password, hash)
}

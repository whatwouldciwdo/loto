import { cookies } from 'next/headers'
import { verifyToken, type JWTPayload } from './jwt'

const TOKEN_NAME = 'loto_token'

export async function getSession(): Promise<JWTPayload | null> {
    const cookieStore = await cookies()
    const token = cookieStore.get(TOKEN_NAME)

    console.log('[getSession] Cookie store:', cookieStore.getAll().map(c => c.name))
    console.log('[getSession] Token found:', !!token)

    if (!token) {
        return null
    }

    return verifyToken(token.value)
}

export async function setSession(token: string): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.set(TOKEN_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    })
}

export async function clearSession(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete(TOKEN_NAME)
}

export async function requireAuth(): Promise<JWTPayload> {
    const session = await getSession()

    if (!session) {
        throw new Error('Unauthorized')
    }

    return session
}

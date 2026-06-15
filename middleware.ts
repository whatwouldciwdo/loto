import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const TOKEN_NAME = 'loto_token'
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-min-32-characters-long')

const publicRoutes = ['/login', '/api/auth/login']

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    if (publicRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next()
    }

    const token = request.cookies.get(TOKEN_NAME)

    if (!token) {
        const loginUrl = new URL('/login', request.url)
        return NextResponse.redirect(loginUrl)
    }

    try {
        await jwtVerify(token.value, JWT_SECRET)
        return NextResponse.next()
    } catch {
        const loginUrl = new URL('/login', request.url)
        const response = NextResponse.redirect(loginUrl)
        response.cookies.delete(TOKEN_NAME)
        return response
    }
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\..*$).*)',
    ],
}

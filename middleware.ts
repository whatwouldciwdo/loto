import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const TOKEN_NAME = 'loto_token'
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-min-32-characters-long')

// Public routes that don't require authentication
const publicRoutes = ['/login', '/api/auth/login']

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Allow public routes
    if (publicRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next()
    }

    // Get token from cookie
    const token = request.cookies.get(TOKEN_NAME)

    console.log('[Middleware] Path:', pathname)
    console.log('[Middleware] Cookie header:', request.headers.get('cookie'))
    console.log('[Middleware] Token value:', token?.value)
    console.log('[Middleware] Token exists:', !!token)

    if (!token) {
        console.log('[Middleware] No token, redirecting to /login')
        const loginUrl = new URL('/login', request.url)
        return NextResponse.redirect(loginUrl)
    }

    // Verify token using Jose (Edge-compatible)
    try {
        const { payload } = await jwtVerify(token.value, JWT_SECRET)
        console.log('[Middleware] Token valid for user:', payload.username)
        return NextResponse.next()
    } catch (error) {
        console.log('[Middleware] Token verification error:', error instanceof Error ? error.message : 'Unknown error')
        const loginUrl = new URL('/login', request.url)
        const response = NextResponse.redirect(loginUrl)
        response.cookies.delete(TOKEN_NAME)
        return response
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\..*$).*)',
    ],
}

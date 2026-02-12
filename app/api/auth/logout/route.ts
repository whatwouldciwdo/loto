import { NextResponse } from 'next/server'
import { clearSession } from '@/lib/auth/session'

export async function POST() {
    try {
        await clearSession()

        // Return HTML that redirects to login page
        return new NextResponse(
            `<html><head><meta http-equiv="refresh" content="0;url=/login" /></head><body><script>window.location.href='/login';</script></body></html>`,
            {
                status: 200,
                headers: { 'Content-Type': 'text/html' },
            }
        )
    } catch (error) {
        console.error('Logout error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

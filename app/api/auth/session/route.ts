import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

// This route reads auth cookies, so it must never be statically prerendered
export const dynamic = 'force-dynamic'

export async function GET() {

    try {
        const session = await getSession()

        if (!session) {
            return NextResponse.json({ user: null })
        }

        return NextResponse.json({ user: session })
    } catch (error) {
        console.error('Session error:', error)
        return NextResponse.json({ user: null })
    }
}

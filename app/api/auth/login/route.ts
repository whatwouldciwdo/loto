import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { loginSchema } from '@/lib/validators'
import { comparePassword } from '@/lib/auth/jwt'
import { createToken } from '@/lib/auth/jwt'

const TOKEN_NAME = 'loto_token'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate input
        const validatedData = loginSchema.parse(body)

        // Find user by username
        const user = await prisma.user.findUnique({
            where: {
                username: validatedData.username,
            },
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            )
        }

        // Check if user is active
        if (!user.isActive) {
            return NextResponse.json(
                { error: 'Account is inactive' },
                { status: 403 }
            )
        }

        // Verify password
        const isValidPassword = await comparePassword(validatedData.password, user.passwordHash)

        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            )
        }

        // Create JWT token
        const token = createToken({
            userId: user.id,
            username: user.username,
            role: user.role,
            email: user.email,
        })

        // Create response with user data
        const response = NextResponse.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                name: user.name,
                role: user.role,
                department: user.department,
            },
            token,
        })

        // Set cookie in response
        response.cookies.set(TOKEN_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production' && request.url.startsWith('https'),
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        })

        return response
    } catch (error) {
        console.error('Login error:', error)

        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid input data' },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

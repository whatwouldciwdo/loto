import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import prisma from '@/lib/db/prisma'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'

/**
 * GET /api/admin/users
 * List all users (admin only)
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session || session.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                role: true,
                department: true,
                isActive: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json({
            success: true,
            data: users,
        })
    } catch (error: any) {
        console.error('Error fetching users:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch users' },
            { status: 500 }
        )
    }
}

/**
 * POST /api/admin/users
 * Create new user (admin only)
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session || session.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { username, email, password, name, role, department } = body

        // Validate required fields
        if (!username || !email || !password || !name || !role) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Check if username or email already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ username }, { email }],
            },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'Username or email already exists' },
                { status: 400 }
            )
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10)

        // Create user
        const user = await prisma.user.create({
            data: {
                username,
                email,
                passwordHash,
                name,
                role: role as UserRole,
                department: department || null,
                isActive: true,
            },
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                role: true,
                department: true,
            },
        })

        return NextResponse.json({
            success: true,
            data: user,
            message: 'User created successfully',
        })
    } catch (error: any) {
        console.error('Error creating user:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create user' },
            { status: 500 }
        )
    }
}

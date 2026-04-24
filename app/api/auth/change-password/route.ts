import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import prisma from '@/lib/db/prisma'
import bcrypt from 'bcryptjs'

/**
 * PUT /api/auth/change-password
 * Change the current user's password
 */
export async function PUT(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { currentPassword, newPassword } = body

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: 'Current password and new password are required' },
                { status: 400 }
            )
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: 'New password must be at least 6 characters' },
                { status: 400 }
            )
        }

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
        if (!isValid) {
            return NextResponse.json(
                { error: 'Current password is incorrect' },
                { status: 400 }
            )
        }

        // Hash new password and update
        const hashedPassword = await bcrypt.hash(newPassword, 12)
        await prisma.user.update({
            where: { id: session.userId },
            data: { passwordHash: hashedPassword },
        })

        return NextResponse.json({ message: 'Password changed successfully' })
    } catch (error) {
        console.error('Change password error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

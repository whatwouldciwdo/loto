import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import prisma from '@/lib/db/prisma'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'

/**
 * GET /api/admin/users/[id]
 * Get user details (admin only)
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession()
        if (!session || session.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: params.id },
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
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            data: user,
        })
    } catch (error: any) {
        console.error('Error fetching user:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch user' },
            { status: 500 }
        )
    }
}

/**
 * PUT /api/admin/users/[id]
 * Update user (admin only)
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession()
        if (!session || session.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { name, email, role, department, isActive, password } = body

        const updateData: any = {}
        if (name !== undefined) updateData.name = name
        if (email !== undefined) updateData.email = email
        if (role !== undefined) updateData.role = role as UserRole
        if (department !== undefined) updateData.department = department
        if (isActive !== undefined) updateData.isActive = isActive
        if (password) {
            updateData.passwordHash = await bcrypt.hash(password, 10)
        }

        const user = await prisma.user.update({
            where: { id: params.id },
            data: updateData,
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                role: true,
                department: true,
                isActive: true,
            },
        })

        return NextResponse.json({
            success: true,
            data: user,
            message: 'User updated successfully',
        })
    } catch (error: any) {
        console.error('Error updating user:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to update user' },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/admin/users/[id]
 * Delete user (admin only)
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession()
        if (!session || session.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Prevent deleting the last admin
        const user = await prisma.user.findUnique({
            where: { id: params.id },
        })

        if (user?.role === UserRole.ADMIN) {
            const adminCount = await prisma.user.count({
                where: { role: UserRole.ADMIN, isActive: true },
            })

            if (adminCount <= 1) {
                return NextResponse.json(
                    { error: 'Cannot delete the last admin user' },
                    { status: 400 }
                )
            }
        }

        await prisma.user.delete({
            where: { id: params.id },
        })

        return NextResponse.json({
            success: true,
            message: 'User deleted successfully',
        })
    } catch (error: any) {
        console.error('Error deleting user:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to delete user' },
            { status: 500 }
        )
    }
}

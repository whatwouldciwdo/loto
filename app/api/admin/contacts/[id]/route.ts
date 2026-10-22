import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import prisma from '@/lib/db/prisma'
import { normalizePhoneNumber } from '@/lib/whatsapp-config'

export const dynamic = 'force-dynamic'

/**
 * PUT /api/admin/contacts/[id]
 * Update a whatsapp contact
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { name, phone, group, department, notes, isActive } = body

        const updateData: any = {}
        if (name !== undefined) updateData.name = name.trim()
        if (phone !== undefined) updateData.phone = normalizePhoneNumber(phone)
        if (group !== undefined) updateData.group = group.trim().toUpperCase()
        if (department !== undefined) updateData.department = department ? department.trim() : null
        if (notes !== undefined) updateData.notes = notes ? notes.trim() : null
        if (isActive !== undefined) updateData.isActive = Boolean(isActive)

        const contact = await prisma.whatsappContact.update({
            where: { id: params.id },
            data: updateData,
        })

        return NextResponse.json({
            success: true,
            data: contact,
            message: 'Contact updated successfully',
        })
    } catch (error: any) {
        console.error('Error updating contact:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to update contact' },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/admin/contacts/[id]
 * Delete a whatsapp contact
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await prisma.whatsappContact.delete({
            where: { id: params.id },
        })

        return NextResponse.json({
            success: true,
            message: 'Contact deleted successfully',
        })
    } catch (error: any) {
        console.error('Error deleting contact:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to delete contact' },
            { status: 500 }
        )
    }
}

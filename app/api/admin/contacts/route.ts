import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import prisma from '@/lib/db/prisma'
import { normalizePhoneNumber } from '@/lib/whatsapp-config'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/contacts
 * Get all whatsapp contacts
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const contacts = await prisma.whatsappContact.findMany({
            orderBy: [
                { group: 'asc' },
                { name: 'asc' },
            ],
        })

        return NextResponse.json({
            success: true,
            data: contacts,
        })
    } catch (error: any) {
        console.error('Error fetching contacts:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch contacts' },
            { status: 500 }
        )
    }
}

/**
 * POST /api/admin/contacts
 * Create new whatsapp contact
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { name, phone, group, department, notes, isActive } = body

        if (!name || !phone || !group) {
            return NextResponse.json(
                { error: 'Name, phone, and group are required' },
                { status: 400 }
            )
        }

        const normalizedPhone = normalizePhoneNumber(phone)

        const contact = await prisma.whatsappContact.create({
            data: {
                name: name.trim(),
                phone: normalizedPhone,
                group: group.trim().toUpperCase(),
                department: department ? department.trim() : null,
                notes: notes ? notes.trim() : null,
                isActive: isActive ?? true,
            },
        })

        return NextResponse.json({
            success: true,
            data: contact,
            message: 'Contact created successfully',
        })
    } catch (error: any) {
        console.error('Error creating contact:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create contact' },
            { status: 500 }
        )
    }
}

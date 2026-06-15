import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/session'
import { lotoRequestSchema } from '@/lib/validators'
import { createLotoRequest, getLotoRequests } from '@/lib/services/loto.service'
import { LotoType, LotoStatus } from '@prisma/client'

// GET /api/loto - Ambil semua LOTO request
export async function GET(request: NextRequest) {
    try {
        const session = await requireAuth()

        const searchParams = request.nextUrl.searchParams
        const status = searchParams.get('status') as LotoStatus | null
        const type = searchParams.get('type') as LotoType | null

        const filters: any = {}
        if (status) filters.status = status
        if (type) filters.type = type

        const lotoRequests = await getLotoRequests(filters)

        return NextResponse.json({ data: lotoRequests })
    } catch (error) {
        console.error('Get LOTO requests error:', error)

        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// POST /api/loto - Buat LOTO request baru
export async function POST(request: NextRequest) {
    try {
        const session = await requireAuth()
        const body = await request.json()

        const validatedData = lotoRequestSchema.parse(body)

        const lotoRequest = await createLotoRequest({
            type: validatedData.type,
            createdById: session.userId,
            operatorId: validatedData.operatorId,
            formData: validatedData.formData,
        })

        // Kirim notifikasi WhatsApp
        try {
            const { default: prisma } = await import('@/lib/db/prisma')
            const creator = await prisma.user.findUnique({
                where: { id: session.userId },
                select: { phoneNumber: true }
            })

            const { WhatsappService } = await import('@/lib/services/whatsapp.service')
            await WhatsappService.notifyNewRequest(
                lotoRequest.requestNumber,
                validatedData.formData.description || '-',
                validatedData.type,
                validatedData.formData.seksi || '-',
                session.username,
                creator?.phoneNumber
            )
        } catch (err) {
            console.error('[LOTO API] Failed to send WhatsApp notification:', err)
        }

        return NextResponse.json(
            { data: lotoRequest, message: 'LOTO request created successfully' },
            { status: 201 }
        )
    } catch (error) {
        console.error('Create LOTO request error:', error)

        if (error instanceof Error) {
            if (error.message === 'Unauthorized') {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            }

            if (error.name === 'ZodError') {
                return NextResponse.json(
                    { error: 'Invalid input data' },
                    { status: 400 }
                )
            }
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

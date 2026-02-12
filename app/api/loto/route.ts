import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/session'
import { lotoRequestSchema } from '@/lib/validators'
import { createLotoRequest, getLotoRequests } from '@/lib/services/loto.service'
import { LotoType, LotoStatus } from '@prisma/client'

// GET /api/loto - Get all LOTO requests
export async function GET(request: NextRequest) {
    try {
        const session = await requireAuth()

        const searchParams = request.nextUrl.searchParams
        const status = searchParams.get('status') as LotoStatus | null
        const type = searchParams.get('type') as LotoType | null

        const filters: any = {}
        if (status) filters.status = status
        if (type) filters.type = type

        // Filter by user role
        // For now, show all. Later we can add role-based filtering

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

// POST /api/loto - Create new LOTO request
export async function POST(request: NextRequest) {
    try {
        const session = await requireAuth()
        const body = await request.json()

        // Validate input
        const validatedData = lotoRequestSchema.parse(body)

        // Create LOTO request
        const lotoRequest = await createLotoRequest({
            type: validatedData.type,
            createdById: session.userId,
            operatorId: validatedData.operatorId,
            formData: validatedData.formData,
        })

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

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/session'
import { getLotoRequest, updateLotoRequest, deleteLotoRequest } from '@/lib/services/loto.service'
import { UserRole } from '@prisma/client'

// GET /api/loto/[id] - Get single LOTO request
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await requireAuth()

        const lotoRequest = await getLotoRequest(params.id)

        if (!lotoRequest) {
            return NextResponse.json(
                { error: 'LOTO request not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ data: lotoRequest })
    } catch (error) {
        console.error('Get LOTO request error:', error)

        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// PUT /api/loto/[id] - Update LOTO request
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requireAuth()
        const body = await request.json()

        const updated = await updateLotoRequest(
            params.id,
            body,
            session.userId
        )

        return NextResponse.json({
            data: updated,
            message: 'LOTO request updated successfully',
        })
    } catch (error) {
        console.error('Update LOTO request error:', error)

        if (error instanceof Error) {
            if (error.message === 'Unauthorized') {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            }

            if (error.message === 'LOTO request not found') {
                return NextResponse.json({ error: error.message }, { status: 404 })
            }
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// DELETE /api/loto/[id] - Delete LOTO request
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requireAuth()

        // Only OPERATOR and ADMIN can delete
        if (session.role !== UserRole.ADMIN && session.role !== UserRole.OPERATOR) {
            return NextResponse.json(
                { error: 'Forbidden: Only admin or operator can delete LOTO requests' },
                { status: 403 }
            )
        }

        await deleteLotoRequest(params.id)

        return NextResponse.json({
            message: 'LOTO request deleted successfully',
        })
    } catch (error) {
        console.error('Delete LOTO request error:', error)

        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

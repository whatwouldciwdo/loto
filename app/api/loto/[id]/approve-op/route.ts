import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import prisma from '@/lib/db/prisma'

/**
 * POST /api/loto/:id/approve-op
 * Operator approves LOTO request
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Verify user is operator
        if (session.role !== 'OP_LOKAL' && session.role !== 'OP_CCR') {
            return NextResponse.json(
                { error: 'Only operators can approve LOTO requests' },
                { status: 403 }
            )
        }

        const { id } = params
        const body = await request.json()
        const { notes } = body

        // Find LOTO request
        const lotoRequest = await prisma.lotoRequest.findUnique({
            where: { id },
        })

        if (!lotoRequest) {
            return NextResponse.json({ error: 'LOTO request not found' }, { status: 404 })
        }

        // Verify status is PENDING_OP
        if (lotoRequest.status !== 'PENDING_OP') {
            return NextResponse.json(
                { error: `Cannot approve LOTO with status ${lotoRequest.status}` },
                { status: 400 }
            )
        }

        // Update LOTO request status and operator
        const updatedLoto = await prisma.lotoRequest.update({
            where: { id },
            data: {
                status: 'PROGRESS',
                operatorId: session.userId,
            },
        })

        // Create approval record
        await prisma.lotoApproval.create({
            data: {
                lotoRequestId: id,
                approverId: session.userId,
                step: 'OP_APPROVAL',
                approverRole: session.role,
                status: 'APPROVED',
                notes: notes || 'Operator approved',
                approvedAt: new Date(),
            },
        })

        // Create history entry
        await prisma.lotoHistory.create({
            data: {
                lotoRequestId: id,
                actorId: session.userId,
                action: 'OPERATOR_APPROVED',
                oldStatus: 'PENDING_OP',
                newStatus: 'PROGRESS',
                metadata: notes ? { notes } : undefined,
            },
        })

        return NextResponse.json({
            success: true,
            data: updatedLoto,
            message: 'LOTO request approved successfully',
        })
    } catch (error: any) {
        console.error('Error approving LOTO:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to approve LOTO request' },
            { status: 500 }
        )
    }
}

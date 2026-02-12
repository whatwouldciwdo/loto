import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { ApprovalService } from '@/lib/services/approval.service'

/**
 * POST /api/loto/[id]/approve-har
 * HAR (SP/SPS HAR) approves or rejects request
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

        const lotoId = params.id
        const body = await request.json()
        const { approved, comments } = body

        if (typeof approved !== 'boolean') {
            return NextResponse.json(
                { error: 'approved field is required (boolean)' },
                { status: 400 }
            )
        }

        const result = await ApprovalService.approveHAR(
            lotoId,
            session.userId,
            session.role,
            approved,
            comments
        )

        return NextResponse.json({
            success: true,
            data: result,
            message: approved
                ? 'LOTO request approved by HAR'
                : 'LOTO request rejected by HAR',
        })
    } catch (error: any) {
        console.error('Error approving HAR:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to process HAR approval' },
            { status: 500 }
        )
    }
}

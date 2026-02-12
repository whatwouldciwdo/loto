import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { ApprovalService } from '@/lib/services/approval.service'

/**
 * POST /api/loto/[id]/submit-approval
 * Submit LOTO request for HAR approval
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

        const result = await ApprovalService.submitForApproval(lotoId, session.userId)

        return NextResponse.json({
            success: true,
            data: result,
            message: 'LOTO request submitted for HAR approval',
        })
    } catch (error: any) {
        console.error('Error submitting for approval:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to submit for approval' },
            { status: 500 }
        )
    }
}

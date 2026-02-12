import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { ApprovalService } from '@/lib/services/approval.service'

/**
 * POST /api/loto/[id]/approve-release
 * Operator confirms release with photos (CAT.06)
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
        const { approved, releaseData, comments } = body

        if (typeof approved !== 'boolean') {
            return NextResponse.json(
                { error: 'approved field is required (boolean)' },
                { status: 400 }
            )
        }

        const result = await ApprovalService.approveRelease(
            lotoId,
            session.userId,
            session.role,
            approved,
            releaseData,
            comments
        )

        return NextResponse.json({
            success: true,
            data: result,
            message: approved
                ? 'LOTO release approved - Status CLOSE'
                : 'LOTO release rejected',
        })
    } catch (error: any) {
        console.error('Error approving release:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to process release approval' },
            { status: 500 }
        )
    }
}

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { ApprovalService } from '@/lib/services/approval.service'

/**
 * POST /api/loto/[id]/release
 * Operator submits release form
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
        const { formData } = body

        const result = await ApprovalService.submitRelease(
            lotoId,
            session.userId,
            session.role,
            formData
        )

        return NextResponse.json({
            success: true,
            data: result,
            message: 'Release submitted successfully',
        })
    } catch (error: any) {
        console.error('Error submitting release:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to submit release' },
            { status: 500 }
        )
    }
}

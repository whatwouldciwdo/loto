import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { ApprovalService } from '@/lib/services/approval.service'

/**
 * POST /api/loto/[id]/operator-form
 * Operator submits tagging form (CAT.03)
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
        const { formData, submitType } = await request.json()

        // Validate submitType
        if (!submitType || !['draft', 'execute'].includes(submitType)) {
            return NextResponse.json(
                { error: 'Invalid submitType. Must be "draft" or "execute"' },
                { status: 400 }
            )
        }

        const result = await ApprovalService.submitOperatorForm(
            lotoId,
            session.userId,
            session.role,
            formData,
            submitType as 'draft' | 'execute'
        )

        return NextResponse.json({
            success: true,
            data: result,
            message: submitType === 'draft'
                ? 'Draft saved successfully'
                : 'Operator form executed successfully',
        })
    } catch (error: any) {
        console.error('Error submitting operator form:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to submit operator form' },
            { status: 500 }
        )
    }
}

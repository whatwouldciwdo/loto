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

        const result: any = await ApprovalService.submitRelease(
            lotoId,
            session.userId,
            session.role as any,
            formData
        )

        // Send WhatsApp Notification
        try {
            const { WhatsappService } = await import('@/lib/services/whatsapp.service')
            await WhatsappService.notifyRelease({
                requestNumber: result.requestNumber,
                workOrder: (result.formData as any)?.workorderNumber || (result.formData as any)?.operatorForm?.workorderNumber || '-',
                status: result.status,
                description: (result.formData as any)?.description || (result.formData as any)?.operatorForm?.description || '-',
                equipment: result.asset?.equipmentName || (result.formData as any)?.equipmentName || 'Asset ID: ' + result.assetId,
                eksekutorRelease: (formData as any)?.eksekutorRelease || '-',
                keteranganRelease: (formData as any)?.keteranganRelease || '-',
                creatorPhone: result.createdBy?.phoneNumber,
                seksiHar: (result.formData as any)?.operatorForm?.seksiHAR || (result.formData as any)?.seksiHAR || '-'
            })
        } catch (err) {
            console.error('Failed to send WhatsApp notification:', err)
        }

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

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { ApprovalService } from '@/lib/services/approval.service'

/**
 * POST /api/loto/[id]/operator-form
 * Operator submit form tagging (CAT.03)
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

        if (!submitType || !['draft', 'execute'].includes(submitType)) {
            return NextResponse.json(
                { error: 'Invalid submitType. Must be "draft" or "execute"' },
                { status: 400 }
            )
        }

        const result: any = await ApprovalService.submitOperatorForm(
            lotoId,
            session.userId,
            session.role as any,
            formData,
            submitType as 'draft' | 'execute'
        )

        // Kirim notifikasi WhatsApp hanya saat execute
        if (submitType === 'execute') {
            try {
                const { WhatsappService } = await import('@/lib/services/whatsapp.service')
                await WhatsappService.notifyExecution({
                    requestNumber: result.requestNumber,
                    workOrder: (result.formData as any)?.workorderNumber || '-',
                    status: result.status,
                    type: result.type,
                    seksi: (result.formData as any)?.seksi || '-',
                    description: (result.formData as any)?.description || '-',
                    equipment: result.asset?.equipmentName || (formData as any)?.equipmentName || (result.formData as any)?.operatorForm?.equipmentName || 'Asset ID: ' + result.assetId,
                    peralatan: (formData as any)?.peralatan || '-',
                    eksekusi: (formData as any)?.eksekusi || '-',
                    eksekutor: (formData as any)?.eksekutor || '-',
                    assetNumber: result.asset?.assetNumber || '-',
                    creatorPhone: result.createdBy?.phoneNumber
                })
            } catch (err) {
                console.error('Failed to send WhatsApp notification:', err)
            }
        }

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

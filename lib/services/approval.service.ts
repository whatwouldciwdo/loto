import prisma from '@/lib/db/prisma'
import { LotoStatus, ApprovalStatus, UserRole } from '@prisma/client'

// ============================================
// SIMPLIFIED APPROVAL WORKFLOW
// ============================================
// Flow: REQUEST → DRAFT → ACTIVE → CLOSE
// 1. Create Request → REQUEST
// 2. Operator Save Draft → DRAFT
// 3. Operator Execution Form → ACTIVE
// 4. Release Form → CLOSE

// ============================================
// STATUS TRANSITIONS - State Machine
// ============================================

const STATUS_TRANSITIONS: Record<LotoStatus, LotoStatus[]> = {
    REQUEST: [LotoStatus.DRAFT, LotoStatus.ACTIVE, LotoStatus.CANCELLED],
    DRAFT: [LotoStatus.ACTIVE, LotoStatus.CANCELLED],
    ACTIVE: [LotoStatus.CLOSE, LotoStatus.CANCELLED],
    CLOSE: [],
    CANCELLED: [],
}

// ============================================
// PERMISSION GUARDS
// ============================================

export function canExecute(userRole: UserRole): boolean {
    return userRole === UserRole.OPERATOR || userRole === UserRole.ADMIN
}

export function canRelease(userRole: UserRole): boolean {
    return userRole === UserRole.OPERATOR || userRole === UserRole.ADMIN
}

// ============================================
// APPROVAL SERVICE
// ============================================

export class ApprovalService {

    /**
     * OPERATOR submits execution form (CAT.03)
     * Transitions: DRAFT → ACTIVE (execute) or DRAFT → DRAFT (save draft)
     */
    static async submitOperatorForm(
        lotoId: string,
        userId: string,
        userRole: UserRole,
        formData: any,
        submitType: 'draft' | 'execute'
    ) {
        if (!canExecute(userRole)) {
            throw new Error('User not authorized to fill operator form')
        }

        const loto = await prisma.lotoRequest.findUnique({
            where: { id: lotoId },
        })

        if (!loto) {
            throw new Error('LOTO request not found')
        }

        // Allow from REQUEST, DRAFT or ACTIVE (for editing)
        const allowedStatuses = [LotoStatus.REQUEST, LotoStatus.DRAFT, LotoStatus.ACTIVE]
        if (!allowedStatuses.includes(loto.status)) {
            throw new Error(`Cannot fill operator form from status: ${loto.status}`)
        }

        // Determine new status based on submitType
        const newStatus = submitType === 'draft' ? LotoStatus.DRAFT : LotoStatus.ACTIVE

        // Update form data with operator info
        const updated = await prisma.lotoRequest.update({
            where: { id: lotoId },
            data: {
                operatorId: userId,
                status: newStatus,
                formData: {
                    ...(loto.formData as any),
                    operatorForm: formData,
                },
            },
        })

        // Log history
        await prisma.lotoHistory.create({
            data: {
                lotoRequestId: lotoId,
                actorId: userId,
                action: submitType === 'draft' ? 'saved_draft' : 'executed_tagging',
                oldStatus: loto.status,
                newStatus: newStatus,
                metadata: { formType: 'CAT.03', submitType },
            },
        })

        return updated
    }

    /**
     * OPERATOR submits release form (CAT.06)
     * Transitions: ACTIVE → CLOSE
     */
    static async submitRelease(
        lotoId: string,
        userId: string,
        userRole: UserRole,
        formData: any
    ) {
        if (!canRelease(userRole)) {
            throw new Error('User not authorized to submit release form')
        }

        const loto = await prisma.lotoRequest.findUnique({
            where: { id: lotoId },
        })

        if (!loto) {
            throw new Error('LOTO request not found')
        }

        // Can only release from ACTIVE status
        if (loto.status !== LotoStatus.ACTIVE) {
            throw new Error(`Cannot release from status: ${loto.status}. Must be ACTIVE.`)
        }

        // Update to CLOSE status
        const updated = await prisma.lotoRequest.update({
            where: { id: lotoId },
            data: {
                status: LotoStatus.CLOSE,
                completedAt: new Date(),
                formData: {
                    ...(loto.formData as any),
                    releaseForm: formData,
                },
            },
        })

        // Log history
        await prisma.lotoHistory.create({
            data: {
                lotoRequestId: lotoId,
                actorId: userId,
                action: 'released',
                oldStatus: LotoStatus.ACTIVE,
                newStatus: LotoStatus.CLOSE,
                metadata: { formType: 'CAT.06' },
            },
        })

        return updated
    }

    /**
     * Cancel a LOTO request
     * Can cancel from DRAFT or ACTIVE
     */
    static async cancel(
        lotoId: string,
        userId: string,
        reason: string
    ) {
        const loto = await prisma.lotoRequest.findUnique({
            where: { id: lotoId },
        })

        if (!loto) {
            throw new Error('LOTO request not found')
        }

        // Can only cancel from REQUEST, DRAFT or ACTIVE
        if (![LotoStatus.REQUEST, LotoStatus.DRAFT, LotoStatus.ACTIVE].includes(loto.status)) {
            throw new Error(`Cannot cancel from status: ${loto.status}`)
        }

        const updated = await prisma.lotoRequest.update({
            where: { id: lotoId },
            data: { status: LotoStatus.CANCELLED },
        })

        // Log history
        await prisma.lotoHistory.create({
            data: {
                lotoRequestId: lotoId,
                actorId: userId,
                action: 'cancelled',
                oldStatus: loto.status,
                newStatus: LotoStatus.CANCELLED,
                metadata: { reason },
            },
        })

        return updated
    }

    /**
     * Get LOTO requests by status for a user's role
     */
    static async getPendingByRole(userId: string, userRole: UserRole) {
        const conditions: any[] = []

        // OPERATOR sees REQUEST, DRAFT and ACTIVE
        if (userRole === UserRole.OPERATOR) {
            conditions.push({ status: LotoStatus.REQUEST })
            conditions.push({ status: LotoStatus.DRAFT })
            conditions.push({ status: LotoStatus.ACTIVE })
        }

        // ADMIN sees everything
        if (userRole === UserRole.ADMIN) {
            conditions.push({ status: LotoStatus.REQUEST })
            conditions.push({ status: LotoStatus.DRAFT })
            conditions.push({ status: LotoStatus.ACTIVE })
        }

        if (conditions.length === 0) {
            return []
        }

        return await prisma.lotoRequest.findMany({
            where: {
                OR: conditions,
            },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        role: true,
                    },
                },
                operator: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        role: true,
                    },
                },
                asset: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        })
    }

    /**
     * Get history for a LOTO request
     */
    static async getApprovalHistory(lotoId: string) {
        return await prisma.lotoHistory.findMany({
            where: { lotoRequestId: lotoId },
            include: {
                actor: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        role: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        })
    }
}

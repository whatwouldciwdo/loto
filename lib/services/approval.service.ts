import prisma from '@/lib/db/prisma'
import { LotoStatus, UserRole } from '@prisma/client'

// Flow: REQUEST → DRAFT → ACTIVE → CLOSE
// 1. Create Request → REQUEST
// 2. Operator Save Draft → DRAFT
// 3. Operator Execution Form → ACTIVE
// 4. Release Form → CLOSE

const STATUS_TRANSITIONS: Record<LotoStatus, LotoStatus[]> = {
    REQUEST: [LotoStatus.DRAFT, LotoStatus.ACTIVE, LotoStatus.CANCELLED],
    DRAFT: [LotoStatus.ACTIVE, LotoStatus.CANCELLED],
    ACTIVE: [LotoStatus.CLOSE, LotoStatus.CANCELLED],
    CLOSE: [],
    CANCELLED: [],
}

export function canExecute(userRole: UserRole): boolean {
    return userRole === UserRole.OPERATOR || userRole === UserRole.ADMIN
}

export function canRelease(userRole: UserRole): boolean {
    return userRole === UserRole.OPERATOR || userRole === UserRole.ADMIN
}

export class ApprovalService {

    /**
     * OPERATOR submit form eksekusi (CAT.03)
     * Transisi: DRAFT → ACTIVE (execute) atau DRAFT → DRAFT (save draft)
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

        const allowedStatuses: LotoStatus[] = [LotoStatus.REQUEST, LotoStatus.DRAFT, LotoStatus.ACTIVE]
        if (!allowedStatuses.includes(loto.status)) {
            throw new Error(`Cannot fill operator form from status: ${loto.status}`)
        }

        const newStatus = submitType === 'draft' ? LotoStatus.DRAFT : LotoStatus.ACTIVE

        const updated = await prisma.lotoRequest.update({
            where: { id: lotoId },
            data: {
                operatorId: userId,
                status: newStatus,
                assetId: formData.asset_id || undefined,
                formData: {
                    ...(loto.formData as any),
                    operatorForm: formData,
                },
            },
            include: {
                createdBy: true,
                asset: true,
            },
        })

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
     * OPERATOR submit form release (CAT.06)
     * Transisi: ACTIVE → CLOSE
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

        if (loto.status !== LotoStatus.ACTIVE) {
            throw new Error(`Cannot release from status: ${loto.status}. Must be ACTIVE.`)
        }

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
            include: {
                createdBy: true,
                asset: true,
            },
        })

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
     * Cancel LOTO request (dari REQUEST, DRAFT, atau ACTIVE)
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

        const allowedStatuses: LotoStatus[] = [LotoStatus.REQUEST, LotoStatus.DRAFT, LotoStatus.ACTIVE]
        if (!allowedStatuses.includes(loto.status)) {
            throw new Error(`Cannot cancel from status: ${loto.status}`)
        }

        const updated = await prisma.lotoRequest.update({
            where: { id: lotoId },
            data: { status: LotoStatus.CANCELLED },
        })

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
     * Ambil LOTO request berdasarkan role user
     */
    static async getPendingByRole(userId: string, userRole: UserRole) {
        const conditions: any[] = []

        if (userRole === UserRole.OPERATOR || userRole === UserRole.ADMIN) {
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
                    select: { id: true, username: true, name: true, role: true },
                },
                operator: {
                    select: { id: true, username: true, name: true, role: true },
                },
                asset: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        })
    }

    /**
     * Ambil riwayat approval LOTO
     */
    static async getApprovalHistory(lotoId: string) {
        return await prisma.lotoHistory.findMany({
            where: { lotoRequestId: lotoId },
            include: {
                actor: {
                    select: { id: true, username: true, name: true, role: true },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        })
    }
}

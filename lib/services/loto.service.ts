import prisma from '@/lib/db/prisma'
import { LotoType, LotoStatus, ApprovalStatus } from '@prisma/client'

// Generate unique LOTO request number
export async function generateRequestNumber(): Promise<string> {
    const year = new Date().getFullYear()
    const prefix = `LOTO-${year}-`

    const lastRequest = await prisma.lotoRequest.findFirst({
        where: {
            requestNumber: {
                startsWith: prefix,
            },
        },
        orderBy: {
            requestNumber: 'desc',
        },
        select: {
            requestNumber: true,
        },
    })

    let nextNumber = 1
    if (lastRequest) {
        const lastNum = parseInt(lastRequest.requestNumber.replace(prefix, ''), 10)
        if (!isNaN(lastNum)) {
            nextNumber = lastNum + 1
        }
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`
}

// Create LOTO request
export async function createLotoRequest(data: {
    type: LotoType
    createdById: string
    operatorId?: string
    formData: any
}) {
    const requestNumber = await generateRequestNumber()

    const lotoRequest = await prisma.lotoRequest.create({
        data: {
            requestNumber,
            type: data.type,
            status: LotoStatus.REQUEST,
            createdById: data.createdById,
            operatorId: data.operatorId,
            formData: data.formData,
        },
        include: {
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    role: true,
                },
            },
            operator: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    role: true,
                },
            },
        },
    })

    // Create history entry
    await prisma.lotoHistory.create({
        data: {
            lotoRequestId: lotoRequest.id,
            actorId: data.createdById,
            action: 'created',
            newStatus: LotoStatus.REQUEST,
            metadata: {
                requestNumber: lotoRequest.requestNumber,
            },
        },
    })

    return lotoRequest
}

// Get LOTO request by ID
export async function getLotoRequest(id: string) {
    return prisma.lotoRequest.findUnique({
        where: { id },
        include: {
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    role: true,
                    department: true,
                },
            },
            operator: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    role: true,
                    department: true,
                },
            },
            approvals: {
                include: {
                    approver: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            role: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'asc',
                },
            },
            history: {
                include: {
                    actor: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            role: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            },
            attachments: {
                orderBy: {
                    createdAt: 'desc',
                },
            },
            taggingCard: true,
        },
    })
}

// Get all LOTO requests (with filtering)
export async function getLotoRequests(filters?: {
    status?: LotoStatus
    type?: LotoType
    createdById?: string
    operatorId?: string
}) {
    return prisma.lotoRequest.findMany({
        where: filters,
        include: {
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    role: true,
                },
            },
            operator: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    role: true,
                },
            },
            _count: {
                select: {
                    approvals: true,
                    attachments: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    })
}

// Update LOTO request
export async function updateLotoRequest(
    id: string,
    data: {
        operatorId?: string
        formData?: any
        status?: LotoStatus
    },
    actorId: string
) {
    const currentLoto = await prisma.lotoRequest.findUnique({
        where: { id },
    })

    if (!currentLoto) {
        throw new Error('LOTO request not found')
    }

    const updated = await prisma.lotoRequest.update({
        where: { id },
        data,
    })

    // Log history if status changed
    if (data.status && data.status !== currentLoto.status) {
        await prisma.lotoHistory.create({
            data: {
                lotoRequestId: id,
                actorId,
                action: 'status_changed',
                oldStatus: currentLoto.status,
                newStatus: data.status,
            },
        })
    }

    return updated
}

// Delete LOTO request
export async function deleteLotoRequest(id: string) {
    return prisma.lotoRequest.delete({
        where: { id },
    })
}

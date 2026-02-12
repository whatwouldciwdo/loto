import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import prisma from '@/lib/db/prisma'

/**
 * GET /api/loto/pending-op?unit={unit}
 * Fetch LOTO requests pending operator approval
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const unit = searchParams.get('unit')

        const where: any = {
            status: 'PENDING_OP',
        }

        if (unit) {
            where.formData = {
                path: ['unit'],
                equals: unit,
            }
        }

        const pendingRequests = await prisma.lotoRequest.findMany({
            where,
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                    },
                },
                asset: {
                    select: {
                        id: true,
                        assetNumber: true,
                        equipmentName: true,
                        unit: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        return NextResponse.json({
            success: true,
            data: pendingRequests,
            count: pendingRequests.length,
        })
    } catch (error: any) {
        console.error('Error fetching pending OP requests:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch pending requests' },
            { status: 500 }
        )
    }
}

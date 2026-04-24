import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import prisma from '@/lib/db/prisma'

/**
 * GET /api/assets/[id]
 * Get asset detail
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const asset = await prisma.asset.findUnique({
            where: { id: params.id },
        })

        if (!asset) {
            return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            data: asset,
        })
    } catch (error: any) {
        console.error('Error fetching asset:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch asset' },
            { status: 500 }
        )
    }
}

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import prisma from '@/lib/db/prisma'

/**
 * GET /api/assets/search?q={query}&unit={unit}
 * Search assets by name or number
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const query = searchParams.get('q') || ''
        const unit = searchParams.get('unit') // Optional unit filter

        const assets = await prisma.asset.findMany({
            where: {
                ...(unit ? { unit } : {}),
                isActive: true,
                OR: [
                    { equipmentName: { contains: query, mode: 'insensitive' } }, // Description - priority
                    { assetNumber: { contains: query, mode: 'insensitive' } },
                    { kodeAlas: { contains: query, mode: 'insensitive' } },
                ],
            },
            take: 50,
            orderBy: {
                equipmentName: 'asc',
            },
            select: {
                id: true,
                assetNumber: true,
                equipmentName: true,
                equipmentType: true,
                location: true,
                kodeAlas: true,
                systemOwner: true,
                unit: true,
            },
        })

        return NextResponse.json({
            success: true,
            data: assets,
            count: assets.length,
        })
    } catch (error: any) {
        console.error('Error searching assets:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to search assets' },
            { status: 500 }
        )
    }
}

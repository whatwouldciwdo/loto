import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import prisma from '@/lib/db/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/assets
 * List assets with filtering and pagination
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const q = searchParams.get('q') || ''
        const unit = searchParams.get('unit') || ''
        const status = searchParams.get('status') || 'ALL' // 'ALL', 'ACTIVE', 'INACTIVE'
        const limit = parseInt(searchParams.get('limit') || '100', 10)
        const page = parseInt(searchParams.get('page') || '1', 10)
        const skip = (page - 1) * limit

        const where: any = {}

        if (unit) {
            where.unit = { equals: unit, mode: 'insensitive' }
        }

        if (status === 'ACTIVE') {
            where.isActive = true
        } else if (status === 'INACTIVE') {
            where.isActive = false
        }

        if (q) {
            where.OR = [
                { equipmentName: { contains: q, mode: 'insensitive' } },
                { assetNumber: { contains: q, mode: 'insensitive' } },
                { kodeAlas: { contains: q, mode: 'insensitive' } },
                { location: { contains: q, mode: 'insensitive' } },
            ]
        }

        const [assets, total] = await Promise.all([
            prisma.asset.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    equipmentName: 'asc',
                },
            }),
            prisma.asset.count({ where }),
        ])

        return NextResponse.json({
            success: true,
            data: assets,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error: any) {
        console.error('Error fetching admin assets:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch assets' },
            { status: 500 }
        )
    }
}

/**
 * POST /api/admin/assets
 * Create a new asset
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const {
            assetNumber,
            equipmentName,
            equipmentType,
            location,
            kodeAlas,
            unit,
            systemOwner,
            description,
            manufacturer,
            model,
            serialNumber,
            isActive,
        } = body

        if (!assetNumber || !equipmentName || !unit) {
            return NextResponse.json(
                { error: 'Nomor Asset, Nama Equipment, dan Unit wajib diisi' },
                { status: 400 }
            )
        }

        // Check duplicate assetNumber
        const existing = await prisma.asset.findUnique({
            where: { assetNumber: assetNumber.trim() },
        })

        if (existing) {
            return NextResponse.json(
                { error: `Nomor Asset "${assetNumber}" sudah terdaftar.` },
                { status: 400 }
            )
        }

        const asset = await prisma.asset.create({
            data: {
                assetNumber: assetNumber.trim(),
                equipmentName: equipmentName.trim(),
                equipmentType: equipmentType ? equipmentType.trim() : null,
                location: location ? location.trim() : null,
                kodeAlas: kodeAlas ? kodeAlas.trim() : null,
                unit: unit.trim().toUpperCase(),
                systemOwner: systemOwner ? systemOwner.trim() : null,
                description: description ? description.trim() : null,
                manufacturer: manufacturer ? manufacturer.trim() : null,
                model: model ? model.trim() : null,
                serialNumber: serialNumber ? serialNumber.trim() : null,
                isActive: isActive ?? true,
            },
        })

        return NextResponse.json({
            success: true,
            data: asset,
            message: 'Asset berhasil ditambahkan',
        })
    } catch (error: any) {
        console.error('Error creating asset:', error)
        return NextResponse.json(
            { error: error.message || 'Gagal menambahkan asset' },
            { status: 500 }
        )
    }
}

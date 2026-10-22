import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import prisma from '@/lib/db/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/assets/[id]
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

        return NextResponse.json({ success: true, data: asset })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

/**
 * PUT /api/admin/assets/[id]
 * Update asset
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        // If updating assetNumber, check if it collides with another asset
        if (assetNumber) {
            const collision = await prisma.asset.findFirst({
                where: {
                    assetNumber: assetNumber.trim(),
                    id: { not: params.id },
                },
            })
            if (collision) {
                return NextResponse.json(
                    { error: `Nomor Asset "${assetNumber}" sudah digunakan oleh peralatan lain.` },
                    { status: 400 }
                )
            }
        }

        const updateData: any = {}
        if (assetNumber !== undefined) updateData.assetNumber = assetNumber.trim()
        if (equipmentName !== undefined) updateData.equipmentName = equipmentName.trim()
        if (equipmentType !== undefined) updateData.equipmentType = equipmentType ? equipmentType.trim() : null
        if (location !== undefined) updateData.location = location ? location.trim() : null
        if (kodeAlas !== undefined) updateData.kodeAlas = kodeAlas ? kodeAlas.trim() : null
        if (unit !== undefined) updateData.unit = unit.trim().toUpperCase()
        if (systemOwner !== undefined) updateData.systemOwner = systemOwner ? systemOwner.trim() : null
        if (description !== undefined) updateData.description = description ? description.trim() : null
        if (manufacturer !== undefined) updateData.manufacturer = manufacturer ? manufacturer.trim() : null
        if (model !== undefined) updateData.model = model ? model.trim() : null
        if (serialNumber !== undefined) updateData.serialNumber = serialNumber ? serialNumber.trim() : null
        if (isActive !== undefined) updateData.isActive = Boolean(isActive)

        const asset = await prisma.asset.update({
            where: { id: params.id },
            data: updateData,
        })

        return NextResponse.json({
            success: true,
            data: asset,
            message: 'Asset berhasil diperbarui',
        })
    } catch (error: any) {
        console.error('Error updating asset:', error)
        return NextResponse.json(
            { error: error.message || 'Gagal memperbarui asset' },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/admin/assets/[id]
 * Delete or deactivate asset
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if asset is referenced by existing LOTO requests
        const lotoCount = await prisma.lotoRequest.count({
            where: { assetId: params.id },
        })

        if (lotoCount > 0) {
            // Cannot hard-delete because of foreign key constraint; soft-deactivate instead
            await prisma.asset.update({
                where: { id: params.id },
                data: { isActive: false },
            })
            return NextResponse.json({
                success: true,
                message: `Asset memiliki ${lotoCount} riwayat LOTO terkait, sehingga dinonaktifkan (soft delete).`,
                softDeleted: true,
            })
        }

        // Hard delete if no LOTO records attached
        await prisma.asset.delete({
            where: { id: params.id },
        })

        return NextResponse.json({
            success: true,
            message: 'Asset berhasil dihapus permanen',
            softDeleted: false,
        })
    } catch (error: any) {
        console.error('Error deleting asset:', error)
        return NextResponse.json(
            { error: error.message || 'Gagal menghapus asset' },
            { status: 500 }
        )
    }
}

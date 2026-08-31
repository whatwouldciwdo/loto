import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/session'
import prisma from '@/lib/db/prisma'
import { createLotoRequest } from '@/lib/services/loto.service'
import { WhatsappService } from '@/lib/services/whatsapp.service'
import { LotoType } from '@prisma/client'

export const dynamic = 'force-dynamic'

interface BatchItem {
    type?: LotoType
    formData: {
        workorderNumber: string
        description: string
        workType: string
        seksi: string
        assetId?: string
        assetNumber?: string
        equipmentName?: string
        unit?: string
        location?: string
        kodeAlas?: string
        systemOwner?: string
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await requireAuth()
        const body = await request.json()

        const items: BatchItem[] = body.items || []

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { error: 'Daftar item LOTO tidak boleh kosong' },
                { status: 400 }
            )
        }

        // Creator phone for WhatsApp confirmation
        const creator = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { phoneNumber: true, name: true, username: true }
        })

        const createdResults: any[] = []
        const failedResults: any[] = []

        for (let i = 0; i < items.length; i++) {
            const item = items[i]
            const form = item.formData

            if (!form.workorderNumber && !form.description && !form.assetNumber) {
                continue
            }

            try {
                // If assetId is not provided, try to find matching asset in DB
                let finalAssetId = form.assetId
                let finalAssetNumber = form.assetNumber || ''
                let finalEquipmentName = form.equipmentName || ''

                if (!finalAssetId && finalAssetNumber) {
                    const matchedAsset = await prisma.asset.findFirst({
                        where: {
                            assetNumber: {
                                equals: finalAssetNumber.trim(),
                                mode: 'insensitive',
                            },
                        },
                    })

                    if (matchedAsset) {
                        finalAssetId = matchedAsset.id
                        finalEquipmentName = matchedAsset.equipmentName
                    }
                }

                const loto = await createLotoRequest({
                    type: item.type || LotoType.TAGGING,
                    createdById: session.userId,
                    assetId: finalAssetId,
                    formData: {
                        workorderNumber: form.workorderNumber || '',
                        description: form.description || '',
                        workType: form.workType || 'Corrective Maintenance',
                        seksi: form.seksi || '',
                        assetId: finalAssetId || '',
                        assetNumber: finalAssetNumber,
                        equipmentName: finalEquipmentName || finalAssetNumber,
                        unit: form.unit || 'CLG',
                        location: form.location || '',
                        kodeAlas: form.kodeAlas || '',
                        systemOwner: form.systemOwner || '',
                    },
                })

                createdResults.push({
                    id: loto.id,
                    requestNumber: loto.requestNumber,
                    workorderNumber: form.workorderNumber,
                    seksi: form.seksi,
                    description: form.description,
                    workType: form.workType || 'Corrective Maintenance',
                })
            } catch (itemErr: any) {
                console.error(`[Batch LOTO] Error creating row ${i + 1}:`, itemErr)
                failedResults.push({
                    index: i + 1,
                    workorderNumber: form.workorderNumber,
                    error: itemErr.message || 'Gagal membuat LOTO',
                })
            }
        }

        // Send consolidated WhatsApp notification (Anti-spam / Anti-ban safe delivery)
        if (createdResults.length > 0) {
            try {
                await WhatsappService.notifyBatchRequests({
                    creatorName: creator?.name || session.username,
                    creatorPhone: creator?.phoneNumber,
                    items: createdResults,
                })
            } catch (batchWaErr) {
                console.error('[Batch LOTO] Consolidated WA notification failed:', batchWaErr)
            }
        }

        return NextResponse.json({
            success: true,
            totalProcessed: items.length,
            createdCount: createdResults.length,
            failedCount: failedResults.length,
            createdItems: createdResults,
            failedItems: failedResults,
            message: `Berhasil membuat ${createdResults.length} tiket LOTO secara batch`,
        })
    } catch (error: any) {
        console.error('Batch LOTO error:', error)
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        return NextResponse.json(
            { error: error?.message || 'Internal server error' },
            { status: 500 }
        )
    }
}

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAssets() {
    console.log('🔍 Checking Asset Database...\n')

    try {
        // Count total assets
        const count = await prisma.asset.count()
        console.log(`📊 Total assets in database: ${count}\n`)

        // Get sample assets
        const sample = await prisma.asset.findMany({
            take: 10,
            orderBy: { equipmentName: 'asc' },
        })

        console.log('📋 Sample assets:')
        sample.forEach((asset, i) => {
            console.log(`\n${i + 1}. Equipment Name: ${asset.equipmentName}`)
            console.log(`   Asset Number: ${asset.assetNumber}`)
            console.log(`   Kode Alas: ${asset.kodeAlas || 'N/A'}`)
            console.log(`   System Owner: ${asset.systemOwner || 'N/A'}`)
            console.log(`   Unit: ${asset.unit}`)
        })

        // Search for DIESEL
        console.log('\n\n🔎 Searching for "DIESEL"...')
        const dieselAssets = await prisma.asset.findMany({
            where: {
                OR: [
                    { equipmentName: { contains: 'DIESEL', mode: 'insensitive' } },
                    { assetNumber: { contains: 'DIESEL', mode: 'insensitive' } },
                ],
            },
            take: 5,
        })

        console.log(`Found ${dieselAssets.length} assets with "DIESEL"`)
        dieselAssets.forEach((asset, i) => {
            console.log(`\n${i + 1}. ${asset.equipmentName}`)
            console.log(`   Asset: ${asset.assetNumber}`)
        })

        // Search for PUMP
        console.log('\n\n🔎 Searching for "PUMP"...')
        const pumpAssets = await prisma.asset.findMany({
            where: {
                OR: [
                    { equipmentName: { contains: 'PUMP', mode: 'insensitive' } },
                    { assetNumber: { contains: 'PUMP', mode: 'insensitive' } },
                ],
            },
            take: 5,
        })

        console.log(`Found ${pumpAssets.length} assets with "PUMP"`)
        pumpAssets.forEach((asset, i) => {
            console.log(`\n${i + 1}. ${asset.equipmentName}`)
            console.log(`   Asset: ${asset.assetNumber}`)
        })

    } catch (error) {
        console.error('❌ Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

checkAssets()

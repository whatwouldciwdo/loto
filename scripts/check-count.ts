import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAssetCount() {
    const count = await prisma.asset.count()
    console.log(`\n📊 Total assets in database: ${count}\n`)

    if (count === 1005) {
        console.log('✅ All 1005 assets imported successfully!')
    } else if (count < 1005) {
        console.log(`⚠️  Only ${count} assets found. Expected 1005.`)
        console.log(`   Missing: ${1005 - count} assets`)
    } else {
        console.log(`⚠️  Found ${count} assets. Expected 1005.`)
        console.log(`   Extra: ${count - 1005} assets`)
    }

    await prisma.$disconnect()
}

checkAssetCount()

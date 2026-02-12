import { PrismaClient } from '@prisma/client'
import ExcelJS from 'exceljs'
import path from 'path'

const prisma = new PrismaClient()

async function importAssetsFromExcel() {
    console.log('📊 Starting Asset Import from Excel...\n')

    const filePath = path.join(process.cwd(), 'list Asset 2026.xlsx')
    const workbook = new ExcelJS.Workbook()

    try {
        await workbook.xlsx.readFile(filePath)
        const worksheet = workbook.getWorksheet(1)

        if (!worksheet) {
            throw new Error('No worksheet found in Excel file')
        }

        console.log(`📋 Found worksheet: ${worksheet.name}`)
        console.log(`   Rows: ${worksheet.rowCount}\n`)

        // Clear existing assets
        const deleted = await prisma.asset.deleteMany()
        console.log(`🗑️  Cleared ${deleted.count} existing assets\n`)

        const assets: any[] = []

        // CORRECT Column mapping based on Excel analysis:
        // Column 1: Site (CLG)
        // Column 2: Asset Number
        // Column 3: Description (Equipment Name)
        // Column 4: Kode Alias (Location Code)
        // Column 7: System Owner
        // Column 9: Location

        console.log('🔍 Column mapping:')
        console.log('   Column 1: Site')
        console.log('   Column 2: Asset Number')
        console.log('   Column 3: Description (Equipment Name)')
        console.log('   Column 4: Kode Alias')
        console.log('   Column 7: System Owner')
        console.log('   Column 9: Location\n')

        // Read data rows (skip header row 1)
        let successCount = 0
        for (let rowNum = 2; rowNum <= worksheet.rowCount; rowNum++) {
            const row = worksheet.getRow(rowNum)

            const site = row.getCell(1).value          // Column 1: Site
            const assetNumber = row.getCell(2).value   // Column 2: Asset
            const description = row.getCell(3).value   // Column 3: Description
            const kodeAlas = row.getCell(4).value      // Column 4: Kode Alias
            const systemOwner = row.getCell(7).value   // Column 7: System Owner
            const location = row.getCell(9).value      // Column 9: Location

            // Skip empty rows
            if (!assetNumber || !description) continue

            const asset = {
                assetNumber: String(assetNumber).trim(),
                equipmentName: String(description).trim(), // Description as main name!
                kodeAlas: kodeAlas ? String(kodeAlas).trim() : null,
                location: location ? String(location).trim() : null,
                systemOwner: systemOwner ? String(systemOwner).trim() : null,
                unit: site ? String(site).trim() : 'CLG',
                equipmentType: null,
                isActive: true,
            }

            // Clean nulls
            if (asset.kodeAlas === '' || asset.kodeAlas === 'null') asset.kodeAlas = null
            if (asset.location === '' || asset.location === 'null') asset.location = null
            if (asset.systemOwner === '' || asset.systemOwner === 'null') asset.systemOwner = null

            assets.push(asset)
            successCount++
        }

        console.log(`📝 Prepared ${assets.length} assets for import\n`)

        // Bulk insert
        const result = await prisma.asset.createMany({
            data: assets,
            skipDuplicates: true,
        })

        console.log(`✅ Imported ${result.count} assets successfully!\n`)

        // Show sample with descriptions
        const sampleAssets = await prisma.asset.findMany({
            take: 10,
            orderBy: { equipmentName: 'asc' },
        })

        console.log('📋 Sample imported assets:')
        sampleAssets.forEach((asset: any, i: number) => {
            console.log(`\n${i + 1}. ${asset.equipmentName}`)
            console.log(`   Asset: ${asset.assetNumber}`)
            if (asset.kodeAlas) console.log(`   Kode Alas: ${asset.kodeAlas}`)
            if (asset.location) console.log(`   Location: ${asset.location}`)
        })

        // Test search
        console.log('\n\n🔎 Testing search for "DIESEL"...')
        const diesel = await prisma.asset.findMany({
            where: {
                equipmentName: { contains: 'DIESEL', mode: 'insensitive' },
            },
            take: 3,
        })
        console.log(`Found ${diesel.length} DIESEL assets`)
        diesel.forEach((a: any) => console.log(`  - ${a.equipmentName}`))

        console.log('\n🎉 Import completed successfully!')
    } catch (error) {
        console.error('❌ Error importing assets:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

importAssetsFromExcel()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })

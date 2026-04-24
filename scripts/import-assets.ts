import * as XLSX from 'xlsx';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const filePath = path.join(process.cwd(), 'list Asset 2026.xlsx');

async function importAssets() {
    try {
        console.log('Reading Excel file...');
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Read as JSON
        const rawData = XLSX.utils.sheet_to_json(sheet);
        console.log(`Found ${rawData.length} rows.`);

        let successCount = 0;
        let errorCount = 0;

        for (const row of rawData as any[]) {
            const assetNumber = row['Asset'];
            // Skip invalid rows
            if (!assetNumber) continue;

            const equipmentName = row['Description'] || 'Unknown';
            const unit = row['Site'] || 'CLG'; // Default to CLG if missing
            const location = row['Location'];

            // Map status "OPERATING" to true, others might be false/true depending on logic.
            // Assuming "OPERATING" is active.
            const isActive = row['Status'] === 'OPERATING';

            const assetData = {
                assetNumber: String(assetNumber),
                equipmentName: String(equipmentName),
                equipmentType: row['Description Kode Alias'] || null, // Best guess mapping
                kodeAlas: row['Kode Alias'] ? String(row['Kode Alias']) : null,
                unit: String(unit),
                location: location ? String(location) : null,
                systemOwner: row['System Owner'] ? String(row['System Owner']) : null,
                isActive: isActive,
                // Optional fields
                description: row['Kondisi Saat ini'] ? String(row['Kondisi Saat ini']) : null,
            };

            try {
                await prisma.asset.upsert({
                    where: { assetNumber: assetData.assetNumber },
                    update: assetData,
                    create: assetData,
                });
                successCount++;
                if (successCount % 50 === 0) process.stdout.write('.');
            } catch (err) {
                console.error(`\nFailed to import ${assetNumber}:`, err);
                errorCount++;
            }
        }

        console.log(`\n\nImport completed!`);
        console.log(`Success: ${successCount}`);
        console.log(`Errors: ${errorCount}`);

    } catch (error) {
        console.error('Fatal error during import:', error);
    } finally {
        await prisma.$disconnect();
    }
}

importAssets();

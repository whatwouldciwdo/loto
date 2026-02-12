import ExcelJS from 'exceljs'
import path from 'path'

async function readExcelHeaders() {
    const filePath = path.join(process.cwd(), 'list Asset 2026.xlsx')
    const workbook = new ExcelJS.Workbook()

    try {
        await workbook.xlsx.readFile(filePath)
        const worksheet = workbook.getWorksheet(1)

        if (!worksheet) {
            console.log('No worksheet found')
            return
        }

        console.log('📊 Excel File Analysis\n')
        console.log(`Sheet Name: ${worksheet.name}`)
        console.log(`Total Rows: ${worksheet.rowCount}`)
        console.log(`Total Columns: ${worksheet.columnCount}\n`)

        // Read ALL headers
        const headerRow = worksheet.getRow(1)
        console.log('📋 ALL Column Headers:')
        for (let colNum = 1; colNum <= worksheet.columnCount; colNum++) {
            const cell = headerRow.getCell(colNum)
            console.log(`   Column ${colNum}: "${cell.value}"`)
        }

        // Read first 3 data rows
        console.log('\n📝 First 3 Data Rows:\n')
        for (let rowNum = 2; rowNum <= Math.min(4, worksheet.rowCount); rowNum++) {
            const row = worksheet.getRow(rowNum)
            console.log(`Row ${rowNum}:`)
            for (let colNum = 1; colNum <= Math.min(12, worksheet.columnCount); colNum++) {
                const cell = row.getCell(colNum)
                const header = headerRow.getCell(colNum).value
                console.log(`   Col ${colNum} (${header}): "${cell.value}"`)
            }
            console.log('')
        }
    } catch (error) {
        console.error('Error reading Excel:', error)
    }
}

readExcelHeaders()

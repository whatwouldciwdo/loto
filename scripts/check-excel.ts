import ExcelJS from 'exceljs'
import path from 'path'

async function checkExcel() {
    const filePath = path.join(process.cwd(), 'list Asset 2026.xlsx')
    const workbook = new ExcelJS.Workbook()

    await workbook.xlsx.readFile(filePath)
    const worksheet = workbook.getWorksheet(1)!

    console.log('=== EXCEL STRUCTURE ===\n')
    console.log(`Worksheet: ${worksheet.name}`)
    console.log(`Rows: ${worksheet.rowCount}\n`)

    // Print header row
    console.log('COLUMN HEADERS:')
    const headerRow = worksheet.getRow(1)
    for (let col = 1; col <= 15; col++) {
        const cell = headerRow.getCell(col)
        console.log(`Column ${col}: ${cell.value || 'empty'}`)
    }

    // Print first data row
    console.log('\n\nFIRST DATA ROW (Row 2):')
    const dataRow = worksheet.getRow(2)
    for (let col = 1; col <= 15; col++) {
        const cell = dataRow.getCell(col)
        const value = cell.value
        console.log(`Column ${col}: ${value !== null && value !== undefined ? value : 'empty'}`)
    }
}

checkExcel().catch(console.error)

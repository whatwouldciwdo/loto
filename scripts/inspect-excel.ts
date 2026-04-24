import * as XLSX from 'xlsx';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'list Asset 2026.xlsx');

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Read first 3 rows as JSON to see headers and data types
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, range: 0, defval: null }).slice(0, 3);

    console.log('Sheet Name:', sheetName);
    console.log('Headers (Row 1):', jsonData[0]);
    console.log('Sample Row 1:', jsonData[1]);
    console.log('Sample Row 2:', jsonData[2]);

} catch (error) {
    console.error('Error reading Excel file:', error);
}

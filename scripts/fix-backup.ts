import * as fs from 'fs';
import * as path from 'path';

const backupPath = path.join(process.cwd(), 'backups', 'loto_backup_2026-02-15_15-22-50.sql');
const outputPath = path.join(process.cwd(), 'backups', 'loto_backup_fixed.sql');

// Table mappings
const tableReplacements = {
    '"User"': '"users"',
    '"LotoRequest"': '"loto_requests"',
    '"Asset"': '"assets"',
    '"LotoApproval"': '"loto_approvals"',
    '"LotoHistory"': '"loto_history"',
    '"LotoAttachment"': '"loto_attachments"',
    '"TaggingCard"': '"tagging_cards"',
};

// Column mappings (Snake Case)
const columnReplacements = {
    '"requestNumber"': '"request_number"',
    '"createdById"': '"created_by_id"',
    '"operatorId"': '"operator_id"',
    '"assetId"': '"asset_id"',
    '"formData"': '"form_data"',
    '"createdAt"': '"created_at"',
    '"updatedAt"': '"updated_at"',
    '"completedAt"': '"completed_at"',
    '"passwordHash"': '"password_hash"',
    '"phoneNumber"': '"phone_number"',
    '"isActive"': '"is_active"',
    '"ldapEnabled"': '"ldap_enabled"',
    '"systemOwner"': '"system_owner"',
    '"equipmentName"': '"equipment_name"',
    '"assetNumber"': '"asset_number"',
    '"serialNumber"': '"serial_number"',
    '"kodeAlas"': '"kode_alas"',
    '"equipmentType"': '"equipment_type"',
    '"approverId"': '"approver_id"',
    '"lotoRequestId"': '"loto_request_id"',
    '"uploadedById"': '"uploaded_by_id"',
    '"filePath"': '"file_path"',
    '"fileName"': '"file_name"',
    '"fileType"': '"file_type"',
    '"fileSize"': '"file_size"',
    '"cardNumber"': '"card_number"',
    '"equipmentLocation"': '"equipment_location"',
    '"equipmentInfo"': '"equipment_info"',
    '"printedAt"': '"printed_at"',
    '"attachmentType"': '"attachment_type"',
    '"approverRole"': '"approver_role"',
    '"approvedAt"': '"approved_at"',
    '"actorId"': '"actor_id"',
    '"oldStatus"': '"old_status"',
    '"newStatus"': '"new_status"',
};


try {
    const content = fs.readFileSync(backupPath, 'utf8');
    const lines = content.split(/\r?\n/);
    const fixedLines = [];

    console.log('Processing backup file line by line...');

    for (let line of lines) {
        let processedLine = line;

        // 1. Fix Table Names
        for (const [from, to] of Object.entries(tableReplacements)) {
            if (processedLine.includes(from)) {
                processedLine = processedLine.replace(from, to);

                // 2. Fix "users" table INSERTs (Quoting & Columns)
                if (to === '"users"' && processedLine.trim().startsWith('INSERT INTO "users"')) {

                    // A. Inject Column List if missing
                    // Check if there is NO column list (i.e., VALUES comes immediately after table name)
                    if (processedLine.includes('INSERT INTO "users" VALUES')) {
                        const columnList = '("id", "email", "username", "password_hash", "name", "role", "department", "phone_number", "is_active", "ldap_enabled", "created_at", "updated_at")';
                        processedLine = processedLine.replace('INSERT INTO "users" VALUES', `INSERT INTO "users" ${columnList} VALUES`);
                    }

                    // B. Fix Double Quotes in Values
                    const parts = processedLine.split(' VALUES ');
                    if (parts.length === 2) {
                        let valuesPart = parts[1];
                        // Replace " with ' in values part
                        valuesPart = valuesPart.replace(/"/g, "'");
                        processedLine = `${parts[0]} VALUES ${valuesPart}`;
                    }
                }
            }
        }

        // 3. Fix Column Names (Global replacement for all lines)
        for (const [from, to] of Object.entries(columnReplacements)) {
            // Create regex for global replace to ensure all occurrences in the line are fixed
            // Only replace if it matches the exact quoted identifier
            const regex = new RegExp(from, 'g');
            processedLine = processedLine.replace(regex, to);
        }

        fixedLines.push(processedLine);
    }

    fs.writeFileSync(outputPath, fixedLines.join('\n'));
    console.log(`Fixed backup saved to: ${outputPath}`);

} catch (error) {
    console.error('Error fixing backup:', error);
    process.exit(1);
}

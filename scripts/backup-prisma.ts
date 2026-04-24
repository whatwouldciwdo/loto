import { execSync } from 'child_process'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

/**
 * Backup LOTO Database using Prisma
 * This works without needing pg_dump installed
 */

async function backupDatabase() {
    try {
        console.log('\n============================================')
        console.log('LOTO Database Backup (Prisma)')
        console.log('============================================\n')

        // Create backups directory
        const backupsDir = join(process.cwd(), 'backups')
        if (!existsSync(backupsDir)) {
            mkdirSync(backupsDir, { recursive: true })
        }

        // Generate timestamp
        const now = new Date()
        const timestamp = now.toISOString()
            .replace(/[:.]/g, '-')
            .replace('T', '_')
            .slice(0, -5)

        const backupFile = join(backupsDir, `loto_backup_${timestamp}.sql`)

        console.log(`Backing up to: ${backupFile}\n`)

        // Use pg_dump if available, otherwise use Prisma db pull
        try {
            // Try pg_dump first
            const cmd = `pg_dump "${process.env.DATABASE_URL}" > "${backupFile}"`
            execSync(cmd, { stdio: 'inherit' })

            console.log('\n============================================')
            console.log('✅ Backup completed successfully!')
            console.log(`File: ${backupFile}`)
            console.log('============================================\n')
        } catch (e) {
            console.log('pg_dump not available, using Prisma export...\n')

            // Alternative: Export via Prisma
            const { PrismaClient } = await import('@prisma/client')
            const prisma = new PrismaClient()

            try {
                // Get all data
                const users = await prisma.user.findMany()
                const lotoRequests = await prisma.lotoRequest.findMany()
                const assets = await prisma.asset.findMany()

                // Create SQL backup
                let sql = '-- LOTO Database Backup\n'
                sql += `-- Generated: ${new Date().toISOString()}\n\n`
                sql += 'BEGIN;\n\n'

                // Backup data as INSERT statements
                sql += '-- Users\n'
                users.forEach(user => {
                    sql += `INSERT INTO "User" VALUES (${JSON.stringify(Object.values(user)).slice(1, -1)});\n`
                })

                sql += '\n-- LOTO Requests\n'
                lotoRequests.forEach(req => {
                    sql += `INSERT INTO "LotoRequest" (id, "requestNumber", type, "createdById", "operatorId", status, "formData", "createdAt", "updatedAt") VALUES `
                    sql += `('${req.id}', '${req.requestNumber}', '${req.type}', '${req.createdById}', ${req.operatorId ? `'${req.operatorId}'` : 'NULL'}, '${req.status}', '${JSON.stringify(req.formData).replace(/'/g, "''")}', '${req.createdAt.toISOString()}', '${req.updatedAt.toISOString()}');\n`
                })

                sql += '\nCOMMIT;\n'

                writeFileSync(backupFile, sql, 'utf8')

                console.log('\n============================================')
                console.log('✅ Backup completed successfully (Prisma)!')
                console.log(`File: ${backupFile}`)
                console.log(`Records: ${users.length} users, ${lotoRequests.length} LOTO requests`)
                console.log('============================================\n')
            } finally {
                await prisma.$disconnect()
            }
        }

    } catch (error) {
        console.error('\n============================================')
        console.error('❌ ERROR: Backup failed!')
        console.error(error)
        console.error('============================================\n')
        process.exit(1)
    }
}

backupDatabase()

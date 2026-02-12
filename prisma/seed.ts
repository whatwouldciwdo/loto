import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting database seed...')

    // Clear existing data (careful in production!)
    await prisma.lotoAttachment.deleteMany()
    await prisma.lotoHistory.deleteMany()
    await prisma.lotoApproval.deleteMany()
    await prisma.taggingCard.deleteMany()
    await prisma.lotoRequest.deleteMany()
    await prisma.user.deleteMany()

    console.log('✅ Cleared existing data')

    // Create users with different roles — all password: password123
    const hashedPassword = await bcrypt.hash('password123', 10)

    const users = [
        // ADMIN
        { username: 'admin', name: 'System Administrator', email: 'admin@loto.co.id', role: UserRole.ADMIN, department: 'IT' },
        // OPERATORS
        { username: 'OPS-A', name: 'OPS-GROUP-A', email: 'ops-a@loto.co.id', role: UserRole.OPERATOR, department: 'OPERASI' },
        { username: 'OPS-B', name: 'OPS-GROUP-B', email: 'ops-b@loto.co.id', role: UserRole.OPERATOR, department: 'OPERASI' },
        { username: 'OPS-C', name: 'OPS-GROUP-C', email: 'ops-c@loto.co.id', role: UserRole.OPERATOR, department: 'OPERASI' },
        { username: 'OPS-D', name: 'OPS-GROUP-D', email: 'ops-d@loto.co.id', role: UserRole.OPERATOR, department: 'OPERASI' },
        // PEMELIHARAAN
        { username: 'HAR-PREDICT', name: 'HAR-PREDICT', email: 'har-predict@loto.co.id', role: UserRole.PEMELIHARAAN, department: 'RCBM' },
        { username: 'SARANA', name: 'SARANA', email: 'sarana@loto.co.id', role: UserRole.PEMELIHARAAN, department: 'Umum' },
        { username: 'HAR-BOP', name: 'HAR-BOP', email: 'har-bop@loto.co.id', role: UserRole.PEMELIHARAAN, department: 'Pemeliharaan BOP' },
        { username: 'HAR-ELEC', name: 'HAR-ELEC', email: 'har-elec@loto.co.id', role: UserRole.PEMELIHARAAN, department: 'Pemeliharaan Listrik' },
        { username: 'HAR-INC', name: 'HAR-INC', email: 'har-inc@loto.co.id', role: UserRole.PEMELIHARAAN, department: 'Pemeliharaan Instrument' },
        { username: 'HAR-MECH', name: 'HAR-MECH', email: 'har-mech@loto.co.id', role: UserRole.PEMELIHARAAN, department: 'Pemeliharaan Mekanik' },
    ]

    for (const u of users) {
        await prisma.user.create({
            data: {
                email: u.email,
                username: u.username,
                passwordHash: hashedPassword,
                name: u.name,
                role: u.role,
                department: u.department,
                isActive: true,
            },
        })
    }

    console.log(`✅ Created ${users.length} users`)
    console.log('\n🎉 Seeding completed successfully!')
    console.log('\n📝 All accounts password: password123')
    console.log('   Usernames:', users.map(u => u.username).join(', '))
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

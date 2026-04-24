
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateAdminPhone() {
    try {
        const user = await prisma.user.update({
            where: { username: 'admin' },
            data: { phoneNumber: '6287814111808' }
        })
        console.log('Updated Admin:', user)
    } catch (error) {
        console.error('Error updating admin:', error)
    } finally {
        await prisma.$disconnect()
    }
}

updateAdminPhone()


import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkPhoneNumbers() {
    try {
        const users = await prisma.user.findMany({
            select: {
                username: true,
                phoneNumber: true,
                role: true
            }
        })
        console.log('User Phone Numbers:', JSON.stringify(users, null, 2))
    } catch (error) {
        console.error('Error fetching users:', error)
    } finally {
        await prisma.$disconnect()
    }
}

checkPhoneNumbers()

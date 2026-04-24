import { PrismaClient } from '@prisma/client'

/**
 * Clean up test LOTO requests before production deployment
 * This removes test data created during WhatsApp notification testing
 */

const prisma = new PrismaClient()

async function cleanupTestData() {
    try {
        console.log('\n============================================')
        console.log('Cleaning Up Test LOTO Requests')
        console.log('============================================\n')

        // Count before cleanup
        const beforeCount = await prisma.lotoRequest.count()
        const allRequests = await prisma.lotoRequest.findMany({
            select: {
                id: true,
                requestNumber: true,
                formData: true,
                status: true,
                createdAt: true,
            }
        })

        console.log(`Total LOTO requests before cleanup: ${beforeCount}`)

        // Filter test requests by checking formData JSON
        const testRequests = allRequests.filter(req => {
            const formData = req.formData as any
            const description = formData?.description || ''
            const workorderNumber = formData?.workorderNumber || ''

            return (
                description.toLowerCase().includes('test') ||
                description.toLowerCase().includes('whatsapp') ||
                description.toLowerCase().includes('notifikasi') ||
                workorderNumber.toLowerCase().includes('test')
            )
        })

        console.log(`\nFound ${testRequests.length} test requests:\n`)
        testRequests.forEach(req => {
            const formData = req.formData as any
            console.log(`  - ${req.requestNumber} | ${formData?.workorderNumber || 'N/A'} | ${(formData?.description || '').substring(0, 50)}`)
        })

        if (testRequests.length === 0) {
            console.log('\n✅ No test requests found. Database is clean!')
            console.log('\n============================================\n')
            return
        }

        // Ask for confirmation
        console.log(`\n⚠️  About to delete ${testRequests.length} test requests.`)
        console.log('Press Ctrl+C to cancel, or wait 5 seconds to proceed...\n')

        await new Promise(resolve => setTimeout(resolve, 5000))

        // Delete test requests by ID
        const testIds = testRequests.map(r => r.id)
        const deleteResult = await prisma.lotoRequest.deleteMany({
            where: {
                id: {
                    in: testIds
                }
            }
        })

        console.log(`✅ Deleted ${deleteResult.count} test requests`)

        // Count after cleanup
        const afterCount = await prisma.lotoRequest.count()
        console.log(`\nTotal LOTO requests after cleanup: ${afterCount}`)

        console.log('\n============================================')
        console.log('✅ Cleanup completed successfully!')
        console.log('============================================\n')

    } catch (error) {
        console.error('\n============================================')
        console.error('❌ ERROR: Cleanup failed!')
        console.error(error)
        console.error('============================================\n')
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

cleanupTestData()

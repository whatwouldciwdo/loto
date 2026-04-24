import { NextRequest, NextResponse } from 'next/server'

/**
 * Test WhatsApp Notification Endpoint
 * GET /api/test-whatsapp
 */
export async function GET(request: NextRequest) {
    try {
        console.log('\n=== TESTING WHATSAPP NOTIFICATION ===\n')

        const { WhatsappService } = await import('@/lib/services/whatsapp.service')
        const { getPhoneNumber } = await import('@/lib/whatsapp-config')

        // Test phone number lookup
        const testResults: any = {
            timestamp: new Date().toISOString(),
            config: {
                apiUrl: process.env.WHATSAPP_API_URL || 'NOT SET',
                apiKeySet: !!process.env.WHATSAPP_API_KEY,
            },
            phoneLookup: {
                'K3': getPhoneNumber('K3'),
                'RENDAL HAR': getPhoneNumber('RENDAL HAR'),
                'KIMIA': getPhoneNumber('KIMIA'),
            },
            sendTest: null as any
        }

        console.log('Config:', testResults.config)
        console.log('Phone Lookup:', testResults.phoneLookup)

        // Send test message to K3
        console.log('\nSending test message to K3...')

        const testMessage = `*TEST WHATSAPP DARI LOTO APP*

Pesan test dikirim pada: ${new Date().toLocaleString('id-ID')}

Jika Anda menerima pesan ini, konfigurasi WhatsApp sudah benar! ✅`

        try {
            const result = await WhatsappService.send('6287814111808', testMessage)
            testResults.sendTest = {
                success: true,
                result: result,
                message: 'Message sent successfully'
            }
            console.log('✅ Send result:', result)
        } catch (err: any) {
            testResults.sendTest = {
                success: false,
                error: err.message,
                stack: err.stack
            }
            console.error('❌ Send error:', err)
        }

        console.log('\n=== TEST COMPLETE ===\n')

        return NextResponse.json(testResults, { status: 200 })

    } catch (error: any) {
        console.error('Test endpoint error:', error)
        return NextResponse.json({
            error: error.message,
            stack: error.stack
        }, { status: 500 })
    }
}

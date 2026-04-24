/**
 * Test WhatsApp Notification
 * Run: node test-whatsapp.js
 */

// Load environment variables
require('dotenv').config()

async function testWhatsApp() {
    console.log('=== Testing WhatsApp Notification ===\n')

    // Load WhatsApp config
    const { getPhoneNumber } = require('./lib/whatsapp-config')

    // Test phone number lookup
    console.log('1. Testing phone number lookup:')
    const testSeksi = ['K3', 'RENDAL HAR', 'KIMIA', 'SIPIL', 'HAR-MECH (JUWAN OKTAVIANSA)']
    testSeksi.forEach(seksi => {
        const phone = getPhoneNumber(seksi)
        console.log(`   ${seksi}: ${phone || '❌ NOT FOUND'}`)
    })

    // Test API configuration
    console.log('\n2. Testing API Configuration:')
    console.log('   API_URL:', process.env.WHATSAPP_API_URL || '❌ NOT SET')
    console.log('   API_KEY:', process.env.WHATSAPP_API_KEY ? '✅ SET' : '❌ NOT SET')

    // Test actual send
    console.log('\n3. Testing actual send to K3 (6287814111808):')

    try {
        const https = require('https')
        const agent = new https.Agent({
            rejectUnauthorized: false
        })

        const testMessage = `*TEST WHATSAPP NOTIFICATION*

Ini adalah pesan test dari LOTO Application.
Waktu: ${new Date().toLocaleString('id-ID')}

Jika Anda menerima pesan ini, berarti konfigurasi WhatsApp sudah benar! ✅`

        console.log('\n   Sending message...')
        console.log('   To: 6287814111808')
        console.log('   Message:', testMessage.substring(0, 50) + '...')

        const response = await fetch(`${process.env.WHATSAPP_API_URL}/chat/send/text`, {
            method: 'POST',
            headers: {
                'Token': process.env.WHATSAPP_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                Phone: '6287814111808',
                Body: testMessage,
            }),
            agent: agent
        })

        const result = await response.json()

        console.log('\n   ✅ Response:', JSON.stringify(result, null, 2))

        if (result.success || result.code === 200) {
            console.log('\n   🎉 SUCCESS! Check WhatsApp at +6287814111808')
        } else {
            console.log('\n   ❌ FAILED! Response:', result)
        }

    } catch (error) {
        console.error('\n   ❌ ERROR:', error.message)
        if (error.cause) {
            console.error('   Root cause:', error.cause)
        }
    }

    console.log('\n=== Test Complete ===')
}

testWhatsApp().catch(console.error)

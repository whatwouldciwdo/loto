import * as fs from 'fs'
import * as path from 'path'

// Load .env manually if not in next environment
const envPath = path.resolve(__dirname, '../.env')
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    envContent.split('\n').forEach(line => {
        const trimmed = line.trim()
        if (trimmed && !trimmed.startsWith('#')) {
            const idx = trimmed.indexOf('=')
            if (idx !== -1) {
                const key = trimmed.substring(0, idx).trim()
                const value = trimmed.substring(idx + 1).trim().replace(/^["'](.*)["']$/, '$1')
                process.env[key] = value
            }
        }
    })
}

import { WhatsappService } from '../lib/services/whatsapp.service'

const targetPhone = process.env.WHATSAPP_TEST_PHONE || '6287814111808'

async function main() {
    console.log(`🚀 Mengirim pesan uji coba WhatsApp ke: ${targetPhone}`)
    console.log(`📡 WAHA URL: ${process.env.WHATSAPP_API_URL}`)
    console.log(`🔑 WAHA API KEY: ${process.env.WHATSAPP_API_KEY ? '******' : '(none)'}`)
    console.log(`📱 Session: ${process.env.WHATSAPP_SESSION}`)

    const testMessage = `*TEST NOTIFIKASI SISTEM LOTO* 🔔\n\nHalo, ini adalah pesan uji coba dari sistem LOTO Management ke WAHA Standalone.\n\nWaktu: ${new Date().toLocaleString('id-ID')}\nStatus: Berhasil terhubung!`

    try {
        const response = await WhatsappService.send(targetPhone, testMessage)
        console.log('✅ Response dari WAHA:', JSON.stringify(response, null, 2))
        console.log('\n🎉 Pesan berhasil dikirim!')
    } catch (err: any) {
        console.error('❌ Gagal mengirim pesan:', err.message || err)
    }
}

main()

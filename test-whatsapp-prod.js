/**
 * Script Uji Coba Pengiriman WhatsApp di Production (Ubuntu)
 * 
 * Cara menjalankan di server Ubuntu:
 *   docker exec -it loto_app node test-whatsapp-prod.js
 * atau jika ada node di server:
 *   node test-whatsapp-prod.js
 */

const fs = require('fs');
const path = require('path');

// 1. Baca konfigurasi dari .env
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const idx = trimmed.indexOf('=');
            if (idx !== -1) {
                const key = trimmed.substring(0, idx).trim();
                const value = trimmed.substring(idx + 1).trim().replace(/^["'](.*)["']$/, '$1');
                if (!process.env[key]) {
                    process.env[key] = value;
                }
            }
        }
    });
}

const WAHA_API_URL = (process.env.WHATSAPP_API_URL || 'http://10.8.140.67:3010').replace(/\/+$/, '');
const WAHA_API_KEY = process.env.WHATSAPP_API_KEY || '';
const WAHA_SESSION = process.env.WHATSAPP_SESSION || 'LOTO';

// Target pengujian
const TARGET_NUMBERS = [
    '6285606169066',
    '6287814111808',
];

function normalizePhone(phone) {
    let digits = phone.replace(/[^0-9]/g, '');
    if (digits.startsWith('0')) {
        digits = '62' + digits.substring(1);
    } else if (digits.startsWith('68') && !digits.startsWith('682') && !digits.startsWith('628')) {
        digits = '628' + digits.substring(2);
    }
    return digits;
}

async function sendWhatsApp(target) {
    const cleanPhone = normalizePhone(target);
    const chatId = `${cleanPhone}@c.us`;
    const endpoint = `${WAHA_API_URL}/api/sendText`;

    const now = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    const message = `*TEST NOTIFIKASI PRODUCTION LOTO* 🔔\n\nHalo, ini adalah pesan uji coba dari Server Production Ubuntu.\n\n📱 Target: ${cleanPhone}\n⏰ Waktu: ${now} WIB\n✅ Status: Koneksi WAHA Standalone Berhasil!`;

    const payload = {
        session: WAHA_SESSION,
        chatId: chatId,
        text: message,
    };

    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };
    if (WAHA_API_KEY) {
        headers['X-Api-Key'] = WAHA_API_KEY;
    }

    console.log(`\n⏳ Mengirim pesan ke ${cleanPhone}...`);

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (response.ok) {
            console.log(`✅ [BERHASIL] Pesan terkirim ke ${cleanPhone}!`);
            console.log(`   Message ID: ${result.id?._serialized || result.id?.id || result.id || 'OK'}`);
        } else {
            console.error(`❌ [GAGAL] WAHA Error (${response.status}):`, JSON.stringify(result, null, 2));
        }
    } catch (error) {
        console.error(`❌ [ERROR KONEKSI] Gagal terhubung ke ${endpoint}:`, error.message);
    }
}

async function main() {
    console.log('====================================================');
    console.log('🧪 PENGUJIAN NOTIFIKASI WHATSAPP DI PRODUCTION');
    console.log('====================================================');
    console.log(`📡 WAHA Server : ${WAHA_API_URL}`);
    console.log(`🔑 WAHA API Key: ${WAHA_API_KEY ? '******' : '(Tanpa API Key)'}`);
    console.log(`📱 WAHA Session: ${WAHA_SESSION}`);
    console.log(`🎯 Total Target: ${TARGET_NUMBERS.length} nomor`);
    console.log('====================================================');

    for (const phone of TARGET_NUMBERS) {
        await sendWhatsApp(phone);
    }

    console.log('\n====================================================');
    console.log('🏁 Pengujian selesai!');
    console.log('====================================================');
}

main();

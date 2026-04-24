# Troubleshooting WhatsApp Notification

## 🔍 Checklist Debugging:

### 1. ✅ Verify Wuzapi Connection
Buka: https://wuzapi-tcc0@m&0my12.sgp.wisanggeni.sumopod.my.id

**Pastikan:**
- Instance "LOTO_WHATSAPP" ada
- Status: **Connected** (hijau)
- Jika belum connected → Scan QR code dengan WhatsApp Anda

---

### 2. ✅ Check Environment Variables
File: `.env`

Pastikan ada:
```env
WHATSAPP_API_URL=https://wuzapi-tcc0@m&0my12.sgp.wisanggeni.sumopod.my.id
WHATSAPP_API_KEY=Jp0hfP9l2RwRzMSVY1I1f7wIr7?3b4m0
```

---

### 3. ✅ Restart Aplikasi
```bash
# Stop running app (Ctrl+C)
npm run start
```

---

### 4. 🧪 Test Notifikasi

#### Buat LOTO Request Baru:
1. Buka: http://localhost:3000/loto/request
2. Isi form:
   - **Work Order**: TEST-001
   - **Description**: Test WhatsApp Notification
   - **Work Type**: Proactive Maintenance
   - **Seksi Tujuan**: **RENDAL HAR** (atau KIMIA, K3, SIPIL)
3. **Submit**

#### Check Console Log:
Setelah submit, lihat terminal. Harusnya muncul:
```
[LOTO API] Preparing WhatsApp notification...
[LOTO API] Request Number: LOTO-20260215-XXXX
[LOTO API] Seksi: RENDAL HAR
[LOTO API] Description: Test WhatsApp Notification
[LOTO API] Calling WhatsappService.notifyNewRequest...
[WhatsappService] notifyNewRequest called
[WhatsappService] Seksi Tujuan: RENDAL HAR
[WhatsappService] Phone number found: 6285606169066
[WhatsappService] Sending message to: 6285606169066
WhatsappService Result: { ... }
[LOTO API] WhatsApp notification sent successfully
```

#### Check WhatsApp:
- Nomor **+6285606169066** atau **+6287814111808**
- Harusnya terima pesan dari bot

---

### 5. ❌ Troubleshooting Jika Gagal

#### Jika Log: "No phone number found"
```
[WhatsappService] ❌ No phone number found for seksi: XXX
```
**Solusi:** Nama Seksi tidak match dengan `lib/whatsapp-config.ts`
- Pastikan pilih salah satu: RENDAL HAR, KIMIA, K3, SIPIL, HAR MEKANIK, dll.

#### Jika Error: "WHATSAPP_API_KEY not configured"
```
WhatsappService: WHATSAPP_API_KEY not configured
```
**Solusi:** 
1. Check `.env` file
2. Restart app

#### Jika Error dari Wuzapi API
```
WhatsappService Result: { error: "..." }
```
**Solusi:**
1. Check Wuzapi dashboard - pastikan connected
2. Verify Token/API Key benar
3. Test manual dengan curl:
```bash
curl -X POST https://wuzapi-tcc0@m&0my12.sgp.wisanggeni.sumopod.my.id/chat/send/text \
  -H "Token: Jp0hfP9l2RwRzMSVY1I1f7wIr7?3b4m0" \
  -H "Content-Type: application/json" \
  -d '{
    "Phone": "6285606169066",
    "Body": "Test message from LOTO app"
  }'
```

---

### 6. 📋 Manual Test via API

Jika masih gagal, test langsung ke API:
```bash
# Test di browser console atau Postman
fetch('http://localhost:3000/api/loto', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'TAGGING',
    formData: {
      workorderNumber: 'TEST-001',
      description: 'Test notif',
      workType: 'Proactive Maintenance',
      seksi: 'RENDAL HAR'
    }
  })
})
```

---

## 📝 Expected Console Output

Jika semua berjalan normal:
```
[LOTO API] Preparing WhatsApp notification...
[LOTO API] Request Number: LOTO-20260215-1234
[LOTO API] Seksi: RENDAL HAR
[LOTO API] Description: Test notif
[LOTO API] Calling WhatsappService.notifyNewRequest...
[WhatsappService] notifyNewRequest called
[WhatsappService] Seksi Tujuan: RENDAL HAR
[WhatsappService] Phone number found: 6285606169066
[WhatsappService] Sending message to: 6285606169066
[WhatsappService] Message: *NEW LOTO REQUEST*...
WhatsappService Result: { code: 200, success: true, ... }
[LOTO API] WhatsApp notification sent successfully
```

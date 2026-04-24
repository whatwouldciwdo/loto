# Panduan Konfigurasi Wuzapi

## Langkah-langkah Setup:

### 1. Update file `.env` Anda

Tambahkan atau update baris berikut:

```env
WHATSAPP_API_URL=https://wuzapi-tcc0@m&0my12.sgp.wisanggeni.sumopod.my.id
WHATSAPP_API_KEY=Jp0hfP9l2RwRzMSVY1I1f7wIr7?3b4m0
```

### 2. Connect WhatsApp ke Wuzapi

1. Buka Admin Console Wuzapi: https://wuzapi-tcc0@m&0my12.sgp.wisanggeni.sumopod.my.id
2. Login dengan username: `Jp0hfP9l2RwRzMSVY1I1f7wIr7?3b4m0`
3. Scan QR code dengan WhatsApp Anda

### 3. Update Nomor Telepon di `lib/whatsapp-config.ts`

**Format nomor:** Gunakan format internasional **tanpa tanda +**

Contoh:
- ✅ Benar: `628123456789` (Indonesia)
- ❌ Salah: `+628123456789` atau `08123456789`

File `lib/whatsapp-config.ts`:
```typescript
export const PHONE_MAP: Record<string, string> = {
    // Seksi
    'HAR': '628123456789',          // Ganti dengan nomor real
    'Operasi': '628234567890',       // Ganti dengan nomor real
    'Pemeliharaan': '628345678901',  // Ganti dengan nomor real
    
    // Eksekutor
    'Team Leader A': '628456789012', // Ganti dengan nomor real
    'Team Leader B': '628567890123', // Ganti dengan nomor real
}
```

### 4. Restart Aplikasi

```bash
npm run dev
# atau
npm run start
```

## Testing

Untuk test notifikasi:
1. Buat LOTO request baru
2. Check log console untuk `WhatsappService Result`
3. Verify pesan masuk ke WhatsApp target

## Troubleshooting

### Pesan tidak terkirim?
1. Pastikan WhatsApp sudah connected (check Admin Console)
2. Verify format nomor telepon (tanpa +, dengan kode negara)
3. Check console log untuk error messages

### Token tidak valid?
1. Verify `WHATSAPP_API_KEY` sama dengan Username di dashboard
2. Restart aplikasi setelah update .env

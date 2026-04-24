# Test WhatsApp Notification

## Nomor yang Sudah Dikonfigurasi:

### ✅ Nomor Real (dari tabel):
- **OPS A**: 628571050693 (IHWANSYAH WIBOWO)
- **OPS B**: 628777170810 (UNTUNG RIYADI)
- **OPS C**: 628787158107 (SULISTIYONO)
- **OPS D**: 628778851642 (YAYAN SURYANA)
- **HAR-MECH**: 628138071262 (JUWAN OKTAVIANSA)
- **HAR-I&C**: 628133158293 (YUDI NUGRAHA)
- **HAR-ELEC**: 628121236371 (GUNAWAN)
- **HAR-BOP**: 628212417556 (RIZKY ALIF)
- **SARANA**: 628531805050 (IRVAN SANDI)
- **HAR-PREDIKTIF**: 628126015716 (PEBRIANTO GINTING)

### 🧪 Nomor Testing:
- **Test 1**: 6285606169066 → Digunakan untuk: RENDAL HAR, KIMIA, LINGKUNGAN, KEAMANAN
- **Test 2**: 6287814111808 → Digunakan untuk: HAR ASH HANDLING, K3, SIPIL

---

## Cara Test Notifikasi:

### 1️⃣ Test Notifikasi "New Request"
1. Buka aplikasi LOTO
2. Buat **LOTO Request** baru
3. Pilih **Seksi Tujuan** = salah satu dari:
   - **RENDAL HAR** → akan kirim ke `+6285606169066` ✅
   - **KIMIA** → akan kirim ke `+6285606169066` ✅
   - **K3** → akan kirim ke `+6287814111808` ✅
4. Submit form
5. **Check WhatsApp** di 2 nomor testing

### 2️⃣ Test Notifikasi "Execution"
1. Pilih LOTO request yang sudah dibuat
2. Isi **Operator Form** (CAT.03)
3. Submit
4. **Check WhatsApp**:
   - Nomor creator (jika sudah ada di User profile)
   - Nomor eksekutor
   - Nomor Seksi HAR

### 3️⃣ Test Notifikasi "Release"
1. Pilih LOTO request yang sudah executed
2. Isi **Release Form** (CAT.06)
3. Submit
4. **Check WhatsApp**:
   - Nomor creator
   - Nomor eksekutor release
   - Nomor Seksi HAR

---

## ✅ Checklist Setup:
- ✅ Wuzapi instance created
- ✅ Token configured in `.env`
- ✅ Phone numbers updated in `lib/whatsapp-config.ts`
- ✅ App restarted
- ⏳ **WhatsApp connected?** → Scan QR code di Admin Console
- ⏳ **Test notification?** → Buat request LOTO baru

---

## Troubleshooting:

**Pesan tidak terkirim?**
1. Pastikan WhatsApp sudah **connected** di Wuzapi Admin Console
2. Check console log: `WhatsappService Result`
3. Verify nomor format (tanpa +, dengan 62)

**Token Error?**
- Restart aplikasi: `npm run start`

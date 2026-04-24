# Fix DNS Resolution untuk Wuzapi

## 🎯 Problem:
Node.js tidak bisa resolve hostname `wuzapi-tceo8mb6myiz.sgp-wisanggeni.sumopod.my.id`

## ✅ Solusi: Edit Hosts File

### Step 1: Buka Notepad sebagai Administrator
1. Search "Notepad" di Start Menu
2. Klik kanan → **Run as Administrator**

### Step 2: Open Hosts File
1. File → Open
2. Navigate ke: `C:\Windows\System32\drivers\etc\`
3. Ganti filter dari "Text Documents (*.txt)" → **All Files (*.*)**
4. Pilih file: `hosts`
5. Klik Open

### Step 3: Tambahkan Baris Ini di Akhir File
```
104.26.9.152    wuzapi-tceo8mb6myiz.sgp-wisanggeni.sumopod.my.id
```

### Step 4: Save File
- File → Save
- Close Notepad

### Step 5: Test
Buka PowerShell dan test:
```powershell
ping wuzapi-tceo8mb6myiz.sgp-wisanggeni.sumopod.my.id
```

**Expected:** Reply from `104.26.9.152`

### Step 6: Restart App dan Test WhatsApp
```bash
# Stop app (Ctrl+C)
npm run dev
```

Lalu test: http://localhost:3000/api/test-whatsapp

---

## 🔄 Alternative IPs (jika yang pertama tidak work):

Jika `104.26.9.152` tidak work, coba ganti di hosts file dengan:
- `104.26.8.152` atau
- `172.67.71.153`

---

## ⚠️ Catatan:
Wuzapi Anda di-host di Cloudflare. IP addresses dari nslookup:
- 104.26.9.152
- 104.26.8.152  
- 172.67.71.153

Semuanya adalah Cloudflare edge servers.

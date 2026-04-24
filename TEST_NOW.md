# Quick Test - WhatsApp Notification

## ✅ URL SEKARANG BENAR!

```
https://wuzapi-tceo8mb6myiz.sgp-wisanggeni.sumopod.my.id
```

---

## 🧪 **Test Sekarang:**

### **Opsi 1: Test Endpoint**
Buka: http://localhost:3000/api/test-whatsapp

### **Opsi 2: Buat LOTO Request**
1. http://localhost:3000/loto/request
2. Seksi: **K3** atau **RENDAL HAR**
3. Submit

---

## ✅ **Expected Result:**

**Terminal Log:**
```
[WhatsappService] Sending message to: 6287814111808
WhatsappService Result: {
  "code": 200,
  "data": {
    "Details": "Sent",
    ...
  },
  "success": true
}
```

**WhatsApp:** Nomor +6287814111808 akan terima pesan! 📱

---

## 🔍 **Jika Masih Empty Response:**

Kemungkinan server perlu auth berbeda atau endpoint berbeda. Coba:

```bash
# Test manual
curl -X POST https://wuzapi-tceo8mb6myiz.sgp-wisanggeni.sumopod.my.id/chat/send/text \
  -H "Token: Jp0hfP9l2RwRzMSVY1I1f7wIr7?3b4m0" \
  -H "Content-Type: application/json" \
  -d "{\"Phone\":\"6287814111808\",\"Body\":\"Test\"}" \
  -k
```

Kasih tau hasil testnya! 🚀

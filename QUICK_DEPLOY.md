# Quick Deployment Guide

## 🚀 **3-Step Deployment Process**

### **Step 1: Backup Database** ✅
```bash
cd c:\Users\dz\Documents\Loto\scripts
backup-database.bat
```

**What it does:**
- Creates timestamped backup in `backups/` folder
- Format: `loto_backup_YYYYMMDD_HHMMSS.sql`
- Also creates `.plain.sql` version for viewing

**Verify:** Check `backups/` folder has new files

---

### **Step 2: Clean Test Data** 🧹

**Option A: Via psql (Recommended)**
```bash
# Open database
psql -h localhost -p 5432 -U loto_user -d loto_db

# Run cleanup
\i scripts/cleanup-test-data.sql

# Review changes, then:
COMMIT;  -- or ROLLBACK; if not satisfied
```

**Option

 B: Manual via SQL**
```sql
-- Delete test WhatsApp requests
DELETE FROM "LotoRequest"
WHERE 
    description ILIKE '%TEST%WHATSAPP%'
    OR description ILIKE '%NOTIFIKASI%WHATSAPP%'
    OR workorderNumber ILIKE '%TEST%';
```

---

### **Step 3: Verify Clean State** ✅

**Check remaining requests:**
```sql
SELECT 
    "requestNumber",
    "workorderNumber",
    description,
    status,
    "createdAt"
FROM "LotoRequest"
ORDER BY "createdAt" DESC
LIMIT 20;
```

**Expected:** No TEST/WHATSAPP requests remain

---

## 📦 **Deploy to Server**

### **Files to Copy:**
1. `.next/` folder (production build)
2. `package.json` and `package-lock.json`
3. `.env` (update with production settings!)
4. `node_modules/` OR run `npm install` on server
5. `public/` folder
6. `prisma/` folder

### **On Server:**
```bash
# Install dependencies
npm install --production

# Run migrations (if any)
npx prisma migrate deploy

# Start with PM2
pm2 start npm --name "loto-app" -- start
```

### **Don't Forget:**
1. ✅ Update `.env` with production database password
2. ✅ Add hosts file entry for Wuzapi
3. ✅ Update phone numbers in `lib/whatsapp-config.ts`
4. ✅ Test WhatsApp notification after deployment

---

## 🔄 **Rollback (if needed)**

```bash
cd c:\Users\dz\Documents\Loto\scripts
restore-database.bat backups\loto_backup_20260215_220000.sql
```

---

## 📋 **Production Checklist**

- [ ] Database backed up
- [ ] Test data cleaned
- [ ] Production `.env` configured
- [ ] Phone numbers updated
- [ ] Build successful (`npm run build`)
- [ ] Hosts file updated on server
- [ ] Deployed to server
- [ ] PM2 running
- [ ] Test notification sent
- [ ] Login working
- [ ] Excel export working

**Full Guide:** `DEPLOYMENT.md`

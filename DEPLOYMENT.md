# Production Deployment Guide

## 📋 Pre-Deployment Checklist

### 1. Backup Database ✅

**Run backup script:**
```bash
cd scripts
backup-database.bat
```

**Verify backup:**
- Check `backups/` folder for new backup file
- Backup format: `loto_backup_YYYYMMDD_HHMMSS.sql`
- Plain SQL version also created for reference

---

### 2. Clean Up Test Data ✅

**Review test requests:**
```bash
# Connect to database
psql -h localhost -p 5432 -U loto_user -d loto_db
```

**Run cleanup script:**
```sql
\i scripts/cleanup-test-data.sql
```

**Important:**
- Script is in TRANSACTION mode
- Review changes before committing
- Default is `ROLLBACK` for safety
- Change to `COMMIT` after verification

**Test patterns to remove:**
- Description: `*TEST*WHATSAPP*`
- Description: `*NOTIFIKASI*WHATSAPP*`
- Work Order: `*TEST*`

---

### 3. Update Configuration for Production

**`.env` file changes:**
```env
# Update database credentials if different on server
DATABASE_URL=postgresql://loto_user:PRODUCTION_PASSWORD@SERVER_IP:5432/loto_db

# Update Redis if on different server
REDIS_URL=redis://:PRODUCTION_PASSWORD@SERVER_IP:6379

# Change JWT secret
JWT_SECRET=generate_new_secret_at_least_32_characters_for_production

# Set production mode
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://SERVER_IP:3000
```

**Update phone numbers:**
- Edit `lib/whatsapp-config.ts`
- Replace test numbers with actual team numbers
- Verify all Seksi mappings are correct

**Hosts file on server:**
- Add Wuzapi DNS entry on production server
- File: `/etc/hosts` (Linux) or `C:\Windows\System32\drivers\etc\hosts` (Windows)
- Entry: `104.26.9.152    wuzapi-tceo8mb6myiz.sgp-wisanggeni.sumopod.my.id`

---

### 4. Build Production Bundle

```bash
# Build optimized production bundle
npm run build

# Test production build locally
npm run start
```

**Verify:**
- No build errors
- All routes accessible
- WhatsApp notifications working
- Excel export working

---

### 5. Deploy to Server

**Option A: Using Git**
```bash
# On server
git pull origin main
npm install
npm run build
pm2 restart loto-app
```

**Option B: Manual Copy**
```bash
# Copy files to server
scp -r .next package.json server:/path/to/loto/
scp .env server:/path/to/loto/

# On server
cd /path/to/loto
npm install --production
pm2 start npm --name "loto-app" -- start
```

---

### 6. Database Migration (if needed)

**On production server:**
```bash
# Run Prisma migrations
npx prisma migrate deploy

# Verify
npx prisma db push
```

---

### 7. Post-Deployment Verification

**Test checklist:**
- [ ] Login works
- [ ] Create LOTO request
- [ ] WhatsApp notification received
- [ ] Operator form submission
- [ ] LOTO release
- [ ] Excel export
- [ ] User management
- [ ] Search functionality

---

## 🔄 Rollback Procedure

**If deployment fails:**

### 1. Restore Database
```bash
cd scripts
restore-database.bat backups\loto_backup_YYYYMMDD_HHMMSS.sql
```

### 2. Revert Code
```bash
# If using Git
git checkout HEAD~1
npm install
npm run build
pm2 restart loto-app
```

---

## 📝 Backup Schedule

**Recommended:**
- **Daily:** Automated backup at midnight
- **Before deployment:** Manual backup
- **Weekly:** Full backup with retention
- **Keep:** Last 7 daily, last 4 weekly, last 6 monthly

**Windows Scheduled Task:**
```bash
schtasks /create /tn "LOTO Daily Backup" /tr "C:\Users\dz\Documents\Loto\scripts\backup-database.bat" /sc daily /st 00:00
```

---

## 🔍 Monitoring

**After deployment, monitor:**
1. Application logs for errors
2. Wuzapi dashboard for message delivery
3. Database performance
4. User feedback

**Log locations:**
- PM2 logs: `~/.pm2/logs/`
- Application: Check console/stdout
- Nginx/Apache: Web server logs

---

## ⚠️ Important Notes

### Database Password
- Update in `.env` file
- Update in backup/restore scripts
- Never commit to Git

### WhatsApp
- Verify Wuzapi connection on server
- Test notification to actual numbers
- Monitor delivery rate

### Performance
- Use production build (`npm run build`)
- Enable gzip compression on web server
- Configure proper PM2 settings

### Security
- Change default passwords
- Enable HTTPS on production
- Configure firewall rules
- Regular security updates

# Panduan Deploy LOTO di Ubuntu Server (Docker)

Panduan ini untuk menjalankan aplikasi LOTO di server Ubuntu dengan alur:
**push ke GitHub → pull di server → jalankan via Docker**.

Arsitektur:
- **Aplikasi (Next.js)** → jalan di container Docker pada server Ubuntu ini.
- **PostgreSQL** → server terpisah `10.8.140.69:5432` (database `loto_db`, sudah dimigrasi).
- **WAHA (WhatsApp)** → server terpisah `http://10.8.140.67:8310`.

Container hanya membangun & menjalankan aplikasi web. Database dan WAHA
diakses sebagai layanan eksternal lewat `.env`.

---

## 0. Prasyarat di server Ubuntu

Cek Docker & plugin compose sudah terpasang:

```bash
docker --version
docker compose version
git --version
```

Jika belum ada Docker, pasang (Ubuntu):

```bash
# Docker Engine + Compose plugin (repo resmi Docker)
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# (opsional) jalankan docker tanpa sudo
sudo usermod -aG docker $USER
# logout & login lagi agar grup aktif
```

---

## 1. Clone repository (pertama kali)

```bash
cd ~
git clone https://github.com/whatwouldciwdo/loto.git
cd loto
```

Untuk update berikutnya (pull):

```bash
cd ~/loto
git pull origin main
```

---

## 2. Buat file `.env` di server

File `.env` **tidak** ikut di repo (di-gitignore) karena berisi rahasia.
Buat manual di server, di dalam folder `loto`:

```bash
cd ~/loto
cp .env.example .env
nano .env
```

Isi nilai berikut (sesuaikan dengan kredensial asli):

```env
# Database — server PostgreSQL eksternal
DATABASE_URL=postgresql://postgres:Cilego2026.@10.8.140.69:5432/loto_db

# JWT — WAJIB diganti dengan string acak minimal 32 karakter
JWT_SECRET=ganti_dengan_random_string_minimal_32_karakter

NODE_ENV=production
# URL publik aplikasi (alamat server yang diakses browser)
NEXT_PUBLIC_API_URL=http://<IP_SERVER_UBUNTU>:3000

# WhatsApp (WAHA)
WHATSAPP_API_URL=http://10.8.140.67:8310
WHATSAPP_API_KEY=
WHATSAPP_SESSION=default

# Opsional untuk skrip tes
WHATSAPP_TEST_PHONE=6287814111808
```

Tips membuat JWT_SECRET acak:

```bash
openssl rand -base64 48
```

> Ganti `<IP_SERVER_UBUNTU>` dengan IP server ini (mis. `http://10.8.140.xx:3000`).

---

## 3. Build & jalankan container

```bash
cd ~/loto
docker compose -f docker-compose.prod.yml up -d --build
```

Apa yang terjadi saat start:
1. Docker build image aplikasi (Next.js standalone).
2. Container start → `docker/entrypoint.sh` menjalankan `prisma migrate deploy`
   (menerapkan migrasi yang belum ada ke `loto_db`).
3. Server Next.js jalan di port **3000**.

Cek status & log:

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f web
```

Akses aplikasi: `http://<IP_SERVER_UBUNTU>:3000`

Login awal (dari hasil seed):
- Username: `admin` — Password: `password123`
- **Segera ganti password admin setelah login pertama.**

---

## 4. Alur update rutin (pull terbaru)

Setiap ada perubahan kode yang sudah di-push ke GitHub:

```bash
cd ~/loto
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build
```

Migrasi database baru (jika ada) otomatis diterapkan saat container start.
Data uploads tetap aman karena disimpan di Docker volume `uploads_data`.

---

## 5. Perintah operasional berguna

```bash
# Lihat log real-time
docker compose -f docker-compose.prod.yml logs -f web

# Restart aplikasi
docker compose -f docker-compose.prod.yml restart web

# Stop
docker compose -f docker-compose.prod.yml down

# Stop + hapus volume (HATI-HATI: menghapus data uploads)
docker compose -f docker-compose.prod.yml down -v

# Masuk shell container
docker exec -it loto_web sh

# Jalankan migrasi manual di dalam container (biasanya tidak perlu)
docker exec -it loto_web node node_modules/prisma/build/index.js migrate deploy
```

---

## 6. Buka firewall untuk port 3000 (jika UFW aktif)

```bash
sudo ufw status
# jika active, izinkan port app
sudo ufw allow 3000/tcp
sudo ufw reload
```

---

## 7. Verifikasi koneksi ke layanan eksternal

Dari server Ubuntu, pastikan bisa menjangkau DB dan WAHA:

```bash
# PostgreSQL
nc -zv 10.8.140.69 5432

# WAHA
curl -s http://10.8.140.67:8310/api/sessions | head
```

Tes notifikasi WhatsApp (dari dalam repo di server, butuh Node):

```bash
node test-whatsapp.js
```

---

## Troubleshooting

- **Container restart terus / crash**: cek log
  `docker compose -f docker-compose.prod.yml logs web`. Paling sering karena
  `DATABASE_URL` salah atau DB tidak bisa dijangkau.
- **`prisma migrate deploy` gagal di log**: pastikan server ini masuk aturan
  `pg_hba.conf` di server DB (10.8.140.69) dan port 5432 terbuka untuk IP
  server Ubuntu ini. Entrypoint tetap menjalankan app meski migrasi gagal,
  tapi aplikasi bisa error saat query.
- **WhatsApp tidak terkirim**: cek `WHATSAPP_API_URL`, session WAHA aktif
  (scan QR di http://10.8.140.67:8310/dashboard/), dan `WHATSAPP_SESSION` benar.
- **Port 3000 tidak bisa diakses dari luar**: cek UFW (langkah 6) dan firewall
  jaringan. Pastikan `HOSTNAME=0.0.0.0` (sudah di-set di Dockerfile).
- **Perubahan kode tidak muncul**: pastikan pakai flag `--build` saat
  `docker compose up` agar image di-rebuild.

---

## Catatan keamanan

- Jangan commit `.env` ke Git (sudah di-gitignore). Simpan hanya di server.
- Ganti `JWT_SECRET` dan password user default (`password123`) setelah deploy.
- Untuk produksi, batasi `pg_hba.conf` di server DB hanya ke IP server Ubuntu
  ini (jangan biarkan `0.0.0.0/0`), dan ganti password default `postgres`.
- Pertimbangkan memasang reverse proxy (Nginx/Caddy) + HTTPS di depan port 3000
  bila aplikasi diakses di luar jaringan internal.

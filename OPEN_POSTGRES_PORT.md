# Membuka Akses PostgreSQL Remote di Ubuntu (10.8.140.69)

Kondisi saat ini: host bisa di-ping, tapi port **5432 tertutup** — PostgreSQL
belum menerima koneksi dari luar. Ada 3 hal yang harus diatur di server DB:

1. PostgreSQL mendengarkan di semua interface (`listen_addresses`)
2. Aturan otentikasi client (`pg_hba.conf`)
3. Firewall Ubuntu (UFW) membuka port 5432

Semua perintah di bawah dijalankan **di server Ubuntu 10.8.140.69** (via SSH),
dengan user yang punya akses `sudo`.

---

## 0. SSH ke server DB

```bash
ssh <user>@10.8.140.69
```

Cek versi PostgreSQL (menentukan nama folder config, mis. 14/15/16):

```bash
psql --version
ls /etc/postgresql/
```

Contoh hasil `ls`: `16` → berarti path config ada di `/etc/postgresql/16/main/`.
Ganti angka `16` di perintah berikut sesuai versi Anda.

---

## 1. Aktifkan listen_addresses

Edit `postgresql.conf`:

```bash
sudo nano /etc/postgresql/16/main/postgresql.conf
```

Cari baris `listen_addresses` (biasanya ada tanda `#` di depan / komentar):

```
#listen_addresses = 'localhost'
```

Ubah menjadi (hapus `#`, dengarkan semua interface):

```
listen_addresses = '*'
```

Simpan (Ctrl+O, Enter) lalu keluar (Ctrl+X).

> Tip cepat tanpa buka editor:
> ```bash
> sudo sed -i "s/^#\?listen_addresses.*/listen_addresses = '*'/" /etc/postgresql/16/main/postgresql.conf
> ```

---

## ⚠️ PENTING — Ada NAT di jaringan Anda

Saat mencoba konek, server DB melihat IP client Anda sebagai **10.8.140.93**
(bukan 192.168.140.10 yang muncul di PC Anda). Artinya ada NAT di jaringan.
Maka entri `pg_hba.conf` HARUS mencakup IP `10.8.140.93`, atau pakai `0.0.0.0/0`.

Jika hanya menambah IP PC lokal Anda, koneksi tetap ditolak dengan pesan:
`no pg_hba.conf entry for host "10.8.140.93"`.

---

## 2. Izinkan koneksi di pg_hba.conf


Edit file otorisasi client:

```bash
sudo nano /etc/postgresql/16/main/pg_hba.conf
```

Tambahkan satu baris di bagian bawah. **Pilih salah satu**:

Opsi A — hanya izinkan IP server aplikasi (lebih aman, direkomendasikan).
Ganti dengan IP mesin/aplikasi yang akan konek (mis. server app atau PC Anda):

```
host    all    all    10.8.140.67/32    scram-sha-256
```

Opsi B — izinkan seluruh subnet (mis. jaringan 10.8.140.0/24):

```
host    all    all    10.8.140.0/24     scram-sha-256
```

Opsi C — izinkan SEMUA IP (paling terbuka, kurang aman — hanya untuk
jaringan tertutup/VPN, jangan untuk server terekspos internet):

```
host    all    all    0.0.0.0/0         scram-sha-256
# IPv6 (opsional):
host    all    all    ::/0              scram-sha-256
```

> Catatan: jika PostgreSQL Anda memakai autentikasi lama, ganti

> `scram-sha-256` dengan `md5`. Untuk PostgreSQL 14+ default-nya
> `scram-sha-256`.

Simpan dan keluar.

---

## 3. Restart PostgreSQL

```bash
sudo systemctl restart postgresql
sudo systemctl status postgresql --no-pager
```

Pastikan status `active (running)`.

Verifikasi PostgreSQL sudah listen di 0.0.0.0:5432 (bukan hanya 127.0.0.1):

```bash
sudo ss -tlnp | grep 5432
```

Output yang diharapkan mengandung `0.0.0.0:5432` (dan/atau `[::]:5432`).

---

## 4. Buka firewall (UFW)

Cek status firewall:

```bash
sudo ufw status
```

Jika `Status: active`, buka port 5432. **Pilih salah satu** (samakan dengan
keputusan di langkah 2):

Hanya dari IP tertentu (aman):

```bash
sudo ufw allow from 10.8.140.67 to any port 5432 proto tcp
```

Dari seluruh subnet:

```bash
sudo ufw allow from 10.8.140.0/24 to any port 5432 proto tcp
```

Dari semua IP (samakan dengan Opsi C di pg_hba.conf):

```bash
sudo ufw allow 5432/tcp
```


Terapkan & cek:

```bash
sudo ufw reload
sudo ufw status numbered
```

> Jika UFW `inactive`, kemungkinan firewall bukan penyebabnya — lanjut ke
> langkah 5 untuk verifikasi. Jangan mengaktifkan UFW sembarangan tanpa aturan
> SSH (`sudo ufw allow 22/tcp`) agar tidak terkunci dari server.

---

## 5. Verifikasi dari komputer Anda (Windows)

Kembali ke PowerShell di PC ini, jalankan:

```powershell
Test-NetConnection -ComputerName 10.8.140.69 -Port 5432
```

Yang diinginkan: `TcpTestSucceeded : True`.

Kalau sudah True, beri tahu saya — saya akan langsung jalankan:

```
npx prisma migrate deploy   # membuat database loto_db + semua tabel
npx prisma db seed          # data awal (opsional)
```

---

## Troubleshooting

- **Masih False setelah semua langkah**: kemungkinan ada firewall jaringan/router
  di antara Anda dan server (bukan UFW). Cek dengan admin jaringan apakah port
  5432 diblok di level switch/router.
- **Konek tapi "password authentication failed"**: cek metode di `pg_hba.conf`
  (`scram-sha-256` vs `md5`) dan pastикан password user `postgres` benar.
- **Konek tapi "database loto_db does not exist"**: normal — Prisma akan
  membuatnya, atau buat manual: `sudo -u postgres createdb loto_db`.
- **Keamanan produksi**: hindari `0.0.0.0/0` di `pg_hba.conf`. Batasi ke IP
  server aplikasi saja. Password DB juga sebaiknya diganti dari default.

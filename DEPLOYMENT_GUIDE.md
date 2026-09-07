# 🚀 Panduan Lengkap Deployment Backend Halator ke Cloud

Dokumentasi ini menjelaskan langkah demi langkah cara menyiapkan database cloud, menjalankan backend, dan men-deploy-nya ke Cloud agar website Halator bisa diakses online secara penuh melalui browser **Google Chrome** dari perangkat mana saja.

---

## 📑 Daftar Isi
1. [Langkah 1: Membuat Database Cloud Gratis di MongoDB Atlas](#langkah-1-membuat-database-cloud-gratis-di-mongodb-atlas)
2. [Langkah 2: Menjalankan Backend di Komputer Lokal](#langkah-2-menjalankan-backend-di-komputer-lokal)
3. [Langkah 3: Deploy Backend ke Cloud (Render.com - Rekomendasi Gratis)](#langkah-3-deploy-backend-ke-cloud-rendercom)
4. [Langkah 4: Opsi Deploy Lainnya (Railway / Google Cloud Run)](#langkah-4-opsi-deploy-lainnya)
5. [Langkah 5: Menghubungkan Frontend ke Backend Cloud](#langkah-5-menghubungkan-frontend-ke-backend-cloud)
6. [Daftar Endpoint API](#daftar-endpoint-api)

---

## Langkah 1: Membuat Database Cloud Gratis di MongoDB Atlas

MongoDB Atlas menyediakan kuota **gratis selamanya (M0 Free Tier)** sebesar 512 MB, sangat cukup untuk puluhan ribu akun dan data audit.

1. Buka [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) dan klik **Try Free** (atau login jika sudah punya akun).
2. Buat project baru dan pilih **Build a Database**.
3. Pilih paket **M0 (Free)**, pilih provider (AWS / Google Cloud), lalu pilih region terdekat (misalnya: `Singapore (ap-southeast-1)`).
4. Buat **Database User**:
   - Username: `halator_admin`
   - Password: Buat password yang kuat (simpan password ini!).
5. Atur **Network Access** (IP Whitelist):
   - Masukkan `0.0.0.0/0` (Allow Access from Anywhere) agar backend cloud Anda dapat terhubung.
6. Klik **Connect** -> Pilih **Drivers (Node.js)**.
7. Anda akan mendapatkan Connection String seperti ini:
   ```text
   mongodb+srv://halator_admin:<password>@cluster0.xxxxx.mongodb.net/halator?retryWrites=true&w=majority
   ```
   *Ganti `<password>` dengan password database yang Anda buat pada langkah 4.*

---

## Langkah 2: Menjalankan Backend di Komputer Lokal

1. Buka terminal di folder `server/`:
   ```powershell
   cd server
   npm install
   ```
2. Buka file `.env` di dalam folder `server/`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://halator_admin:PASSWORD_ANDA@cluster0.xxxxx.mongodb.net/halator?retryWrites=true&w=majority
   JWT_SECRET=halator_secure_jwt_secret_key_2026_xyz987
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=*
   ```
3. Jalankan server backend:
   ```powershell
   npm run dev
   ```
4. Buka di Google Chrome: `http://localhost:5000/api/health`
   Jika muncul:
   ```json
   {
     "status": "healthy",
     "database": "connected"
   }
   ```
   Artinya backend dan database cloud Anda sudah berhasil terhubung! 🎉

---

## Langkah 3: Deploy Backend ke Cloud (Render.com)

[Render.com](https://render.com) adalah platform cloud hosting gratis yang sangat mudah digunakan dan mendukung Node.js.

### Cara Deploy:
1. Pastikan project Anda sudah di-push ke repository **GitHub** Anda.
2. Buka [dashboard.render.com](https://dashboard.render.com/) dan login dengan akun GitHub Anda.
3. Klik tombol **New +** -> Pilih **Web Service**.
4. Pilih repository GitHub project Halator Anda.
5. Isi konfigurasi berikut:
   - **Name**: `halator-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
6. Gulir ke bagian **Environment Variables** dan tambahkan:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = *(masukkan URI MongoDB Atlas Anda)*
   - `JWT_SECRET` = *(buat kode acak panjang untuk token keamanan)*
   - `CORS_ORIGIN` = `*`
7. Klik **Deploy Web Service**.
8. Dalam beberapa menit, backend Anda akan aktif dan memiliki URL publik, contohnya:
   ```text
   https://halator-api.onrender.com
   ```

---

## Langkah 4: Opsi Deploy Lainnya

### A. Railway.app
1. Buka [railway.app](https://railway.app) dan login dengan GitHub.
2. Klik **New Project** -> **Deploy from GitHub repo**.
3. Pilih root folder `server`. Railway akan mendeteksi `Procfile` secara otomatis.
4. Masukkan Environment Variables (`MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`).

### B. Google Cloud Run (Menggunakan Docker)
Backend sudah dilengkapi dengan [Dockerfile](file:///c:/Users/jefry/Documents/halator-website/halator-main/server/Dockerfile). Anda dapat membangun image container dan men-deploy langsung ke Google Cloud Artifact Registry / Cloud Run.

---

## Langkah 5: Menghubungkan Frontend ke Backend Cloud

Agar aplikasi frontend Vite menggunakan backend cloud saat dibuka di browser Google Chrome:

1. Buka file `.env` di root project Halator (frontend).
2. Tambahkan URL backend Anda:
   ```env
   # Ganti dengan URL backend yang sudah Anda deploy di Render / Railway
   VITE_API_URL=https://halator-api.onrender.com/api

   # Atau jika sedang testing lokal:
   # VITE_API_URL=http://localhost:5000/api
   ```
3. Build atau jalankan frontend:
   ```powershell
   npm run dev
   ```
4. Sekarang, setiap registrasi akun baru, login, dan riwayat audit akan langsung tersimpan secara terpusat di database cloud!

---

## Langkah 6: Deploy ke Cloudflare (Cloudflare Pages)

Cloudflare Pages adalah platform hosting gratis dari Cloudflare yang sangat cepat, memiliki proteksi DDoS gratis, dan unlimited bandwidth untuk frontend React/Vite.

### A. Deploy Frontend ke Cloudflare Pages
1. Pastikan project Anda sudah di-push ke repository **GitHub** Anda.
2. Buka [dash.cloudflare.com](https://dash.cloudflare.com/) dan login/daftar.
3. Di menu sebelah kiri, klik **Workers & Pages** -> Klik **Create application** -> Pilih tab **Pages**.
4. Klik **Connect to Git** dan pilih repositori GitHub project Halator Anda.
5. Pada bagian **Build settings**:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (biarkan kosong/default)
6. Pada bagian **Environment variables (advanced)**, tambahkan:
   - Variable name: `VITE_API_URL`
   - Value: URL backend Anda (misal: `https://halator-api.onrender.com/api`)
7. Klik **Save and Deploy**.
8. Cloudflare Pages akan mem-build dan memberikan URL publik gratis Anda, contoh:
   ```text
   https://halator.pages.dev
   ```
*(File konfigurasi SPA routing `public/_redirects` sudah kami siapkan agar halaman tidak error 404 saat di-refresh).*

### B. Menghubungkan Domain Custom & Proteksi Cloudflare
Jika Anda memiliki domain sendiri (misalnya `halator.com`):
1. Di Cloudflare Pages -> Tab **Custom domains** -> Klik **Set up a custom domain**.
2. Masukkan domain/subdomain Anda (misal: `app.halator.com` untuk web, dan `api.halator.com` untuk backend).
3. Cloudflare otomatis mengaktifkan **SSL/TLS (HTTPS)**, **WAF (Web Application Firewall)**, dan **DDoS Protection** kelas dunia.

---

## 🛡️ Checklist Keamanan Produksi Sebelum Go-Live

Untuk memastikan website Anda aman dan tidak mudah dibajak:
1. **Ganti `JWT_SECRET`**:
   - Di file `.env` server atau di Environment Variables Cloudflare/Render, gunakan string acak sepanjang minimal 32–64 karakter.
2. **Kunci API Gemini**:
   - Jangan pernah membagikan API Key Gemini atau Connection String MongoDB ke publik (selalu simpan di Environment Variables server).
3. **Password Hashing**:
   - Password semua pengguna sudah dienkripsi dengan algoritma `bcryptjs` 10 salt rounds sebelum masuk database, sehingga aman dari kebocoran data.
4. **Header Keamanan**:
   - Server sudah dilengkapi `helmet` untuk memblokir serangan XSS, Clickjacking, dan Sniffing.

---

## Daftar Endpoint API

### 🔐 Autentikasi (`/api/auth`)
| Method | Endpoint | Deskripsi | Proteksi |
|---|---|---|---|
| `POST` | `/api/auth/register` | Mendaftarkan akun baru & buat token | Publik |
| `POST` | `/api/auth/login` | Masuk ke akun & validasi password | Publik |
| `GET` | `/api/auth/me` | Mengambil data profil user yang sedang login | Bearer Token |
| `PUT` | `/api/auth/profile` | Memperbarui nama, no hp, bisnis, avatar | Bearer Token |

### 📊 Audit Halal (`/api/audit`)
| Method | Endpoint | Deskripsi | Proteksi |
|---|---|---|---|
| `GET` | `/api/audit/history` | Mengambil daftar riwayat audit milik user | Bearer Token |
| `POST` | `/api/audit/history` | Menyimpan hasil audit baru & update kuota | Bearer Token |
| `DELETE` | `/api/audit/history/:id` | Menghapus data riwayat audit tertentu | Bearer Token |
| `GET` | `/api/audit/stats` | Statistik total audit & distribusi tipe | Bearer Token |

### 🎁 Afiliasi & Referral (`/api/affiliate`)
| Method | Endpoint | Deskripsi | Proteksi |
|---|---|---|---|
| `GET` | `/api/affiliate` | Data referral, total komisi & riwayat penarikan | Bearer Token |
| `POST` | `/api/affiliate/payout` | Mengajukan penarikan komisi ke rekening | Bearer Token |

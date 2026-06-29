# KiloWash - Sistem Informasi Manajemen Laundry

Aplikasi manajemen laundry berbasis web dengan fitur:
- 📋 Manajemen Order & Pelanggan
- 🔄 Antrian Laundry (Kanban Board)
- 💳 Kasir & Pembayaran
- 📲 Notifikasi WhatsApp Otomatis (Fonnte)
- 📊 Laporan Keuangan
- 🔍 Tracking Order Publik

## Tech Stack

- **Frontend:** HTML, Vanilla CSS, Vanilla JS
- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL (Supabase)
- **WA Notif:** Fonnte API

## Struktur Folder

```
KiloWash/
├── kilowash-backend/   # API Server Node.js
└── kilowash-frontend/  # Tampilan HTML/CSS/JS
```

## Setup Lokal

### Backend
1. Masuk ke folder backend: `cd kilowash-backend`
2. Install dependensi: `npm install`
3. Buat file `.env` berdasarkan `.env.example`
4. Jalankan server: `node app.js`

### Frontend
Buka `kilowash-frontend/src/pages/login.html` menggunakan Live Server.

## Environment Variables

Buat file `.env` di folder `kilowash-backend/` dengan isi:
```
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://...  # URL dari Supabase
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=8h
WA_API_URL=https://api.fonnte.com/send
WA_TOKEN=your_fonnte_token
WA_SENDER=628xxxxxxxxxx
```

## Deployment

- **Backend:** Vercel (dengan `vercel.json`)
- **Frontend:** Vercel (static site)
- **Database:** Supabase (PostgreSQL cloud)

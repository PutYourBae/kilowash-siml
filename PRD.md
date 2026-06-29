# PRD — Sistem Informasi Manajemen Laundry KiloWash (SIML-KiloWash)

**Version:** 1.0  
**Status:** Draft  
**Stack:** Node.js + Express + MySQL  
**Deployment:** Vercel (API + Frontend) + PlanetScale / Railway (MySQL)  
**Scope:** 1 outlet, single-tenant

---

## 1. Overview

SIML-KiloWash adalah aplikasi web manajemen operasional untuk usaha laundry kiloan skala UMKM. Sistem ini menggantikan pencatatan manual (nota tulis tangan, WhatsApp pribadi) dengan platform digital terpusat yang mencakup penerimaan order, antrian produksi, pembayaran, notifikasi pelanggan via WhatsApp, dan laporan keuangan otomatis.

---

## 2. Goals

| ID | Goal | Ukuran Keberhasilan |
|----|------|---------------------|
| G-01 | Eliminasi pencatatan manual | Tidak ada nota kertas dalam operasional harian |
| G-02 | Transparansi status order ke pelanggan | Pelanggan bisa cek status via kode order tanpa hubungi staf |
| G-03 | Notifikasi otomatis | WA terkirim otomatis saat order berstatus "Selesai" |
| G-04 | Laporan keuangan real-time | Owner bisa lihat laporan harian tanpa rekap manual |
| G-05 | Antrian produksi terstruktur | Petugas tahu urutan cuci tanpa papan tulis |

---

## 3. Non-Goals

- Integrasi payment gateway (GoPay, QRIS, OVO)
- Aplikasi mobile native (Android/iOS)
- Manajemen multi-outlet / multi-cabang
- Sistem loyalty point / membership
- Fitur akuntansi lengkap (biaya operasional, penggajian, dll.)

---

## 4. User Roles & Permissions

| Role | Deskripsi | Akses |
|------|-----------|-------|
| **Owner** | Pemilik usaha | Dashboard laporan, pengaturan harga, manajemen akun |
| **Admin** | Pengelola sistem | Semua fitur + manajemen pengguna + data master |
| **Kasir** | Staf penerimaan & pembayaran | Input order, proses pembayaran, cetak nota |
| **Petugas** | Staf laundry (cuci/setrika) | Lihat antrian, update status order |
| **Pelanggan** | End user eksternal | Cek status order via kode unik (tanpa login) |

---

## 5. Features & Functional Requirements

---

### 5.1 Modul Autentikasi

**FR-AUTH-01** — Login dengan email dan password  
**FR-AUTH-02** — Role-based access control (RBAC): Owner, Admin, Kasir, Petugas  
**FR-AUTH-03** — Session management (JWT token)  
**FR-AUTH-04** — Logout  
**FR-AUTH-05** — Halaman akses ditolak jika role tidak sesuai  

---

### 5.2 Modul Order

**FR-ORDER-01** — Kasir dapat membuat order baru dengan data:
- Nama pelanggan
- Nomor telepon pelanggan (WhatsApp)
- Berat cucian (kg)
- Jenis layanan (Reguler / Express)
- Catatan khusus (opsional)
- Estimasi selesai (otomatis dihitung dari jenis layanan)

**FR-ORDER-02** — Sistem menghasilkan kode order unik secara otomatis (format: `KW-YYYYMMDD-XXXX`)

**FR-ORDER-03** — Sistem menghitung total harga otomatis berdasarkan berat × harga per kg per jenis layanan

**FR-ORDER-04** — Kasir dapat mencetak / menampilkan nota order (tampilan print-friendly)

**FR-ORDER-05** — Sistem menampilkan daftar semua order dengan filter:
- Status (Diterima / Proses / Selesai / Diambil)
- Tanggal
- Jenis layanan

**FR-ORDER-06** — Kasir / Admin dapat mencari order berdasarkan kode order atau nama pelanggan

**FR-ORDER-07** — Admin dapat mengedit data order yang sudah dibuat (jika ada kesalahan input)

**FR-ORDER-08** — Admin dapat membatalkan order dengan menyertakan alasan

---

### 5.3 Modul Status & Antrian Produksi

**FR-STATUS-01** — Petugas dapat melihat daftar antrian produksi (order berstatus "Diterima" dan "Proses")

**FR-STATUS-02** — Petugas dapat mengubah status order:
- `Diterima` → `Proses`
- `Proses` → `Selesai`

**FR-STATUS-03** — Saat status diubah menjadi `Selesai`, sistem otomatis memicu pengiriman notifikasi WhatsApp ke pelanggan

**FR-STATUS-04** — Kasir mengubah status `Selesai` → `Diambil` setelah pelanggan mengambil cucian dan melakukan pembayaran

**FR-STATUS-05** — Setiap perubahan status dicatat dengan timestamp dan nama user yang mengubah (audit trail)

---

### 5.4 Modul Pembayaran

**FR-PAY-01** — Kasir dapat memproses pembayaran untuk order berstatus "Selesai"

**FR-PAY-02** — Sistem menampilkan ringkasan tagihan (nama, kode order, berat, jenis layanan, total harga)

**FR-PAY-03** — Kasir memasukkan jumlah uang yang diterima, sistem menghitung kembalian otomatis

**FR-PAY-04** — Sistem mencatat metode pembayaran: Tunai / Transfer

**FR-PAY-05** — Sistem menghasilkan bukti pembayaran (tampilan print-friendly)

---

### 5.5 Modul Notifikasi WhatsApp

**FR-NOTIF-01** — Sistem mengirim WhatsApp otomatis ke nomor pelanggan saat order berstatus "Selesai"

**FR-NOTIF-02** — Template pesan notifikasi:
```
Halo [Nama Pelanggan]! 🧺
Cucian Anda dengan kode order *[KW-XXXXXX]* sudah selesai dan siap diambil.

📍 KiloWash Laundry
⏰ Jam operasional: 07.00 – 21.00

Terima kasih telah menggunakan layanan kami!
```

**FR-NOTIF-03** — Sistem mencatat status pengiriman notifikasi (Terkirim / Gagal) di log order

**FR-NOTIF-04** — Admin dapat mengirim ulang notifikasi jika pengiriman pertama gagal

**FR-NOTIF-05** — Integrasi menggunakan Fonnte API atau Wablas API

---

### 5.6 Modul Tracking Order (Publik, Tanpa Login)

**FR-TRACK-01** — Tersedia halaman publik untuk pelanggan cek status order via kode unik

**FR-TRACK-02** — Tampilkan informasi:
- Kode order
- Nama pelanggan (disamarkan: "Budi S.")
- Jenis layanan & berat
- Status terkini
- Estimasi selesai
- Timeline status (kapan diterima, kapan diproses, kapan selesai)

**FR-TRACK-03** — Tidak menampilkan nomor telepon atau data sensitif lainnya

---

### 5.7 Modul Laporan Keuangan

**FR-REPORT-01** — Owner / Admin dapat melihat laporan pendapatan harian

**FR-REPORT-02** — Owner / Admin dapat melihat laporan pendapatan bulanan dengan grafik

**FR-REPORT-03** — Laporan mencakup:
- Total order masuk
- Total order selesai
- Total pendapatan
- Breakdown per jenis layanan (Reguler vs Express)
- Rata-rata order per hari

**FR-REPORT-04** — Owner / Admin dapat export laporan ke format CSV

**FR-REPORT-05** — Dashboard utama Owner menampilkan ringkasan hari ini (order aktif, pendapatan hari ini, order menunggu)

---

### 5.8 Modul Data Master

**FR-MASTER-01** — Admin dapat mengatur harga per kg untuk setiap jenis layanan

**FR-MASTER-02** — Admin dapat menambah / mengedit jenis layanan (nama, harga, estimasi hari selesai)

**FR-MASTER-03** — Admin dapat mengelola akun pengguna (tambah, edit, nonaktifkan)

**FR-MASTER-04** — Admin dapat mengatur informasi outlet (nama, alamat, nomor WA bisnis)

---

## 6. Non-Functional Requirements

| ID | Kategori | Requirement |
|----|----------|-------------|
| NFR-01 | Performa | Halaman utama load ≤ 3 detik pada koneksi 4G standar |
| NFR-02 | Ketersediaan | Uptime ≥ 99% selama jam operasional (07.00–21.00) |
| NFR-03 | Keamanan | Password di-hash dengan bcrypt, JWT untuk session |
| NFR-04 | RBAC | Setiap route API diproteksi middleware role checker |
| NFR-05 | Responsif | UI responsif di desktop, tablet, dan mobile |
| NFR-06 | Kompatibilitas | Berjalan di Chrome, Firefox, Edge versi terbaru |
| NFR-07 | Skalabilitas | Mendukung hingga 100 order aktif bersamaan |
| NFR-08 | Maintainability | Kode modular, menggunakan MVC pattern |

---

## 7. Tech Stack

| Layer | Teknologi | Keterangan |
|-------|-----------|------------|
| Frontend | HTML, CSS, Vanilla JS / atau EJS templating | Server-side render atau SPA ringan |
| Backend | Node.js + Express.js | REST API |
| Database | MySQL | Relational database |
| ORM | Sequelize atau Prisma | Query builder |
| Auth | JWT (jsonwebtoken) + bcrypt | Token-based auth |
| Notifikasi WA | Fonnte API / Wablas API | Third-party WhatsApp gateway |
| Deployment API | Vercel (Serverless Functions) | atau Railway |
| Deployment DB | PlanetScale / Railway MySQL | Cloud MySQL |
| Environment | dotenv | Config management |

---

## 8. Database Schema

### 8.1 Tabel `users`
```sql
CREATE TABLE users (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(100) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  role        ENUM('owner', 'admin', 'kasir', 'petugas') NOT NULL,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 8.2 Tabel `customers`
```sql
CREATE TABLE customers (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(100) NOT NULL,
  phone       VARCHAR(20) NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 8.3 Tabel `service_types`
```sql
CREATE TABLE service_types (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  name            VARCHAR(50) NOT NULL,       -- 'Reguler', 'Express'
  price_per_kg    DECIMAL(10,2) NOT NULL,
  est_days        INT NOT NULL,               -- estimasi hari selesai
  is_active       BOOLEAN DEFAULT TRUE
);
```

### 8.4 Tabel `orders`
```sql
CREATE TABLE orders (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  order_code      VARCHAR(20) UNIQUE NOT NULL,  -- KW-YYYYMMDD-XXXX
  customer_id     INT NOT NULL,
  service_type_id INT NOT NULL,
  weight_kg       DECIMAL(5,2) NOT NULL,
  total_price     DECIMAL(10,2) NOT NULL,
  notes           TEXT,
  status          ENUM('diterima','proses','selesai','diambil') DEFAULT 'diterima',
  est_finish_date DATE NOT NULL,
  created_by      INT NOT NULL,               -- FK ke users
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (service_type_id) REFERENCES service_types(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### 8.5 Tabel `order_status_logs`
```sql
CREATE TABLE order_status_logs (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  order_id    INT NOT NULL,
  old_status  VARCHAR(20),
  new_status  VARCHAR(20) NOT NULL,
  changed_by  INT NOT NULL,               -- FK ke users
  changed_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (changed_by) REFERENCES users(id)
);
```

### 8.6 Tabel `payments`
```sql
CREATE TABLE payments (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  order_id        INT UNIQUE NOT NULL,
  amount_paid     DECIMAL(10,2) NOT NULL,
  change_amount   DECIMAL(10,2) NOT NULL,
  payment_method  ENUM('tunai','transfer') NOT NULL,
  paid_by         INT NOT NULL,               -- FK ke users (kasir)
  paid_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (paid_by) REFERENCES users(id)
);
```

### 8.7 Tabel `notification_logs`
```sql
CREATE TABLE notification_logs (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  order_id    INT NOT NULL,
  phone       VARCHAR(20) NOT NULL,
  message     TEXT NOT NULL,
  status      ENUM('terkirim','gagal') NOT NULL,
  sent_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

---

## 9. API Endpoints

### Auth
| Method | Endpoint | Role | Deskripsi |
|--------|----------|------|-----------|
| POST | `/api/auth/login` | Public | Login, return JWT |
| POST | `/api/auth/logout` | All | Logout |

### Orders
| Method | Endpoint | Role | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/orders` | Admin, Kasir, Petugas, Owner | List semua order (dengan filter) |
| POST | `/api/orders` | Kasir, Admin | Buat order baru |
| GET | `/api/orders/:id` | Admin, Kasir | Detail order |
| PUT | `/api/orders/:id` | Admin | Edit order |
| PATCH | `/api/orders/:id/status` | Petugas, Kasir, Admin | Update status order |
| DELETE | `/api/orders/:id` | Admin | Batalkan order |

### Tracking (Publik)
| Method | Endpoint | Role | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/track/:order_code` | Public | Cek status order via kode |

### Payments
| Method | Endpoint | Role | Deskripsi |
|--------|----------|------|-----------|
| POST | `/api/payments` | Kasir, Admin | Proses pembayaran |
| GET | `/api/payments/:order_id` | Admin, Owner | Detail pembayaran |

### Notifications
| Method | Endpoint | Role | Deskripsi |
|--------|----------|------|-----------|
| POST | `/api/notifications/resend/:order_id` | Admin | Kirim ulang notifikasi |

### Reports
| Method | Endpoint | Role | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/reports/daily` | Owner, Admin | Laporan harian |
| GET | `/api/reports/monthly` | Owner, Admin | Laporan bulanan |
| GET | `/api/reports/export` | Owner, Admin | Export CSV |

### Master Data
| Method | Endpoint | Role | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/services` | All | List jenis layanan |
| POST | `/api/services` | Admin | Tambah jenis layanan |
| PUT | `/api/services/:id` | Admin | Edit jenis layanan |
| GET | `/api/users` | Admin | List pengguna |
| POST | `/api/users` | Admin | Tambah pengguna |
| PUT | `/api/users/:id` | Admin | Edit pengguna |

---

## 10. Order Status Flow

```
[Diterima] → [Proses] → [Selesai] → [Diambil]
                              ↓
                    (Notifikasi WA dikirim otomatis)
```

- `Diterima` — Order baru dibuat oleh Kasir
- `Proses` — Petugas mulai mengerjakan cucian
- `Selesai` — Cucian selesai, WA dikirim ke pelanggan
- `Diambil` — Pelanggan sudah ambil + bayar, Kasir konfirmasi

---

## 11. Folder Structure (Backend)

```
kilowash-backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   ├── notificationController.js
│   │   ├── reportController.js
│   │   └── masterController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Customer.js
│   │   ├── Order.js
│   │   ├── Payment.js
│   │   ├── ServiceType.js
│   │   └── NotificationLog.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── orders.js
│   │   ├── payments.js
│   │   ├── reports.js
│   │   └── master.js
│   ├── services/
│   │   ├── whatsappService.js
│   │   └── reportService.js
│   └── utils/
│       ├── generateOrderCode.js
│       └── calculatePrice.js
├── .env
├── app.js
└── package.json
```

---

## 12. Environment Variables

```env
# Server
PORT=3000
NODE_ENV=production

# Database
DB_HOST=your-db-host
DB_PORT=3306
DB_NAME=kilowash_db
DB_USER=your-db-user
DB_PASS=your-db-password

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=8h

# WhatsApp API (Fonnte)
WA_API_URL=https://api.fonnte.com/send
WA_TOKEN=your-fonnte-token
WA_SENDER=628xxxxxxxxxx
```

---

## 13. Milestones

| Fase | Deliverable | Prioritas |
|------|-------------|-----------|
| M1 | Setup project, DB schema, Auth | High |
| M2 | Modul Order (CRUD + status flow) | High |
| M3 | Modul Antrian Produksi (Petugas view) | High |
| M4 | Modul Pembayaran | High |
| M5 | Notifikasi WhatsApp | Medium |
| M6 | Tracking Order Publik | Medium |
| M7 | Laporan & Dashboard Owner | Medium |
| M8 | Data Master & Manajemen Akun | Low |
| M9 | Polish UI, testing, deployment | High |

---

## 14. Out of Scope (Confirmed)

- Payment gateway (GoPay, QRIS, OVO, dll.)
- Aplikasi mobile native
- Multi-outlet
- Sistem loyalty / membership
- Biaya operasional dalam laporan keuangan

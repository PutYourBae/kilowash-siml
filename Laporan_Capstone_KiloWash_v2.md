# Laporan Capstone Project: KiloWash v2 (Sistem Informasi Manajemen Laundry)

**Nama Proyek**: KiloWash v2 – Sistem Informasi Manajemen Laundry Multi-Cabang  
**Tahap**: Capstone Project – Iterasi Lanjutan (v2)  
**Status**: ✅ Selesai & Dipublikasikan

---

## Bab 1: Latar Belakang Pengembangan

Sistem Informasi Manajemen Laundry (SIML) KiloWash v1 telah berhasil mengotomatisasi proses bisnis inti pada satu outlet laundry, seperti pencatatan order, pelacakan status, dan notifikasi WhatsApp sederhana. Namun, seiring dengan pertumbuhan bisnis, muncul kebutuhan untuk berekspansi ke berbagai cabang dan meningkatkan retensi pelanggan.

Oleh karena itu, KiloWash v2 dikembangkan sebagai kelanjutan dari proyek capstone dengan tujuan utama:
1. Mendukung operasional **multi-cabang** (Multi-branch Management) dengan hak akses tergranulasi.
2. Membangun **sistem membership (Diskon Flat 5%)** untuk meningkatkan retensi dan pengalaman pelanggan.
3. Mengumpulkan **umpan balik pelanggan** (Rating & Feedback) guna menjaga kualitas layanan.
4. Memperkaya **komunikasi otomatis** melalui notifikasi WhatsApp cerdas dan asinkron.
5. Memastikan **keamanan data tingkat tinggi** dengan implementasi Row Level Security (RLS) di database.
6. Membangun **Data Master Terpusat** yang terkonsolidasi dan **Manajemen Cabang Mandiri** sebagai halaman terpisah agar tidak ada redundansi.
7. Menjamin **kebenaran alur otorisasi** (*frontend auth guard*) untuk setiap peran pengguna yang ada di sistem.

---

## Bab 2: Analisis & Arsitektur Sistem

### 2.1 Arsitektur Sistem
KiloWash v2 tetap mempertahankan arsitektur *Monolith berbasis layanan* yang berfokus pada kecepatan dan efisiensi:
- **Frontend**: HTML5, CSS3 (Vanilla), dan Vanilla JavaScript. Antarmuka dirancang dengan estetika *Premium Dark Mode* yang responsif (Mobile First), dilengkapi Web Component `<app-sidebar>` untuk navigasi yang dinamis dan konsisten di seluruh halaman.
- **Backend**: Node.js + Express.js dengan arsitektur MVC (Model–View–Controller).
- **Database**: PostgreSQL, di-hosting pada platform Supabase dengan koneksi aman via *Service Role*.
- **Third-Party API**: Fonnte API untuk pengiriman notifikasi WhatsApp otomatis.
- **Deployment**: Vercel (Frontend) + Railway/Render (Backend Node.js).

### 2.2 Desain Database & Keamanan
Struktur database diperluas dengan menambahkan entitas baru:
- `branches`: Menyimpan data cabang (nama, alamat, telepon, status aktif).
- `ratings`: Menyimpan umpan balik pelanggan secara unik per pesanan (mencegah duplikasi rating).
- `payments`: Mencatat riwayat transaksi pembayaran tiap order, termasuk metode dan kembalian.

**Implementasi Keamanan (RLS):**  
Merespons deteksi celah keamanan dari *Supabase Security Advisor*, Row Level Security (RLS) diaktifkan secara menyeluruh pada seluruh tabel (`users`, `branches`, `orders`, `customers`, `ratings`, dll.). Hal ini menutup sepenuhnya akses manipulasi data dari kunci publik (*anon key*) melalui PostgREST, sementara Backend internal Node.js tetap beroperasi normal menggunakan koneksi aman via *Service Role Key*.

### 2.3 Peran Pengguna (Role System)
Sistem mendukung 5 peran dengan hak akses yang berbeda:

| Peran | Hak Akses |
|---|---|
| `owner` | Akses penuh: semua halaman, semua cabang, laporan, manajemen cabang & karyawan |
| `admin` | Dashboard, order, antrian, kasir, laporan, feedback, data master (tanpa cabang) |
| `branch_admin` | Dashboard, order, antrian, kasir, laporan, feedback (khusus cabang sendiri) |
| `kasir` | Order baru, antrian, kasir & pembayaran, feedback |
| `petugas` | Antrian laundry (kanban board) |

---

## Bab 3: Implementasi Fitur Utama

### 3.1 Manajemen Multi-Cabang & Hak Akses Terpusat

**Deskripsi:**  
Sistem mendukung penugasan staf ke cabang tertentu secara fleksibel. Seluruh peran (`admin`, `kasir`, `petugas`, `branch_admin`) dapat ditugaskan ke satu cabang spesifik atau bertugas di pusat (akses semua cabang).

**Implementasi Backend:**  
Filter data berbasis `branch_id` diterapkan di `orderController.js`, `reportController.js`, dan `ratingController.js`. Jika staf memiliki `branch_id`, semua query secara otomatis dibatasi pada cabang tersebut di sisi server.

**Implementasi Frontend:**  
- Sidebar dinamis (`AppSidebar` Web Component di `app.js`) menampilkan menu berbeda sesuai peran secara *real-time*.
- Semua halaman dilindungi oleh `requireAuth()` dengan *whitelist* peran yang sesuai.
- Halaman yang tidak boleh diakses akan secara otomatis melakukan redirect ke halaman default peran tersebut (bukan ke login, untuk menghindari *infinite redirect loop*).

**Manajemen Cabang Mandiri:**  
Halaman khusus `branches.html` disediakan sebagai antarmuka mandiri untuk Owner mengelola data cabang (tambah, edit, aktifkan/nonaktifkan). Fitur ini **dipisah dari Data Master** untuk menghindari redundansi dan tumpang-tindih fungsionalitas.

### 3.2 Data Master Terpusat

**Deskripsi:**  
Seluruh data konfigurasi bisnis dikonsolidasi dalam satu modul `master.html` yang terdiri dari 3 tab:

| Tab | Konten | Akses |
|---|---|---|
| 🧺 Layanan | CRUD jenis layanan, harga/kg atau harga/pcs, minimum order, estimasi hari | Owner, Admin |
| 👥 Karyawan | CRUD akun staf, assignment cabang, manajemen password, toggle status aktif | Owner, Admin |
| 💎 Member | Daftar pelanggan terdaftar sebagai Member (Diskon 5%) | Owner, Admin |

### 3.3 Sistem Membership (Diskon Flat 5%) & Autofill Order

**Deskripsi:**  
Pelanggan yang terdaftar sebagai Member secara otomatis mendapat potongan harga sebesar 5% pada setiap transaksi di semua jenis layanan KiloWash.

**Implementasi:**
- **Sisi Server (Backend)**: Setiap kali order dibuat, `orderController.js` memeriksa field `is_member` pada tabel Customer. Jika `true`, diskon 5% dihitung dari `base_price` dan disimpan pada kolom `discount_from_points` di tabel `orders`.
- **Sisi Kasir (Frontend)**: Form Order Baru memiliki *dropdown* pencarian Member. Saat Kasir memilih Member terdaftar, form melakukan *autofill* nama dan nomor WhatsApp secara otomatis, dan estimasi harga diperbarui secara *real-time* dengan potongan 5% yang ditampilkan jelas dengan badge "Diskon Member".

### 3.4 Penilaian & Umpan Balik Pelanggan (Rating System)

**Alur Pelanggan:**
1. Pelanggan menerima notifikasi WhatsApp saat cucian selesai, berisi tautan ke halaman *tracking* publik.
2. Di halaman *tracking* (`tracking.html`), pelanggan dapat memberikan penilaian bintang (1–5) dan komentar teks bebas.
3. Sistem memvalidasi bahwa satu kode order hanya bisa dirating **satu kali** untuk mencegah manipulasi.

**Alur Staff:**
- Halaman **Feedback Pelanggan** (`ratings.html`) dapat diakses oleh Owner, Admin, Branch Admin, dan Kasir.
- Menampilkan rekap statistik (rata-rata bintang, distribusi per bintang, total ulasan).
- Rating ≤ 2 bintang secara **otomatis ditandai (*auto-flagged*)** agar tim dapat segera menindaklanjuti.
- Staff dapat menandai ulasan yang sudah ditangani (toggle flag *Follow Up* ↔ *Selesai*).
- Tersedia filter berdasarkan Cabang dan status Flagged.

### 3.5 Notifikasi WhatsApp Cerdas & Asinkron

**Peningkatan dari v1:**

| Titik Notifikasi | v1 | v2 |
|---|---|---|
| Order dibuat | ❌ | ✅ + tautan tracking |
| Order selesai | ✅ | ✅ + nama & alamat cabang |
| Pengiriman | Sinkron (blocking) | **Asinkron** (`setImmediate`) |

**Lokasi Dinamis (Dynamic Branch Routing):**  
Bot WhatsApp mendeteksi secara otomatis cabang mana yang memproses cucian. Notifikasi "siap diambil" menampilkan secara presisi nama cabang dan alamat pengambilannya, mencegah kebingungan pelanggan pada operasional multi-cabang.

**Non-Blocking (NFR-N1):**  
Pengiriman notifikasi WA dibungkus dalam `setImmediate()` sehingga tidak pernah memblokir respons API ke Kasir, walaupun Fonnte API lambat atau tidak responsif.

### 3.6 Kasir & Pembayaran

**Deskripsi:**  
Halaman `payments.html` dirancang sebagai antarmuka kasir yang intuitif:
- Daftar semua order berstatus "Selesai" ditampilkan di panel kiri.
- Panel kanan menampilkan ringkasan tagihan, nominal pembayaran, dan kalkulasi kembalian secara *real-time*.
- Mendukung dua metode pembayaran: **Tunai** dan **Transfer/QRIS**.
- Setelah pembayaran dikonfirmasi, status order otomatis berubah menjadi "Diambil" dan riwayat tercatat.

### 3.7 Antrian Laundry (Kanban Board)

**Deskripsi:**  
Halaman `queue.html` menampilkan antrian pesanan dalam format *Kanban Board* tiga kolom:

| Kolom | Status |
|---|---|
| 📥 Diterima | Order baru masuk, belum diproses |
| 🫧 Proses | Sedang dalam proses pencucian |
| ✅ Selesai | Cucian selesai, menunggu diambil |

Setiap kartu order memiliki tombol aksi untuk memindahkan status. Saat order ditandai "Selesai", notifikasi WhatsApp otomatis terkirim ke pelanggan. Board di-*refresh* otomatis setiap 60 detik.

### 3.8 Laporan Keuangan

**Deskripsi:**  
Halaman `reports.html` menyajikan laporan keuangan bulanan:
- Ringkasan: total pendapatan, jumlah order, rata-rata per hari, rata-rata per transaksi.
- Grafik garis pendapatan harian dalam satu bulan (menggunakan Chart.js).
- Tabel breakdown pendapatan per jenis layanan untuk hari ini.
- Fitur **Ekspor CSV** dengan otentikasi Bearer Token untuk unduhan aman.

---

## Bab 4: Arsitektur Frontend – Web Component Sidebar

Salah satu inovasi teknis utama v2 adalah penggunaan **Web Component** untuk navigasi sidebar.

**Implementasi `AppSidebar`:**
```javascript
class AppSidebar extends HTMLElement {
  connectedCallback() {
    // Membaca user dari localStorage
    // Render menu dinamis berdasarkan user.role
    // Setiap halaman cukup menulis: <app-sidebar></app-sidebar>
  }
}
customElements.define('app-sidebar', AppSidebar);
```

**Keunggulan:**
- **DRY (Don't Repeat Yourself)**: Tidak ada duplikasi HTML sidebar di setiap halaman.
- **Otomatis Sinkron**: Perubahan struktur menu cukup dilakukan di satu tempat (`app.js`).
- **Role-Aware**: Menu yang ditampilkan selalu sesuai dengan peran pengguna yang sedang login.

---

## Bab 5: Pengujian & Verifikasi

### 5.1 Pengujian Fungsional (End-to-End)

| Skenario | Hasil |
|---|---|
| Login dengan 5 peran berbeda → redirect ke halaman yang benar | ✅ Lulus |
| Owner: melihat data semua cabang | ✅ Lulus |
| Branch Admin: hanya melihat data cabangnya | ✅ Lulus |
| Kasir: membuat order Member → harga terpotong 5% real-time | ✅ Lulus |
| Petugas: memindahkan status order di Kanban | ✅ Lulus |
| Notifikasi WA terkirim saat order dibuat & selesai | ✅ Lulus |
| Pelanggan memberi rating via tracking link | ✅ Lulus |
| Rating ≤ 2 bintang otomatis terflagged | ✅ Lulus |
| Pembayaran tunai & transfer, status berubah ke "Diambil" | ✅ Lulus |
| Ekspor laporan CSV dengan token otorisasi | ✅ Lulus |
| Halaman yang tidak diizinkan redirect ke halaman default | ✅ Lulus |

### 5.2 Pengujian Keamanan

| Skenario | Hasil |
|---|---|
| Akses API tanpa token → `401 Unauthorized` | ✅ Lulus |
| Kasir akses endpoint Owner → `403 Forbidden` | ✅ Lulus |
| RLS aktif → akses langsung via Supabase *anon key* ditolak | ✅ Lulus |
| Duplikasi rating pada order yang sama → `409 Conflict` | ✅ Lulus |

### 5.3 Pengujian Bug & Perbaikan Iteratif

Selama sesi pengembangan intensif, ditemukan dan diperbaiki berbagai bug:

| Bug | Penyebab | Perbaikan |
|---|---|---|
| Menu Feedback tidak muncul | Kondisi sidebar hanya cek `owner`, bukan `admin/branch_admin` | Konsolidasi logika sidebar ke `app.js` |
| Halaman cabang loading terus | `apiFetch` lokal tidak sinkron dengan token baru; `openModal` tumpang-tindih dengan global | Migrasi ke fungsi `api()` global; rename fungsi lokal |
| `order-detail.html` crash | Masih pakai `<aside>` & `setupSidebar()` lama | Ditulis ulang dengan `<app-sidebar>` |
| Antrian: tombol aksi crash | `statusLabel` tidak didefinisikan di scope lokal | Ditambahkan definisi lokal |
| Redirect loop branch_admin | `getHomePageForRole` tidak mengenali `branch_admin` | Ditambahkan ke array role mapping |
| Tab Cabang redundan di Data Master | Dua antarmuka untuk fitur yang sama | Tab Cabang di Data Master dihapus, halaman `branches.html` dijadikan satu-satunya sumber |

---

## Bab 6: Kesimpulan

KiloWash v2 berhasil mengintegrasikan ekosistem operasional yang lebih kompleks dan matang dibandingkan v1. Sistem ini mampu mengelola laundry dengan banyak cabang secara terpusat, memberikan pengalaman pelanggan yang lebih baik melalui program membership, notifikasi otomatis yang informatif, dan saluran umpan balik yang terstruktur.

Dari sisi teknis, KiloWash v2 mendemonstrasikan implementasi berbagai konsep rekayasa perangkat lunak yang relevan:
- **Arsitektur MVC** pada Backend (Node.js + Express.js)
- **Web Component** untuk komponen UI yang reusable
- **Row Level Security (RLS)** untuk keamanan data di level database
- **Asinkron Non-Blocking** untuk integrasi API pihak ketiga
- **Role-Based Access Control (RBAC)** yang konsisten antara Frontend dan Backend
- **Single Source of Truth** untuk manajemen state dan navigasi

Dengan semua fitur ini, KiloWash v2 siap mendigitalisasi, meningkatkan efisiensi operasional, dan menskalakan bisnis laundry secara nyata — baik untuk keperluan presentasi Capstone Project maupun penggunaan bisnis sesungguhnya.

---

*(Laporan diperbarui: Juli 2026 – Versi Final)*

# Laporan Capstone Project: KiloWash v2 (Sistem Informasi Manajemen Laundry)

## Bab 1: Latar Belakang Pengembangan

Sistem Informasi Manajemen Laundry (SIML) KiloWash v1 telah berhasil mengotomatisasi proses bisnis inti pada satu outlet laundry, seperti pencatatan order, pelacakan status, dan notifikasi WhatsApp sederhana. Namun, seiring dengan pertumbuhan bisnis, muncul kebutuhan untuk berekspansi ke berbagai cabang dan meningkatkan retensi pelanggan melalui program loyalitas. 

Oleh karena itu, KiloWash v2 dikembangkan sebagai kelanjutan dari proyek capstone dengan tujuan utama:
1. Mendukung operasional multi-cabang (Multi-branch Management).
2. Membangun sistem loyalitas (Membership & Points) untuk meningkatkan retensi.
3. Mengumpulkan umpan balik pelanggan (Rating & Feedback) guna menjaga kualitas layanan.
4. Memperkaya komunikasi otomatis melalui notifikasi WhatsApp di berbagai fase pesanan.
5. Memastikan keamanan data tingkat tinggi dengan implementasi Row Level Security (RLS) di database.

---

## Bab 2: Analisis & Arsitektur Sistem

### 2.1 Arsitektur Sistem
KiloWash v2 tetap mempertahankan arsitektur *Monolith berbasis layanan* yang berfokus pada kecepatan dan efisiensi:
- **Frontend**: HTML5, CSS3, dan Vanilla JavaScript. Pada v2, antarmuka dirombak menggunakan desain *Glassmorphism* yang responsif (Mobile First), memastikan aksesibilitas dari perangkat apapun.
- **Backend**: Node.js dengan framework Express.js.
- **Database**: PostgreSQL di-hosting pada platform Supabase.
- **Third-Party API**: Fonnte untuk notifikasi WhatsApp.

### 2.2 Desain Database & Keamanan
Struktur database diperluas dengan menambahkan entitas baru:
- `branches`: Menyimpan data cabang.
- `loyalty_points`: Mencatat histori perolehan dan penukaran poin.
- `ratings`: Menyimpan umpan balik pengguna secara unik per pesanan.

**Implementasi Keamanan (RLS):**
Merespons deteksi celah keamanan dari *Supabase Security Advisor*, Row Level Security (RLS) diaktifkan secara menyeluruh pada semua tabel (`users`, `branches`, `orders`, `customers`, dll.). Hal ini mencegah manipulasi data dari kunci publik (anon key) melalui PostgREST, sementara backend internal Node.js dapat terus beroperasi menggunakan koneksi aman via *Service Role*.

---

## Bab 3: Implementasi Fitur Utama

### 3.1 Manajemen Multi-Cabang
- **Deskripsi**: Owner dapat menambah, mengedit, dan menonaktifkan cabang. Admin dan Kasir beroperasi pada konteks cabangnya masing-masing.
- **Hak Akses**: Menggunakan peran `branch_admin` (Admin Cabang) yang dibatasi visibilitas ordernya ke cabang tempatnya bertugas.

### 3.2 Sistem Loyalitas (Membership & Points)
- **Deskripsi**: Pelanggan mendapatkan poin berdasarkan total transaksi (misalnya 1 Poin per Rp10.000). Poin tersebut dapat ditukar (redeem) menjadi diskon pada pesanan berikutnya.
- **Klasifikasi**: Berdasarkan akumulasi poin, pelanggan diklasifikasikan ke dalam tier keanggotaan (Regular, Silver, Gold).

### 3.3 Penilaian dan Umpan Balik (Rating System)
- **Deskripsi**: Pelanggan yang pesanannya telah selesai atau diambil dapat memberikan penilaian bintang (1-5) dan komentar pada halaman pelacakan (*tracking*).
- **Quality Control**: Ulasan yang berada di bawah atau sama dengan 2 bintang secara otomatis ditandai (flagged) agar dapat segera ditindaklanjuti (follow up) oleh Owner atau Admin.

### 3.4 Notifikasi WhatsApp Lanjutan
- Pada v1, notifikasi hanya dikirim saat pesanan selesai. Pada v2, pelanggan menerima notifikasi saat pesanan **dibuat (registered)**, lengkap dengan tautan pelacakan (*tracking link*) otomatis.
- Notifikasi bersifat asinkron untuk menjaga kecepatan API respon.

---

## Bab 4: Pengujian & Kesimpulan

### 4.1 Pengujian
Pengujian dilakukan dengan pendekatan *End-to-End* (E2E):
1. **Fungsi**: Pembuatan order, pengiriman notifikasi, penyelesaian order (poin bertambah), pemberian rating, dan pembentukan order dengan diskon poin.
2. **UI/UX**: Memastikan rendering tampilan konsisten antara perangkat Desktop, Tablet, dan Mobile (Responsive Grid & Sidebar Toggle).
3. **Keamanan**: Memastikan `rls_fix.sql` telah menutup akses publik tanpa merusak fungsionalitas Backend.

### 4.2 Kesimpulan
KiloWash v2 sukses mengintegrasikan ekosistem operasional yang lebih kompleks. Dengan penambahan fitur cabang dan loyalitas, serta pembaruan antarmuka *premium glassmorphism*, sistem ini siap mendigitalisasi dan meningkatkan skalabilitas bisnis laundry secara nyata tanpa mengesampingkan keamanan data.

*(Selesai)*

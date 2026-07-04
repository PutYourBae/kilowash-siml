# Laporan Capstone Project: KiloWash v2 (Sistem Informasi Manajemen Laundry)

## Bab 1: Latar Belakang Pengembangan

Sistem Informasi Manajemen Laundry (SIML) KiloWash v1 telah berhasil mengotomatisasi proses bisnis inti pada satu outlet laundry, seperti pencatatan order, pelacakan status, dan notifikasi WhatsApp sederhana. Namun, seiring dengan pertumbuhan bisnis, muncul kebutuhan untuk berekspansi ke berbagai cabang dan meningkatkan retensi pelanggan melalui program loyalitas. 

Oleh karena itu, KiloWash v2 dikembangkan sebagai kelanjutan dari proyek capstone dengan tujuan utama:
1. Mendukung operasional multi-cabang (Multi-branch Management).
2. Membangun sistem loyalitas (Membership & Points) untuk meningkatkan retensi.
3. Mengumpulkan umpan balik pelanggan (Rating & Feedback) guna menjaga kualitas layanan.
4. Memperkaya komunikasi otomatis melalui notifikasi WhatsApp di berbagai fase pesanan.
5. Memastikan keamanan data tingkat tinggi dengan implementasi Row Level Security (RLS) di database.
6. Memusatkan manajemen data (Data Master) untuk menyederhanakan antarmuka pengguna (UI/UX) dan meningkatkan skalabilitas.

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

### 3.1 Manajemen Multi-Cabang & Hak Akses Terpusat
- **Deskripsi**: Pada pengembangan awal, peran khusus `branch_admin` digunakan untuk mengelola cabang. Kini, fungsionalitas telah dikembangkan menjadi **Penugasan Cabang Fleksibel**. Seluruh peran (`admin`, `kasir`, dan `petugas`) dapat ditugaskan secara spesifik ke satu cabang atau bertugas secara silang (pusat).
- **Hak Akses & Keamanan**: Jika seorang staf (misal Kasir) ditugaskan di Cabang A, sistem secara otomatis akan mengunci halaman **Daftar Order** dan **Laporan** hanya untuk data dari Cabang A. Sebaliknya, akun *Owner* (atau pusat) tetap dapat menggunakan *dropdown filter* untuk melihat dan mengelola data lintas cabang.
- **Data Master Terpusat**: Seluruh manajemen konfigurasi, mulai dari Layanan, Cabang, Karyawan, hingga Pelanggan (Member) digabungkan dalam satu modul antarmuka yang rapi dan terpusat ("Data Master"), mengurangi redundansi halaman.

### 3.2 Sistem Membership (Diskon Flat 5%) & Autofill Order
- **Deskripsi**: Sistem poin sebelumnya disederhanakan menjadi sistem **Diskon Merata (Flat Discount)**. Pelanggan yang terdaftar sebagai Member secara otomatis akan langsung mendapatkan potongan harga sebesar 5% setiap kali bertransaksi di semua layanan KiloWash.
- **Order Autofill & Harga Otomatis**: Kasir difasilitasi dengan *dropdown* pencarian cerdas pada form Order Baru. Jika pelanggan adalah member terdaftar, sistem akan melakukan *autofill* pada kolom Nama dan Nomor WhatsApp, serta secara *real-time* memotong estimasi harga di layar kasir sebesar 5%. Hal ini mempercepat pelayanan dan mengurangi *human error*.

### 3.3 Penilaian dan Umpan Balik (Rating System)
- **Deskripsi**: Pelanggan yang pesanannya telah selesai atau diambil dapat memberikan penilaian bintang (1-5) dan komentar pada halaman pelacakan (*tracking*).
- **Quality Control**: Ulasan yang berada di bawah atau sama dengan 2 bintang secara otomatis ditandai (flagged) agar dapat segera ditindaklanjuti (follow up) oleh Owner atau Admin.

### 3.4 Notifikasi WhatsApp Cerdas & Asinkron
- Pada v1, notifikasi hanya dikirim saat pesanan selesai. Pada v2, pelanggan menerima notifikasi asinkron saat pesanan **dibuat (registered)** lengkap dengan tautan pelacakan (*tracking link*), dan notifikasi saat pesanan **selesai**.
- **Lokasi Dinamis (Dynamic Branch Routing)**: Bot WhatsApp telah ditingkatkan kemampuannya untuk mendeteksi secara otomatis cabang mana yang memproses cucian tersebut. Pada saat notifikasi siap diambil dikirimkan, pesan akan menampilkan secara presisi nama cabang dan lokasi (alamat) pengambilannya, mencegah kebingungan pelanggan pada operasional multi-cabang.

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

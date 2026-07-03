-- rls_fix.sql
-- Mengaktifkan RLS (Row Level Security) untuk semua tabel.
-- Bertujuan untuk menutup celah keamanan PostgREST di Supabase yang ditandai oleh Security Advisor.
-- CATATAN: Backend KiloWash yang menggunakan Sequelize dengan connection string `postgresql://` 
-- akan secara otomatis melewati kebijakan RLS (karena bertindak sebagai service_role / db_owner),
-- sehingga operasional aplikasi backend ke database TIDAK AKAN TERGANGGU.

ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_status_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ratings ENABLE ROW LEVEL SECURITY;

-- Jika tidak ada kebijakan (policy) yang dibuat, maka PostgREST API Publik (anon key) 
-- TIDAK AKAN BISA melakukan SELECT/INSERT/UPDATE/DELETE sama sekali ke tabel-tabel ini.
-- Ini adalah langkah paling aman mengingat kita menggunakan Node.js Backend kustom, bukan Supabase JS Client.

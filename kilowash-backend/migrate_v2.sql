-- ============================================================
-- KiloWash v2 — Database Migration Script
-- Jalankan script ini di Supabase SQL Editor
-- ============================================================

-- 1. Buat tabel branches
CREATE TABLE IF NOT EXISTS branches (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  address    TEXT,
  phone      VARCHAR(20),
  is_active  BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tambah kolom baru ke tabel users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL;

-- Update enum role (PostgreSQL tidak support ALTER ENUM langsung di beberapa versi)
-- Cara aman: buat type baru, update kolom, hapus type lama
DO $$ BEGIN
  ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'branch_admin';
EXCEPTION WHEN others THEN
  -- Jika enum tidak ada atau sudah ada nilai, lanjutkan
  NULL;
END $$;

-- 3. Tambah kolom baru ke tabel customers
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS total_points      INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS membership_level  VARCHAR(10) DEFAULT 'reguler';

-- 4. Tambah kolom baru ke tabel orders
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS branch_id             INTEGER REFERENCES branches(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS discount_from_points  DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS points_redeemed       INTEGER DEFAULT 0;

-- 5. Tambah kolom type ke tabel notification_logs
ALTER TABLE notification_logs
  ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'ready';

-- 6. Buat tabel loyalty_points
CREATE TABLE IF NOT EXISTS loyalty_points (
  id               SERIAL PRIMARY KEY,
  customer_id      INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  order_id         INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  points_earned    INTEGER DEFAULT 0,
  points_redeemed  INTEGER DEFAULT 0,
  balance_after    INTEGER NOT NULL,
  type             VARCHAR(10) NOT NULL DEFAULT 'earned',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Buat tabel ratings
CREATE TABLE IF NOT EXISTS ratings (
  id          SERIAL PRIMARY KEY,
  order_id    INTEGER NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  branch_id   INTEGER REFERENCES branches(id) ON DELETE SET NULL,
  rating      INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment     TEXT,
  is_flagged  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Indexes untuk performa query
CREATE INDEX IF NOT EXISTS idx_orders_branch_id         ON orders(branch_id);
CREATE INDEX IF NOT EXISTS idx_users_branch_id          ON users(branch_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_customer  ON loyalty_points(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_order     ON loyalty_points(order_id);
CREATE INDEX IF NOT EXISTS idx_ratings_branch_id        ON ratings(branch_id);
CREATE INDEX IF NOT EXISTS idx_ratings_is_flagged       ON ratings(is_flagged);
CREATE INDEX IF NOT EXISTS idx_notification_logs_type   ON notification_logs(type);

-- ============================================================
-- Selesai. Tambahkan data cabang pertama (opsional):
-- INSERT INTO branches (name, address, phone) VALUES ('KiloWash Pusat', 'Jl. Utama No. 1', '08xxxxxxxxxx');
-- ============================================================

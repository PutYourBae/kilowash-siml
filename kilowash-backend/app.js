// Force timezone to WIB (UTC+7) — must be FIRST before any Date() is called
process.env.TZ = 'Asia/Jakarta';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const sequelize = require('./src/config/database');

// Import models agar terdaftar (termasuk v2: Branch, Rating)
require('./src/models/index');

const app = express();

// Security: Trust proxy (dibutuhkan untuk Vercel/Heroku agar mendapatkan IP yang benar)
app.set('trust proxy', 1);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global Rate Limiter: Maksimal 1000 request per 15 menit per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Terlalu banyak request, coba lagi nanti' }
});
app.use('/api/', apiLimiter);

// Login Rate Limiter: Maksimal 10 percobaan gagal/berhasil per 15 menit per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Terlalu banyak percobaan login, harap tunggu 15 menit' }
});

// ─── Import Routes ───────────────────────────────────────────────
// v1
const authRoutes         = require('./src/routes/auth');
const masterRoutes       = require('./src/routes/master');
const orderRoutes        = require('./src/routes/orders');
const trackRoutes        = require('./src/routes/track');
const paymentRoutes      = require('./src/routes/payments');
const reportRoutes       = require('./src/routes/reports');
const notificationRoutes = require('./src/routes/notifications');
// v2
const branchRoutes       = require('./src/routes/branches');
const ratingRoutes       = require('./src/routes/ratings');

// ─── Setup Routes ────────────────────────────────────────────────
// v1
app.use('/api/auth',          loginLimiter, authRoutes);
app.use('/api/master',        masterRoutes);
app.use('/api/orders',        orderRoutes);
app.use('/api/track',         trackRoutes);
app.use('/api/payments',      paymentRoutes);
app.use('/api/reports',       reportRoutes);
app.use('/api/notifications', notificationRoutes);
// v2
app.use('/api/branches',      branchRoutes);
app.use('/api/ratings',       ratingRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'SIML-KiloWash API v2.0 — OK' });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// Wajib untuk Vercel serverless
module.exports = app;

// Force timezone to WIB (UTC+7) — must be FIRST before any Date() is called
process.env.TZ = 'Asia/Jakarta';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./src/config/database');

// Import models agar terdaftar
require('./src/models/index');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import Routes
const authRoutes = require('./src/routes/auth');
const masterRoutes = require('./src/routes/master');
const orderRoutes = require('./src/routes/orders');
const trackRoutes = require('./src/routes/track');
const paymentRoutes = require('./src/routes/payments');
const reportRoutes = require('./src/routes/reports');
const notificationRoutes = require('./src/routes/notifications');

// Setup Routes
app.use('/api/auth', authRoutes);
app.use('/api/master', masterRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/track', trackRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'SIML-KiloWash API v1.0 — OK' });
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

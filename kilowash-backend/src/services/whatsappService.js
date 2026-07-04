const { NotificationLog } = require('../models');
require('dotenv').config();

const WA_API_URL = process.env.WA_API_URL || 'https://api.fonnte.com/send';
const WA_TOKEN = process.env.WA_TOKEN || '';
const TRACKING_BASE_URL = process.env.TRACKING_BASE_URL || 'https://kilowash.vercel.app';

// ─── Helpers ───────────────────────────────────────────────────

const formatRp = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

const https = require('https');

/**
 * Kirim pesan WA ke nomor target menggunakan native https (kompatibel semua versi Node.js).
 */
const sendWA = (phone, message) => {
  return new Promise((resolve) => {
    if (!WA_TOKEN) {
      console.log(`[MOCK WA] To: ${phone}\n${message}`);
      return resolve('terkirim');
    }

    const payload = JSON.stringify({ target: phone, message, countryCode: '62' });
    const options = {
      hostname: 'api.fonnte.com',
      path: '/send',
      method: 'POST',
      headers: {
        'Authorization': WA_TOKEN,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (!data.status) console.error('[WA] Fonnte error detail:', data);
          resolve(data.status ? 'terkirim' : 'gagal');
        } catch (e) {
          console.error('[WA] Parse response error:', e);
          resolve('gagal');
        }
      });
    });

    req.on('error', (err) => {
      console.error('[WA] HTTPS request error:', err);
      resolve('gagal');
    });

    req.write(payload);
    req.end();
  });
};

// ─── Message Builders ──────────────────────────────────────────

/**
 * Template pesan saat order pertama kali diterima (FR-N1, FR-N2).
 */
const buildRegisteredMessage = (order) => {
  const customerName = order.Customer.name;
  const orderCode = order.order_code;
  const serviceName = order.ServiceType.name;
  const weight = order.weight_kg;
  const totalPrice = formatRp(order.total_price);
  const estDate = formatDate(order.est_finish_date);
  const trackingLink = `${TRACKING_BASE_URL}/src/pages/track.html?code=${orderCode}`;

  return (
    `Halo ${customerName}! 👋\n` +
    `Terima kasih telah mempercayakan cucian Anda kepada *KiloWash Laundry*. Pesanan Anda telah kami terima dan sedang kami proses.\n\n` +
    `📋 *Detail Pesanan:*\n` +
    `- Kode Order: *${orderCode}*\n` +
    `- Layanan: ${serviceName}\n` +
    `- Berat/Jumlah: ${weight} ${order.ServiceType?.unit || 'Kg'}\n` +
    `- Total Tagihan: *${totalPrice}*\n` +
    `- Estimasi Selesai: ${estDate}\n\n` +
    `🔍 Pantau progres cucian Anda kapan saja:\n${trackingLink}\n\n` +
    `Mohon ditunggu ya, kami akan segera mengabari Anda begitu cucian selesai. Terima kasih! 🙏`
  );
};

/**
 * Template pesan saat order selesai dan siap diambil (existing — dipertahankan).
 */
const buildReadyMessage = (order) => {
  const customerName = order.Customer.name;
  const orderCode = order.order_code;
  const serviceName = order.ServiceType.name;
  const weight = order.weight_kg;
  const totalPrice = formatRp(order.total_price);

  return (
    `Halo ${customerName}! 🧺\n` +
    `Cucian Anda dengan kode order *${orderCode}* sudah selesai dan siap diambil.\n\n` +
    `📦 *Detail Pesanan:*\n` +
    `- Layanan: ${serviceName}\n` +
    `- Berat: ${weight} Kg\n` +
    `- Total Tagihan: *${totalPrice}*\n\n` +
    `Kami menerima pembayaran dalam bentuk Tunai, Transfer Bank, dan QRIS.\n\n` +
    `📍 *KiloWash Laundry*\n` +
    `⏰ Jam operasional: 07.00 – 21.00\n\n` +
    `Terima kasih telah menggunakan layanan kami! ⭐`
  );
};

// ─── Exported Functions ────────────────────────────────────────

/**
 * Kirim notifikasi WA saat order pertama kali dibuat/diterima (FR-N1).
 * Non-blocking — error tidak akan menghentikan flow pembuatan order (NFR-N1).
 */
exports.sendOrderRegisteredNotification = async (order) => {
  const phone = order.Customer.phone;
  const message = buildRegisteredMessage(order);
  const status = await sendWA(phone, message);
  await NotificationLog.create({ order_id: order.id, phone, message, status, type: 'registered' });
  return status;
};

/**
 * Kirim notifikasi WA saat order selesai (existing — dipertahankan untuk kompatibilitas).
 */
exports.sendOrderReadyNotification = async (order) => {
  const phone = order.Customer.phone;
  const message = buildReadyMessage(order);
  const status = await sendWA(phone, message);
  await NotificationLog.create({ order_id: order.id, phone, message, status, type: 'ready' });
  return status;
};

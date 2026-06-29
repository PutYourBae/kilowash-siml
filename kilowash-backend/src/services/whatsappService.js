const { NotificationLog } = require('../models');
require('dotenv').config();

const WA_API_URL = process.env.WA_API_URL || 'https://api.fonnte.com/send';
const WA_TOKEN = process.env.WA_TOKEN || '';
const WA_SENDER = process.env.WA_SENDER || '';

const buildMessage = (order) => {
  const customerName = order.Customer.name;
  const orderCode = order.order_code;
  const serviceName = order.ServiceType.name;
  const weight = order.weight_kg;
  const formatRp = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
  const totalPrice = formatRp(order.total_price);
  
  return `Halo ${customerName}! 🧺\nCucian Anda dengan kode order *${orderCode}* sudah selesai dan siap diambil.\n\n📦 *Detail Pesanan:*\n- Layanan: ${serviceName}\n- Berat: ${weight} Kg\n- Total Tagihan: *${totalPrice}*\n\nKami menerima pembayaran dalam bentuk Tunai, Transfer Bank, dan QRIS.\n\n📍 *KiloWash Laundry*\n⏰ Jam operasional: 07.00 – 21.00\n\nTerima kasih telah menggunakan layanan kami!`;
};

exports.sendOrderReadyNotification = async (order) => {
  const phone = order.Customer.phone;
  const message = buildMessage(order);
  let status = 'gagal';

  // If no WA token configured, log as mock
  if (!WA_TOKEN) {
    console.log(`[MOCK WA] To: ${phone}\n${message}`);
    status = 'terkirim';
  } else {
    try {
      const response = await fetch(WA_API_URL, {
        method: 'POST',
        headers: { Authorization: WA_TOKEN, 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: phone, message, countryCode: '62' })
      });
      const data = await response.json();
      status = data.status ? 'terkirim' : 'gagal';
    } catch (err) {
      console.error('[WA] Error:', err.message);
      status = 'gagal';
    }
  }

  await NotificationLog.create({ order_id: order.id, phone, message, status });
  return status;
};

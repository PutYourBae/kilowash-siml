const { Order, Payment, ServiceType, Customer } = require('../models');
const { Op } = require('sequelize');

// Helper: dapatkan range awal & akhir hari dalam WIB (UTC+7) → dikembalikan sebagai UTC untuk query DB
const getDayRangeWIB = (dateStr) => {
  let wibDateStr;
  if (dateStr) {
    wibDateStr = dateStr;
  } else {
    const now = new Date();
    const wib = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    wibDateStr = `${wib.getFullYear()}-${String(wib.getMonth()+1).padStart(2,'0')}-${String(wib.getDate()).padStart(2,'0')}`;
  }
  const start = new Date(wibDateStr + 'T00:00:00+07:00');
  const end   = new Date(wibDateStr + 'T23:59:59.999+07:00');
  return { start, end, wibDateStr };
};

exports.getDailyReport = async (req, res) => {
  try {
    const { start, end, wibDateStr } = getDayRangeWIB(req.query.date);

    const orders = await Order.findAll({ where: { created_at: { [Op.between]: [start, end] } } });
    const payments = await Payment.findAll({
      where: { paid_at: { [Op.between]: [start, end] } },
      include: [{ model: Order, include: [{ model: ServiceType }] }]
    });

    const total_orders      = orders.length;
    const completed_orders  = orders.filter(o => ['selesai','diambil'].includes(o.status)).length;
    const pending_orders    = orders.filter(o => ['diterima','proses'].includes(o.status)).length;
    const total_revenue     = payments.reduce((sum, p) => sum + parseFloat(p.Order.total_price), 0);

    const breakdown = {};
    payments.forEach(p => {
      const sName = p.Order.ServiceType.name;
      if (!breakdown[sName]) breakdown[sName] = { count: 0, revenue: 0 };
      breakdown[sName].count   += 1;
      breakdown[sName].revenue += parseFloat(p.Order.total_price);
    });

    res.json({ success: true, data: { date: wibDateStr, total_orders, completed_orders, pending_orders, total_revenue, breakdown } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const nowWIB = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    const m = parseInt(month || nowWIB.getMonth() + 1);
    const y = parseInt(year  || nowWIB.getFullYear());

    const daysInMonth = new Date(y, m, 0).getDate();
    const start = new Date(`${y}-${String(m).padStart(2,'0')}-01T00:00:00+07:00`);
    const end   = new Date(`${y}-${String(m).padStart(2,'0')}-${String(daysInMonth).padStart(2,'0')}T23:59:59.999+07:00`);

    const payments = await Payment.findAll({
      where: { paid_at: { [Op.between]: [start, end] } },
      include: [{ model: Order, include: [{ model: ServiceType }] }]
    });

    // Inisialisasi data harian
    const dailyData = {};
    for (let d = 1; d <= daysInMonth; d++) {
      dailyData[d] = {
        date: `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`,
        revenue: 0,
        orders: 0
      };
    }

    // Kelompokkan berdasarkan hari di WIB
    payments.forEach(p => {
      const dayWIB = parseInt(new Date(p.paid_at).toLocaleDateString('en-US', { timeZone: 'Asia/Jakarta', day: 'numeric' }));
      if (dailyData[dayWIB]) {
        dailyData[dayWIB].revenue += parseFloat(p.Order.total_price);
        dailyData[dayWIB].orders  += 1;
      }
    });

    const total_revenue = payments.reduce((s, p) => s + parseFloat(p.Order.total_price), 0);
    const total_orders  = payments.length;
    const avg_per_day   = total_orders > 0 ? (total_revenue / daysInMonth).toFixed(0) : 0;

    res.json({ success: true, data: { month: m, year: y, total_revenue, total_orders, avg_per_day, chart: Object.values(dailyData) } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.exportCSV = async (req, res) => {
  try {
    const { month, year } = req.query;
    const nowWIB = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    const m = parseInt(month || nowWIB.getMonth() + 1);
    const y = parseInt(year  || nowWIB.getFullYear());
    const daysInMonth = new Date(y, m, 0).getDate();
    const start = new Date(`${y}-${String(m).padStart(2,'0')}-01T00:00:00+07:00`);
    const end   = new Date(`${y}-${String(m).padStart(2,'0')}-${String(daysInMonth).padStart(2,'0')}T23:59:59.999+07:00`);

    const payments = await Payment.findAll({
      where: { paid_at: { [Op.between]: [start, end] } },
      include: [{ model: Order, include: [{ model: Customer }, { model: ServiceType }] }]
    });

    let csv = '\uFEFFKode Order;Pelanggan;Layanan;Berat (Kg/Pcs);Total;Metode Bayar;Tanggal Bayar\n';
    payments.forEach(p => {
      const o      = p.Order;
      const tgl    = new Date(p.paid_at).toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' });
      const unit   = o.ServiceType?.unit === 'pcs' ? 'Pcs' : 'Kg';
      csv += `${o.order_code};"${o.Customer.name}";"${o.ServiceType.name}";"${o.weight_kg} ${unit}";${o.total_price};${p.payment_method};${tgl}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="laporan-${y}-${String(m).padStart(2,'0')}.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

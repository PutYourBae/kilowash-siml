const { Order, Payment, ServiceType, Customer } = require('../models');
const { Op } = require('sequelize');

exports.getDailyReport = async (req, res) => {
  try {
    const dateStr = req.query.date;
    const targetDate = dateStr ? new Date(dateStr) : new Date();
    const start = new Date(targetDate); start.setHours(0, 0, 0, 0);
    const end = new Date(targetDate); end.setHours(23, 59, 59, 999);

    const orders = await Order.findAll({ where: { created_at: { [Op.between]: [start, end] } } });
    const payments = await Payment.findAll({
      where: { paid_at: { [Op.between]: [start, end] } },
      include: [{ model: Order, include: [{ model: ServiceType }] }]
    });

    const total_orders = orders.length;
    const completed_orders = orders.filter(o => ['selesai', 'diambil'].includes(o.status)).length;
    const pending_orders = orders.filter(o => ['diterima', 'proses'].includes(o.status)).length;
    const total_revenue = payments.reduce((sum, p) => sum + parseFloat(p.Order.total_price), 0);

    const breakdown = {};
    payments.forEach(p => {
      const sName = p.Order.ServiceType.name;
      if (!breakdown[sName]) breakdown[sName] = { count: 0, revenue: 0 };
      breakdown[sName].count += 1;
      breakdown[sName].revenue += parseFloat(p.Order.total_price);
    });

    res.json({ success: true, data: { date: targetDate.toISOString().split('T')[0], total_orders, completed_orders, pending_orders, total_revenue, breakdown } });
  } catch (error) { console.error(error); res.status(500).json({ success: false, message: 'Server error' }); }
};

exports.getMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = parseInt(month || new Date().getMonth() + 1);
    const y = parseInt(year || new Date().getFullYear());
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59, 999);

    const payments = await Payment.findAll({
      where: { paid_at: { [Op.between]: [start, end] } },
      include: [{ model: Order, include: [{ model: ServiceType }] }]
    });

    // Group by day
    const dailyData = {};
    for (let d = 1; d <= new Date(y, m, 0).getDate(); d++) {
      dailyData[d] = { date: `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`, revenue: 0, orders: 0 };
    }

    payments.forEach(p => {
      const day = new Date(p.paid_at).getDate();
      dailyData[day].revenue += parseFloat(p.Order.total_price);
      dailyData[day].orders += 1;
    });

    const total_revenue = payments.reduce((s, p) => s + parseFloat(p.Order.total_price), 0);
    const total_orders = payments.length;
    const avg_per_day = total_orders > 0 ? (total_revenue / new Date(y, m, 0).getDate()).toFixed(0) : 0;

    res.json({ success: true, data: { month: m, year: y, total_revenue, total_orders, avg_per_day, chart: Object.values(dailyData) } });
  } catch (error) { console.error(error); res.status(500).json({ success: false, message: 'Server error' }); }
};

exports.exportCSV = async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = parseInt(month || new Date().getMonth() + 1);
    const y = parseInt(year || new Date().getFullYear());
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59, 999);

    const payments = await Payment.findAll({
      where: { paid_at: { [Op.between]: [start, end] } },
      include: [{ model: Order, include: [{ model: Customer }, { model: ServiceType }] }]
    });

    let csv = 'Kode Order,Pelanggan,Layanan,Berat (Kg),Total,Metode Bayar,Tanggal Bayar\n';
    payments.forEach(p => {
      const o = p.Order;
      csv += `${o.order_code},${o.Customer.name},${o.ServiceType.name},${o.weight_kg},${o.total_price},${p.payment_method},${new Date(p.paid_at).toLocaleDateString('id-ID')}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="laporan-${y}-${String(m).padStart(2,'0')}.csv"`);
    res.send(csv);
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
};

const { Payment, Order, OrderStatusLog, Customer, ServiceType } = require('../models');

exports.processPayment = async (req, res) => {
  try {
    const { order_id, amount_paid, payment_method } = req.body;
    
    // 1. Validasi Order
    const order = await Order.findByPk(order_id);
    if (!order) return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
    
    if (order.status !== 'selesai') {
      return res.status(400).json({ success: false, message: 'Hanya order berstatus Selesai yang bisa dibayar.' });
    }

    // 2. Cek apakah sudah pernah dibayar
    const existingPayment = await Payment.findOne({ where: { order_id } });
    if (existingPayment) {
      return res.status(400).json({ success: false, message: 'Order ini sudah dibayar.' });
    }

    // 3. Kalkulasi
    const amountPaid = parseFloat(amount_paid);
    const totalPrice = parseFloat(order.total_price);
    
    if (amountPaid < totalPrice) {
      return res.status(400).json({ success: false, message: 'Jumlah bayar kurang dari total tagihan.' });
    }
    
    const changeAmount = amountPaid - totalPrice;

    // 4. Catat Pembayaran
    const payment = await Payment.create({
      order_id: order.id,
      amount_paid: amountPaid,
      change_amount: changeAmount,
      payment_method,
      paid_by: req.user.id
    });

    // 5. Update Status Order menjadi 'diambil'
    await order.update({ status: 'diambil' });
    await OrderStatusLog.create({
      order_id: order.id,
      old_status: 'selesai',
      new_status: 'diambil',
      changed_by: req.user.id
    });

    res.status(201).json({ success: true, message: 'Pembayaran berhasil diproses', payment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getPaymentDetail = async (req, res) => {
  try {
    const { order_id } = req.params;
    const payment = await Payment.findOne({ 
      where: { order_id },
      include: [
        { 
          model: Order, 
          include: [{ model: Customer }, { model: ServiceType }]
        }
      ]
    });
    
    if (!payment) return res.status(404).json({ success: false, message: 'Data pembayaran tidak ditemukan' });
    
    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

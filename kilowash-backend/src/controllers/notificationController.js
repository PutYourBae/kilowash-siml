const { NotificationLog, Order, Customer, ServiceType } = require('../models');
const whatsappService = require('../services/whatsappService');

exports.resendNotification = async (req, res) => {
  try {
    const { order_id } = req.params;
    const order = await Order.findByPk(order_id, {
      include: [{ model: Customer }, { model: ServiceType }]
    });
    if (!order) return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
    if (order.status !== 'selesai') return res.status(400).json({ success: false, message: 'Notifikasi hanya bisa dikirim untuk order berstatus Selesai' });

    await whatsappService.sendOrderReadyNotification(order);
    res.json({ success: true, message: 'Notifikasi berhasil dikirim ulang' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal mengirim notifikasi: ' + error.message });
  }
};

exports.getNotificationLogs = async (req, res) => {
  try {
    const { order_id } = req.params;
    const logs = await NotificationLog.findAll({ where: { order_id }, order: [['sent_at', 'DESC']] });
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

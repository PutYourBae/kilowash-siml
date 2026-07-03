const { NotificationLog, Order, Customer, ServiceType } = require('../models');
const whatsappService = require('../services/whatsappService');

/**
 * FR-N4: Kirim ulang notifikasi secara manual.
 * POST /api/notifications/resend/:order_id
 * Query param: ?type=ready|registered (default: ready)
 */
exports.resendNotification = async (req, res) => {
  try {
    const { order_id } = req.params;
    const type = req.query.type || 'ready';

    const order = await Order.findByPk(order_id, {
      include: [{ model: Customer }, { model: ServiceType }]
    });
    if (!order) return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });

    // Validasi: notifikasi 'ready' hanya untuk order yang sudah selesai
    if (type === 'ready' && order.status !== 'selesai') {
      return res.status(400).json({
        success: false,
        message: 'Notifikasi selesai hanya bisa dikirim untuk order berstatus Selesai'
      });
    }

    let status;
    if (type === 'registered') {
      status = await whatsappService.sendOrderRegisteredNotification(order);
    } else {
      status = await whatsappService.sendOrderReadyNotification(order);
    }

    res.json({
      success: true,
      message: `Notifikasi ${type === 'registered' ? 'penerimaan order' : 'selesai'} berhasil dikirim ulang`,
      status
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal mengirim notifikasi: ' + error.message });
  }
};

/**
 * FR-N3: Lihat log notifikasi per order, dengan filter opsional berdasarkan tipe.
 * GET /api/notifications/logs/:order_id?type=registered|ready
 */
exports.getNotificationLogs = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { type } = req.query;

    const where = { order_id };
    if (type) where.type = type;

    const logs = await NotificationLog.findAll({
      where,
      order: [['sent_at', 'DESC']]
    });
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * FR-N3: Lihat semua log notifikasi (admin/owner) dengan filter tipe dan status.
 * GET /api/notifications/logs?type=ready|registered&status=gagal&page=1
 */
exports.getAllNotificationLogs = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 30 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const result = await NotificationLog.findAndCountAll({
      where,
      include: [{ model: Order, attributes: ['order_code', 'status'] }],
      order: [['sent_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: {
        logs: result.rows,
        totalItems: result.count,
        totalPages: Math.ceil(result.count / parseInt(limit)),
        currentPage: parseInt(page)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

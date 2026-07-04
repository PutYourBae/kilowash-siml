const { Order, Customer, ServiceType, User, OrderStatusLog, Branch } = require('../models');
const { Op } = require('sequelize');

const generateOrderCode = async () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `KW-${dateStr}-`;
  const lastOrder = await Order.findOne({
    where: { order_code: { [Op.like]: `${prefix}%` } },
    order: [['id', 'DESC']]
  });
  let nextNum = 1;
  if (lastOrder) {
    const parts = lastOrder.order_code.split('-');
    nextNum = parseInt(parts[parts.length - 1], 10) + 1;
  }
  return `${prefix}${nextNum.toString().padStart(4, '0')}`;
};

// ─── Helpers: Branch Filter ─────────────────────────────────────

const getBranchFilter = (user, requestedBranchId) => {
  if (user.branch_id) return user.branch_id;
  if (requestedBranchId && user.role === 'owner') return requestedBranchId;
  return null;
};

// ─── Controllers ───────────────────────────────────────────────

exports.getOrders = async (req, res) => {
  try {
    const { status, date, service_type_id, search, branch_id } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (service_type_id) where.service_type_id = service_type_id;
    if (date) {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end   = new Date(date); end.setHours(23, 59, 59, 999);
      where.created_at = { [Op.between]: [start, end] };
    }

    // FR-B3 & FR-B5: Filter cabang
    const resolvedBranchId = getBranchFilter(req.user, branch_id);
    if (resolvedBranchId) where.branch_id = resolvedBranchId;

    const includeCustomer = { model: Customer, attributes: ['name', 'phone', 'total_points', 'membership_level'] };
    const includeService  = { model: ServiceType, attributes: ['name', 'price_per_kg', 'unit', 'min_order'] };
    const includeBranch   = { model: Branch, attributes: ['name'] };

    let result;
    if (search) {
      const customerSearch = await Customer.findAll({ where: { name: { [Op.iLike]: `%${search}%` } }, attributes: ['id'] });
      const customerIds = customerSearch.map(c => c.id);
      result = await Order.findAndCountAll({
        where: { ...where, [Op.or]: [{ order_code: { [Op.iLike]: `%${search}%` } }, { customer_id: { [Op.in]: customerIds } }] },
        include: [includeCustomer, includeService, includeBranch],
        order: [['created_at', 'DESC']],
        limit, offset
      });
    } else {
      result = await Order.findAndCountAll({
        where,
        include: [includeCustomer, includeService, includeBranch],
        order: [['created_at', 'DESC']],
        limit, offset
      });
    }

    res.json({
      success: true,
      data: {
        orders: result.rows,
        totalItems: result.count,
        totalPages: Math.ceil(result.count / limit),
        currentPage: page
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { customer_name, customer_phone, service_type_id, weight_kg, notes, branch_id, points_to_redeem } = req.body;

    // Validasi layanan
    const service = await ServiceType.findByPk(service_type_id);
    if (!service) return res.status(404).json({ success: false, message: 'Layanan tidak ditemukan' });

    const qty = parseFloat(weight_kg);
    const minOrder = parseFloat(service.min_order) || 1;
    if (qty < minOrder) {
      return res.status(400).json({
        success: false,
        message: `Minimal order untuk layanan ini adalah ${minOrder} ${service.unit}`
      });
    }

    // Tentukan branch_id (branch_admin otomatis pakai cabangnya sendiri)
    const resolvedBranchId = req.user.role === 'branch_admin' ? req.user.branch_id : (branch_id || null);

    // Hitung harga dasar
    const base_price = qty * parseFloat(service.price_per_kg);
    const estDate = new Date();
    estDate.setDate(estDate.getDate() + service.est_days);

    // Find or create customer
    const [customer] = await Customer.findOrCreate({
      where: { phone: customer_phone },
      defaults: { name: customer_name, is_member: false }
    });

    // Hitung diskon 5% jika pelanggan adalah member
    let discount_from_points = 0; // Tetap gunakan variabel ini agar DB tidak perlu di-migrate
    let points_redeemed = 0;
    if (customer.is_member) {
      discount_from_points = base_price * 0.05;
    }

    const total_price = Math.max(0, base_price - discount_from_points);

    const order_code = await generateOrderCode();
    const order = await Order.create({
      order_code,
      customer_id: customer.id,
      service_type_id: service.id,
      branch_id: resolvedBranchId,
      weight_kg: qty,
      total_price,
      discount_from_points,
      points_redeemed,
      notes,
      est_finish_date: estDate,
      created_by: req.user.id,
      status: 'diterima'
    });

    await OrderStatusLog.create({ order_id: order.id, new_status: 'diterima', changed_by: req.user.id });

    const fullOrder = await Order.findByPk(order.id, {
      include: [{ model: Customer }, { model: ServiceType }, { model: Branch }]
    });

    // FR-N1: Kirim notifikasi WA "diterima" secara async/non-blocking (NFR-N1)
    setImmediate(async () => {
      try {
        const waService = require('../services/whatsappService');
        await waService.sendOrderRegisteredNotification(fullOrder);
      } catch (waErr) {
        console.error('[WA] Gagal kirim notifikasi registered:', waErr.message);
      }
    });

    res.status(201).json({ success: true, message: 'Order berhasil dibuat', order: fullOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getOrderDetail = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: Customer },
        { model: ServiceType },
        { model: Branch, attributes: ['name'] },
        { model: OrderStatusLog, include: [{ model: User, as: 'changer', attributes: ['name', 'role'] }] }
      ]
    });
    if (!order) return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });

    // FR-B3: branch_admin tidak bisa lihat order cabang lain
    if (req.user.role === 'branch_admin' && order.branch_id !== req.user.branch_id) {
      return res.status(403).json({ success: false, message: 'Akses ditolak. Order ini bukan milik cabang Anda.' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, { include: [{ model: ServiceType }] });
    if (!order) return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });

    const { weight_kg, service_type_id, notes } = req.body;
    let updateData = { notes };
    if (weight_kg || service_type_id) {
      const svcId = service_type_id || order.service_type_id;
      const wkg   = weight_kg || order.weight_kg;
      const service = await ServiceType.findByPk(svcId);
      updateData.weight_kg = wkg;
      updateData.service_type_id = svcId;
      updateData.total_price = parseFloat(wkg) * parseFloat(service.price_per_kg);
    }
    await order.update(updateData);
    res.json({ success: true, message: 'Order berhasil diupdate', order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
    if (['diambil'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Order yang sudah diambil tidak bisa dibatalkan' });
    }

    const { reason } = req.body;
    const oldStatus = order.status;
    await order.update({
      status: 'dibatalkan',
      notes: order.notes ? `${order.notes}\n[Dibatalkan: ${reason}]` : `[Dibatalkan: ${reason}]`
    });
    await OrderStatusLog.create({ order_id: order.id, old_status: oldStatus, new_status: 'dibatalkan', changed_by: req.user.id });
    res.json({ success: true, message: 'Order berhasil dibatalkan' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: Customer }, { model: ServiceType }]
    });
    if (!order) return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });

    const oldStatus = order.status;
    await order.update({ status });
    await OrderStatusLog.create({ order_id: order.id, old_status: oldStatus, new_status: status, changed_by: req.user.id });

    // Trigger notifikasi WA "selesai" & award loyalty points saat status = selesai
    if (status === 'selesai') {
      setImmediate(async () => {
        // Kirim WA ready notification
        try {
          const waService = require('../services/whatsappService');
          await waService.sendOrderReadyNotification(order);
        } catch (waErr) {
          console.error('[WA] Gagal kirim notifikasi selesai:', waErr.message);
        }
        // FR-M1: Award loyalty points
        try {
          const loyaltyController = require('./loyaltyController');
          await loyaltyController.awardPoints(order);
        } catch (loyaltyErr) {
          console.error('[Loyalty] Gagal award poin:', loyaltyErr.message);
        }
      });
    }

    res.json({ success: true, message: 'Status berhasil diupdate', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.trackOrder = async (req, res) => {
  try {
    const { order_code } = req.params;
    const order = await Order.findOne({
      where: { order_code },
      include: [
        { model: Customer },
        { model: ServiceType },
        { model: Branch, attributes: ['name', 'address', 'phone'] },
        { model: OrderStatusLog }
      ]
    });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order tidak ditemukan. Periksa kembali kode pesanan Anda.' });
    }

    const nameParts = order.Customer.name.split(' ');
    const maskedName = nameParts.length > 1
      ? `${nameParts[0]} ${nameParts[nameParts.length - 1].charAt(0)}.`
      : order.Customer.name;

    res.json({
      success: true,
      data: {
        order_code: order.order_code,
        customer_name: maskedName,
        service_name: order.ServiceType.name,
        weight_kg: order.weight_kg,
        total_price: order.total_price,
        discount_from_points: order.discount_from_points,
        status: order.status,
        est_finish_date: order.est_finish_date,
        notes: order.notes,
        created_at: order.created_at,
        branch: order.Branch,
        logs: order.OrderStatusLogs
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

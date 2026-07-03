const { Customer, LoyaltyPoint, Order } = require('../models');

// Rasio: 1 poin per Rp 10.000 (dapat dikonfigurasi via env)
const POINTS_PER_RUPIAH = parseFloat(process.env.LOYALTY_POINTS_PER_RUPIAH) || 10000;
const POINT_VALUE_RUPIAH = parseFloat(process.env.LOYALTY_POINT_VALUE) || 1000; // 1 poin = Rp 1.000 diskon

/**
 * Hitung poin yang didapat dari total transaksi.
 */
exports.calculatePoints = (totalPrice) => {
  return Math.floor(parseFloat(totalPrice) / POINTS_PER_RUPIAH);
};

/**
 * Hitung nilai rupiah dari poin yang ditukar.
 */
exports.pointsToRupiah = (points) => {
  return points * POINT_VALUE_RUPIAH;
};

/**
 * FR-M1: Tambah poin ke pelanggan setelah order selesai.
 * Dipanggil dari orderController saat status diubah ke 'selesai'.
 */
exports.awardPoints = async (order) => {
  try {
    const customer = await Customer.findByPk(order.customer_id);
    if (!customer) return;

    const pointsEarned = exports.calculatePoints(order.total_price);
    if (pointsEarned <= 0) return;

    const balanceAfter = customer.total_points + pointsEarned;

    // Tentukan level membership berdasarkan akumulasi total_points baru
    let membershipLevel = 'reguler';
    if (balanceAfter >= 500) membershipLevel = 'gold';
    else if (balanceAfter >= 200) membershipLevel = 'silver';

    await customer.update({ total_points: balanceAfter, membership_level: membershipLevel });
    await LoyaltyPoint.create({
      customer_id: customer.id,
      order_id: order.id,
      points_earned: pointsEarned,
      points_redeemed: 0,
      balance_after: balanceAfter,
      type: 'earned'
    });

    return { pointsEarned, balanceAfter };
  } catch (err) {
    console.error('[Loyalty] Gagal award poin:', err.message);
  }
};

/**
 * FR-M2: Validasi dan kurangi poin pelanggan saat redeem.
 * Dipanggil dari orderController saat order dibuat dengan penukaran poin.
 * Mengembalikan { discount, pointsUsed } atau throw Error jika tidak valid.
 */
exports.redeemPoints = async (customerId, pointsToRedeem, orderId) => {
  const customer = await Customer.findByPk(customerId);
  if (!customer) throw new Error('Pelanggan tidak ditemukan');
  if (pointsToRedeem <= 0) throw new Error('Jumlah poin tidak valid');
  if (customer.total_points < pointsToRedeem) {
    throw new Error(`Poin tidak cukup. Poin tersedia: ${customer.total_points}`);
  }

  const discount = exports.pointsToRupiah(pointsToRedeem);
  const balanceAfter = customer.total_points - pointsToRedeem;

  // Tentukan ulang level membership
  let membershipLevel = 'reguler';
  if (balanceAfter >= 500) membershipLevel = 'gold';
  else if (balanceAfter >= 200) membershipLevel = 'silver';

  await customer.update({ total_points: balanceAfter, membership_level: membershipLevel });
  await LoyaltyPoint.create({
    customer_id: customerId,
    order_id: orderId,
    points_earned: 0,
    points_redeemed: pointsToRedeem,
    balance_after: balanceAfter,
    type: 'redeemed'
  });

  return { discount, pointsUsed: pointsToRedeem, balanceAfter };
};

/**
 * FR-M4: Riwayat poin pelanggan (GET /api/loyalty/:customer_id).
 */
exports.getPointHistory = async (req, res) => {
  try {
    const { customer_id } = req.params;
    const customer = await Customer.findByPk(customer_id, {
      attributes: ['id', 'name', 'phone', 'total_points', 'membership_level']
    });
    if (!customer) return res.status(404).json({ success: false, message: 'Pelanggan tidak ditemukan' });

    const history = await LoyaltyPoint.findAll({
      where: { customer_id },
      include: [{ model: Order, attributes: ['order_code', 'total_price', 'status'] }],
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, data: { customer, history } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * FR-M3: Admin bisa melihat konfigurasi rasio poin (GET /api/loyalty/config).
 */
exports.getConfig = async (req, res) => {
  res.json({
    success: true,
    data: {
      points_per_rupiah: POINTS_PER_RUPIAH,
      point_value_rupiah: POINT_VALUE_RUPIAH,
      membership_thresholds: { silver: 200, gold: 500 }
    }
  });
};

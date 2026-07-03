const { Rating, Order, Customer, Branch } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

/**
 * FR-R1: Submit rating oleh pelanggan via halaman tracking (tanpa login — NFR-R1).
 * POST /api/ratings
 * Body: { order_code, rating (1-5), comment? }
 */
exports.submitRating = async (req, res) => {
  try {
    const { order_code, rating, comment } = req.body;

    if (!order_code || !rating) {
      return res.status(400).json({ success: false, message: 'Kode order dan rating wajib diisi' });
    }

    const ratingVal = parseInt(rating, 10);
    if (ratingVal < 1 || ratingVal > 5) {
      return res.status(400).json({ success: false, message: 'Rating harus antara 1 sampai 5' });
    }

    const order = await Order.findOne({
      where: { order_code },
      include: [{ model: Customer, attributes: ['id', 'name'] }]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
    }

    // Hanya bisa dirating setelah selesai atau diambil
    if (!['selesai', 'diambil'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Rating hanya tersedia setelah cucian selesai' });
    }

    // FR-R2: Cek duplikasi rating
    const existingRating = await Rating.findOne({ where: { order_id: order.id } });
    if (existingRating) {
      return res.status(409).json({ success: false, message: 'Anda sudah memberikan rating untuk pesanan ini' });
    }

    // FR-R4: Tandai otomatis jika rating rendah (≤2)
    const is_flagged = ratingVal <= 2;

    const newRating = await Rating.create({
      order_id: order.id,
      customer_id: order.customer_id,
      branch_id: order.branch_id,
      rating: ratingVal,
      comment: comment || null,
      is_flagged
    });

    res.status(201).json({
      success: true,
      message: 'Terima kasih atas penilaian Anda!',
      data: newRating
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * FR-R3: Admin/Owner melihat daftar & rekap rating.
 * GET /api/ratings?branch_id=&flagged_only=&page=
 */
exports.getRatings = async (req, res) => {
  try {
    const { branch_id, flagged_only, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    // FR-B3: branch_admin hanya bisa lihat cabangnya sendiri
    if (req.user.role === 'branch_admin') {
      where.branch_id = req.user.branch_id;
    } else if (branch_id) {
      where.branch_id = branch_id;
    }

    // FR-R4: filter rating rendah
    if (flagged_only === 'true') where.is_flagged = true;

    const result = await Rating.findAndCountAll({
      where,
      include: [
        { model: Order, attributes: ['order_code', 'total_price', 'status'] },
        { model: Customer, attributes: ['name', 'phone'] },
        { model: Branch, attributes: ['name'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    // Rekap statistik
    const allRatings = await Rating.findAll({ where, attributes: ['rating'] });
    const avgRating = allRatings.length
      ? (allRatings.reduce((s, r) => s + r.rating, 0) / allRatings.length).toFixed(2)
      : 0;

    const distribution = [1, 2, 3, 4, 5].reduce((acc, star) => {
      acc[star] = allRatings.filter(r => r.rating === star).length;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        ratings: result.rows,
        totalItems: result.count,
        totalPages: Math.ceil(result.count / parseInt(limit)),
        currentPage: parseInt(page),
        summary: { average: avgRating, distribution, total: allRatings.length }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Cek apakah order sudah dirating (digunakan di halaman tracking).
 * GET /api/ratings/check/:order_code
 */
exports.checkRating = async (req, res) => {
  try {
    const order = await Order.findOne({ where: { order_code: req.params.order_code } });
    if (!order) return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });

    const existing = await Rating.findOne({ where: { order_id: order.id } });
    res.json({
      success: true,
      data: {
        has_rated: !!existing,
        rating: existing ? existing.rating : null,
        comment: existing ? existing.comment : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * FR-R4: Admin/Owner menandai/membuka tanda rating.
 * PATCH /api/ratings/:id/flag
 */
exports.toggleFlag = async (req, res) => {
  try {
    const ratingRecord = await Rating.findByPk(req.params.id);
    if (!ratingRecord) return res.status(404).json({ success: false, message: 'Rating tidak ditemukan' });

    await ratingRecord.update({ is_flagged: !ratingRecord.is_flagged });
    res.json({ success: true, message: `Rating berhasil ${ratingRecord.is_flagged ? 'ditandai' : 'dibuka tandanya'}`, data: ratingRecord });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const { ServiceType, User, sequelize } = require('../models');
const bcrypt = require('bcrypt');

// -- SERVICES --
exports.getServices = async (req, res) => {
  try {
    const services = await ServiceType.findAll({ order: [['id', 'ASC']] });
    res.json({ success: true, services });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
};

exports.createService = async (req, res) => {
  try {
    const { name, price_per_kg, est_days } = req.body;
    const service = await ServiceType.create({ name, price_per_kg, est_days });
    res.status(201).json({ success: true, service });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
};

exports.updateService = async (req, res) => {
  try {
    const service = await ServiceType.findByPk(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Layanan tidak ditemukan' });
    await service.update(req.body);
    res.json({ success: true, service });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
};

// -- USERS --
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] }, order: [['id', 'ASC']] });
    res.json({ success: true, users });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role });
    res.status(201).json({ success: true, user: { id: user.id, name, email, role } });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    const { name, role, is_active, password } = req.body;
    const updateData = { name, role, is_active };
    if (password) updateData.password = await bcrypt.hash(password, 10);
    await user.update(updateData);
    res.json({ success: true, user: { id: user.id, name: user.name, role: user.role, is_active: user.is_active } });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
};

// -- OUTLET INFO (from env) --
exports.getOutletInfo = async (req, res) => {
  res.json({
    success: true,
    outlet: {
      name: process.env.OUTLET_NAME || 'KiloWash Laundry',
      address: process.env.OUTLET_ADDRESS || 'Belum diatur',
      phone: process.env.OUTLET_PHONE || 'Belum diatur',
      wa_sender: process.env.WA_SENDER || 'Belum diatur',
      operational_hours: process.env.OUTLET_HOURS || '07.00 – 21.00'
    }
  });
};

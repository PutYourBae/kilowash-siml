const { Branch, User } = require('../models');

// FR-B1: CRUD Cabang (hanya Owner)

exports.getBranches = async (req, res) => {
  try {
    const branches = await Branch.findAll({ order: [['created_at', 'ASC']] });
    res.json({ success: true, data: branches });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getBranchById = async (req, res) => {
  try {
    const branch = await Branch.findByPk(req.params.id);
    if (!branch) return res.status(404).json({ success: false, message: 'Cabang tidak ditemukan' });
    res.json({ success: true, data: branch });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createBranch = async (req, res) => {
  try {
    const { name, address, phone } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Nama cabang wajib diisi' });

    const branch = await Branch.create({ name, address, phone });
    res.status(201).json({ success: true, message: 'Cabang berhasil ditambahkan', data: branch });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateBranch = async (req, res) => {
  try {
    const branch = await Branch.findByPk(req.params.id);
    if (!branch) return res.status(404).json({ success: false, message: 'Cabang tidak ditemukan' });

    const { name, address, phone, is_active } = req.body;
    await branch.update({ name, address, phone, is_active });
    res.json({ success: true, message: 'Cabang berhasil diupdate', data: branch });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteBranch = async (req, res) => {
  try {
    const branch = await Branch.findByPk(req.params.id);
    if (!branch) return res.status(404).json({ success: false, message: 'Cabang tidak ditemukan' });

    // Soft-delete: nonaktifkan saja agar data histori tidak hilang
    await branch.update({ is_active: false });
    res.json({ success: true, message: 'Cabang berhasil dinonaktifkan' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

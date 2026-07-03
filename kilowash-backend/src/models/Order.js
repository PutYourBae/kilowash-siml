const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  service_type_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  // FK ke cabang asal order (FR-B2)
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  weight_kg: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  // Diskon dari penukaran poin (FR-M2)
  discount_from_points: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  // Jumlah poin yang ditukar pada order ini
  points_redeemed: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('diterima', 'proses', 'selesai', 'diambil', 'dibatalkan'),
    defaultValue: 'diterima'
  },
  est_finish_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Order;

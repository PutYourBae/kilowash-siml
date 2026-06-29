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
  weight_kg: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('diterima', 'proses', 'selesai', 'diambil'),
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

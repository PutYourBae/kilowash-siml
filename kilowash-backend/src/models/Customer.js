const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  // Total poin aktif yang dimiliki pelanggan saat ini
  total_points: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // Level membership berdasarkan akumulasi transaksi
  membership_level: {
    type: DataTypes.ENUM('reguler', 'silver', 'gold'),
    defaultValue: 'reguler'
  }
}, {
  tableName: 'customers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Customer;

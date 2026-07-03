const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LoyaltyPoint = sequelize.define('LoyaltyPoint', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  // Poin diperoleh pada transaksi ini (positif)
  points_earned: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // Poin ditukar/digunakan pada transaksi ini (positif = jumlah yang dipakai)
  points_redeemed: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // Saldo poin setelah transaksi ini
  balance_after: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('earned', 'redeemed'),
    allowNull: false,
    defaultValue: 'earned'
  }
}, {
  tableName: 'loyalty_points',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = LoyaltyPoint;

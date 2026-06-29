const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  amount_paid: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  change_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  payment_method: {
    type: DataTypes.ENUM('tunai', 'transfer', 'qris'),
    allowNull: false
  },
  paid_by: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'payments',
  timestamps: true,
  createdAt: 'paid_at',
  updatedAt: false
});

module.exports = Payment;

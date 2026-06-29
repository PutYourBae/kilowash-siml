const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderStatusLog = sequelize.define('OrderStatusLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  old_status: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  new_status: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  changed_by: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'order_status_logs',
  timestamps: true,
  createdAt: 'changed_at',
  updatedAt: false
});

module.exports = OrderStatusLog;

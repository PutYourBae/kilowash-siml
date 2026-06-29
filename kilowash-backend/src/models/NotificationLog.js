const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NotificationLog = sequelize.define('NotificationLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('terkirim', 'gagal'),
    allowNull: false
  }
}, {
  tableName: 'notification_logs',
  timestamps: true,
  createdAt: 'sent_at',
  updatedAt: false
});

module.exports = NotificationLog;

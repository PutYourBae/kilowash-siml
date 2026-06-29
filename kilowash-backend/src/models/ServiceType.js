const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ServiceType = sequelize.define('ServiceType', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  price_per_kg: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  est_days: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'service_types',
  timestamps: false
});

module.exports = ServiceType;

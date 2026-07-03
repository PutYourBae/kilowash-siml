const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rating = sequelize.define('Rating', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true // FR-R2: satu order hanya bisa dapat satu rating
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_flagged: {
    type: DataTypes.BOOLEAN,
    defaultValue: false // FR-R4: untuk menandai feedback dengan rating rendah
  }
}, {
  tableName: 'ratings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Rating;

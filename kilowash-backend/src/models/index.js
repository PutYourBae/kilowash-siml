const sequelize = require('../config/database');
const User = require('./User');
const Customer = require('./Customer');
const ServiceType = require('./ServiceType');
const Order = require('./Order');
const OrderStatusLog = require('./OrderStatusLog');
const Payment = require('./Payment');
const NotificationLog = require('./NotificationLog');

// Define associations

// Order <-> Customer
Customer.hasMany(Order, { foreignKey: 'customer_id' });
Order.belongsTo(Customer, { foreignKey: 'customer_id' });

// Order <-> ServiceType
ServiceType.hasMany(Order, { foreignKey: 'service_type_id' });
Order.belongsTo(ServiceType, { foreignKey: 'service_type_id' });

// Order <-> User (Created By)
User.hasMany(Order, { foreignKey: 'created_by' });
Order.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Order <-> OrderStatusLog
Order.hasMany(OrderStatusLog, { foreignKey: 'order_id' });
OrderStatusLog.belongsTo(Order, { foreignKey: 'order_id' });

// OrderStatusLog <-> User (Changed By)
User.hasMany(OrderStatusLog, { foreignKey: 'changed_by' });
OrderStatusLog.belongsTo(User, { foreignKey: 'changed_by', as: 'changer' });

// Order <-> Payment
Order.hasOne(Payment, { foreignKey: 'order_id' });
Payment.belongsTo(Order, { foreignKey: 'order_id' });

// Payment <-> User (Paid By)
User.hasMany(Payment, { foreignKey: 'paid_by' });
Payment.belongsTo(User, { foreignKey: 'paid_by', as: 'cashier' });

// Order <-> NotificationLog
Order.hasMany(NotificationLog, { foreignKey: 'order_id' });
NotificationLog.belongsTo(Order, { foreignKey: 'order_id' });

module.exports = {
  sequelize,
  User,
  Customer,
  ServiceType,
  Order,
  OrderStatusLog,
  Payment,
  NotificationLog
};

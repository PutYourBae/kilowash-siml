const sequelize = require('../config/database');
const User = require('./User');
const Customer = require('./Customer');
const ServiceType = require('./ServiceType');
const Order = require('./Order');
const OrderStatusLog = require('./OrderStatusLog');
const Payment = require('./Payment');
const NotificationLog = require('./NotificationLog');
// v2 — new models
const Branch = require('./Branch');
const LoyaltyPoint = require('./LoyaltyPoint');
const Rating = require('./Rating');

// ─── v1 Associations ────────────────────────────────────────────

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

// ─── v2 Associations ────────────────────────────────────────────

// Branch <-> Order (FR-B2)
Branch.hasMany(Order, { foreignKey: 'branch_id' });
Order.belongsTo(Branch, { foreignKey: 'branch_id' });

// Branch <-> User (branch_admin terikat ke cabang)
Branch.hasMany(User, { foreignKey: 'branch_id' });
User.belongsTo(Branch, { foreignKey: 'branch_id' });

// Customer <-> LoyaltyPoint
Customer.hasMany(LoyaltyPoint, { foreignKey: 'customer_id' });
LoyaltyPoint.belongsTo(Customer, { foreignKey: 'customer_id' });

// Order <-> LoyaltyPoint
Order.hasMany(LoyaltyPoint, { foreignKey: 'order_id' });
LoyaltyPoint.belongsTo(Order, { foreignKey: 'order_id' });

// Order <-> Rating (one-to-one, unique per order — FR-R2)
Order.hasOne(Rating, { foreignKey: 'order_id' });
Rating.belongsTo(Order, { foreignKey: 'order_id' });

// Customer <-> Rating
Customer.hasMany(Rating, { foreignKey: 'customer_id' });
Rating.belongsTo(Customer, { foreignKey: 'customer_id' });

// Branch <-> Rating
Branch.hasMany(Rating, { foreignKey: 'branch_id' });
Rating.belongsTo(Branch, { foreignKey: 'branch_id' });

module.exports = {
  sequelize,
  User,
  Customer,
  ServiceType,
  Order,
  OrderStatusLog,
  Payment,
  NotificationLog,
  // v2
  Branch,
  LoyaltyPoint,
  Rating
};

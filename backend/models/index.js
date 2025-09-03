const User = require('./User');
const Business = require('./Business');
const Subscription = require('./Subscription');
const Payment = require('./Payment');
const Sale = require('./Sale');
const Message = require('./Message');

// User associations
User.hasOne(Business, { foreignKey: 'owner_id', as: 'business' });
User.hasOne(Subscription, { foreignKey: 'user_id', as: 'subscription' });
User.hasMany(Payment, { foreignKey: 'user_id', as: 'payments' });
User.hasMany(Sale, { foreignKey: 'user_id', as: 'sales' });
User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'recipient_id', as: 'receivedMessages' });

// Business associations
Business.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });
Business.hasMany(Sale, { foreignKey: 'business_id', as: 'sales' });

// Subscription associations
Subscription.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Subscription.hasMany(Payment, { foreignKey: 'subscription_id', as: 'payments' });

// Payment associations
Payment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Payment.belongsTo(Subscription, { foreignKey: 'subscription_id', as: 'subscription' });

// Sale associations
Sale.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Sale.belongsTo(Business, { foreignKey: 'business_id', as: 'business' });

// Message associations
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'recipient_id', as: 'recipient' });

module.exports = {
  User,
  Business,
  Subscription,
  Payment,
  Sale,
  Message
};

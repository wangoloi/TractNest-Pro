// Subscription service functions

// Function to get subscription plans
export const getSubscriptionPlans = () => {
  return [
    {
      id: 'premium',
      name: 'Premium',
      description: 'Full access to all features',
      features: [
        'Unlimited sales tracking',
        'Inventory management',
        'Customer management',
        'Advanced reporting',
        'Multi-user access',
        'Priority support'
      ]
    }
  ];
};

// Function to get billing cycles
export const getBillingCycles = () => {
  return [
    { id: 'weekly', name: 'Weekly', days: 7 },
    { id: 'monthly', name: 'Monthly', days: 30 },
    { id: 'annual', name: 'Annual', days: 365 }
  ];
};

// Function to calculate subscription expiry date
export const calculateExpiryDate = (billingCycle) => {
  const now = new Date();
  const expiryDate = new Date(now);
  
  switch (billingCycle) {
    case 'weekly':
      expiryDate.setDate(now.getDate() + 7);
      break;
    case 'monthly':
      expiryDate.setMonth(now.getMonth() + 1);
      break;
    case 'annual':
      expiryDate.setFullYear(now.getFullYear() + 1);
      break;
    default:
      expiryDate.setMonth(now.getMonth() + 1);
  }
  
  return expiryDate.toISOString().split('T')[0];
};

// Function to get payment methods
export const getPaymentMethods = () => {
  return [
    {
      id: 'credit_card',
      name: 'Credit Card',
      icon: 'CreditCard',
      description: 'Pay with Visa, MasterCard, or American Express'
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      icon: 'Building2',
      description: 'Direct bank transfer to our account'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: 'CreditCard',
      description: 'Pay with your PayPal account'
    },
    {
      id: 'mobile_money',
      name: 'Mobile Money',
      icon: 'Smartphone',
      description: 'Pay with mobile money services'
    },
    {
      id: 'cryptocurrency',
      name: 'Cryptocurrency',
      icon: 'Bitcoin',
      description: 'Pay with Bitcoin, Ethereum, or other cryptocurrencies'
    }
  ];
};

// Function to validate subscription data
export const validateSubscriptionData = (subscriptionData) => {
  const { plan, billingCycle, amount } = subscriptionData;
  
  if (!plan) {
    throw new Error('Subscription plan is required');
  }
  
  if (!billingCycle) {
    throw new Error('Billing cycle is required');
  }
  
  if (!amount || amount <= 0) {
    throw new Error('Valid subscription amount is required');
  }
  
  return true;
};

// Function to create subscription object
export const createSubscription = (plan, billingCycle, amount, paymentMethod) => {
  const expiryDate = calculateExpiryDate(billingCycle);
  
  return {
    plan,
    billingCycle,
    amount,
    paymentMethod,
    status: 'active',
    startDate: new Date().toISOString().split('T')[0],
    expiryDate,
    nextPayment: expiryDate,
    paymentHistory: [
      {
        date: new Date().toISOString().split('T')[0],
        amount,
        method: paymentMethod,
        status: 'completed'
      }
    ]
  };
};

// Function to check if subscription is active
export const isSubscriptionActive = (subscription) => {
  if (!subscription || subscription.status !== 'active') {
    return false;
  }
  
  const today = new Date();
  const expiryDate = new Date(subscription.expiryDate);
  
  return today <= expiryDate;
};

// Function to get subscription status
export const getSubscriptionStatus = (subscription) => {
  if (!subscription) {
    return 'inactive';
  }
  
  if (subscription.status === 'cancelled') {
    return 'cancelled';
  }
  
  if (subscription.status === 'trial') {
    return 'trial';
  }
  
  if (isSubscriptionActive(subscription)) {
    return 'active';
  }
  
  return 'expired';
};

// Function to get days until expiry
export const getDaysUntilExpiry = (subscription) => {
  if (!subscription || !subscription.expiryDate) {
    return 0;
  }
  
  const today = new Date();
  const expiryDate = new Date(subscription.expiryDate);
  const diffTime = expiryDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};

// Function to format subscription amount
export const formatSubscriptionAmount = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Function to get subscription summary
export const getSubscriptionSummary = (subscription) => {
  if (!subscription) {
    return {
      status: 'No Subscription',
      statusColor: 'text-gray-600 bg-gray-100',
      daysLeft: 0,
      amount: 0
    };
  }
  
  const status = getSubscriptionStatus(subscription);
  const daysLeft = getDaysUntilExpiry(subscription);
  
  let statusColor = 'text-gray-600 bg-gray-100';
  switch (status) {
    case 'active':
      statusColor = 'text-green-600 bg-green-100';
      break;
    case 'trial':
      statusColor = 'text-blue-600 bg-blue-100';
      break;
    case 'expired':
      statusColor = 'text-orange-600 bg-orange-100';
      break;
    case 'cancelled':
      statusColor = 'text-red-600 bg-red-100';
      break;
  }
  
  return {
    status: status.charAt(0).toUpperCase() + status.slice(1),
    statusColor,
    daysLeft,
    amount: subscription.amount || 0
  };
};

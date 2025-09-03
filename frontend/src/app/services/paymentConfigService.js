// Payment configuration service functions

// Function to get payment configuration from localStorage
export const getPaymentConfig = () => {
  try {
    const stored = localStorage.getItem('tracknest_payment_config');
    if (stored) {
      return JSON.parse(stored);
    }
    return getDefaultPaymentConfig();
  } catch (error) {
    console.error('Error loading payment config:', error);
    return getDefaultPaymentConfig();
  }
};

// Function to save payment configuration to localStorage
export const savePaymentConfig = (config) => {
  try {
    localStorage.setItem('tracknest_payment_config', JSON.stringify(config));
    console.log('💾 Payment config saved:', config);
  } catch (error) {
    console.error('Error saving payment config:', error);
  }
};

// Function to get default payment configuration
export const getDefaultPaymentConfig = () => {
  return {
    creditCard: {
      enabled: false,
      accountName: '',
      accountNumber: '',
      bankName: '',
      swiftCode: '',
      routingNumber: ''
    },
    bankTransfer: {
      enabled: false,
      accountName: '',
      accountNumber: '',
      bankName: '',
      swiftCode: '',
      routingNumber: ''
    },
    paypal: {
      enabled: false,
      email: '',
      businessName: ''
    },
    mobileMoney: {
      enabled: false,
      provider: '',
      phoneNumber: '',
      accountName: ''
    },
    cryptocurrency: {
      enabled: false,
      walletAddress: '',
      network: '',
      currency: ''
    }
  };
};

// Function to validate payment configuration
export const validatePaymentConfig = (config) => {
  const errors = [];
  
  Object.entries(config).forEach(([method, settings]) => {
    if (settings.enabled) {
      switch (method) {
        case 'creditCard':
        case 'bankTransfer':
          if (!settings.accountName) {
            errors.push(`${method} account name is required`);
          }
          if (!settings.accountNumber) {
            errors.push(`${method} account number is required`);
          }
          if (!settings.bankName) {
            errors.push(`${method} bank name is required`);
          }
          break;
        case 'paypal':
          if (!settings.email) {
            errors.push('PayPal email is required');
          }
          if (!settings.businessName) {
            errors.push('PayPal business name is required');
          }
          break;
        case 'mobileMoney':
          if (!settings.provider) {
            errors.push('Mobile money provider is required');
          }
          if (!settings.phoneNumber) {
            errors.push('Mobile money phone number is required');
          }
          if (!settings.accountName) {
            errors.push('Mobile money account name is required');
          }
          break;
        case 'cryptocurrency':
          if (!settings.walletAddress) {
            errors.push('Cryptocurrency wallet address is required');
          }
          if (!settings.network) {
            errors.push('Cryptocurrency network is required');
          }
          if (!settings.currency) {
            errors.push('Cryptocurrency currency is required');
          }
          break;
      }
    }
  });
  
  return errors;
};

// Function to get enabled payment methods
export const getEnabledPaymentMethods = (config) => {
  return Object.entries(config)
    .filter(([_, settings]) => settings.enabled)
    .map(([method, settings]) => ({
      method,
      ...settings
    }));
};

// Function to format payment method display
export const formatPaymentMethodDisplay = (method, settings) => {
  switch (method) {
    case 'creditCard':
      return `${settings.bankName} - ${settings.accountName}`;
    case 'bankTransfer':
      return `${settings.bankName} - ${settings.accountName}`;
    case 'paypal':
      return `${settings.businessName} (${settings.email})`;
    case 'mobileMoney':
      return `${settings.provider} - ${settings.phoneNumber}`;
    case 'cryptocurrency':
      return `${settings.currency} (${settings.network})`;
    default:
      return method;
  }
};

// Function to get payment method icon
export const getPaymentMethodIcon = (method) => {
  switch (method) {
    case 'creditCard':
      return 'CreditCard';
    case 'bankTransfer':
      return 'Building2';
    case 'paypal':
      return 'CreditCard';
    case 'mobileMoney':
      return 'Smartphone';
    case 'cryptocurrency':
      return 'Bitcoin';
    default:
      return 'CreditCard';
  }
};

// Function to get payment method description
export const getPaymentMethodDescription = (method) => {
  switch (method) {
    case 'creditCard':
      return 'Pay with Visa, MasterCard, or American Express';
    case 'bankTransfer':
      return 'Direct bank transfer to our account';
    case 'paypal':
      return 'Pay with your PayPal account';
    case 'mobileMoney':
      return 'Pay with mobile money services';
    case 'cryptocurrency':
      return 'Pay with Bitcoin, Ethereum, or other cryptocurrencies';
    default:
      return 'Payment method';
  }
};

// Pricing configuration service functions

// Function to get pricing configuration from localStorage
export const getPricingConfig = () => {
  try {
    const stored = localStorage.getItem('tracknest_pricing_config');
    if (stored) {
      return JSON.parse(stored);
    }
    return getDefaultPricingConfig();
  } catch (error) {
    console.error('Error loading pricing config:', error);
    return getDefaultPricingConfig();
  }
};

// Function to save pricing configuration to localStorage
export const savePricingConfig = (config) => {
  try {
    localStorage.setItem('tracknest_pricing_config', JSON.stringify(config));
    console.log('💾 Pricing config saved:', config);
  } catch (error) {
    console.error('Error saving pricing config:', error);
  }
};

// Function to get default pricing configuration
export const getDefaultPricingConfig = () => {
  return {
    premium: {
      weekly: {
        price: 9.99,
        currency: 'USD',
        description: 'Weekly Premium Plan'
      },
      monthly: {
        price: 29.99,
        currency: 'USD',
        description: 'Monthly Premium Plan'
      },
      annual: {
        price: 299.99,
        currency: 'USD',
        description: 'Annual Premium Plan'
      }
    }
  };
};

// Function to validate pricing configuration
export const validatePricingConfig = (config) => {
  const errors = [];
  
  Object.entries(config).forEach(([plan, cycles]) => {
    Object.entries(cycles).forEach(([cycle, pricing]) => {
      if (!pricing.price || pricing.price <= 0) {
        errors.push(`${plan} ${cycle} price must be greater than 0`);
      }
      if (!pricing.currency) {
        errors.push(`${plan} ${cycle} currency is required`);
      }
      if (!pricing.description) {
        errors.push(`${plan} ${cycle} description is required`);
      }
    });
  });
  
  return errors;
};

// Function to get plan pricing
export const getPlanPricing = (config, plan = 'premium') => {
  return config[plan] || getDefaultPricingConfig()[plan];
};

// Function to get cycle pricing
export const getCyclePricing = (config, plan = 'premium', cycle) => {
  const planPricing = getPlanPricing(config, plan);
  return planPricing[cycle];
};

// Function to format price
export const formatPrice = (price, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(price);
};

// Function to calculate savings percentage
export const calculateSavings = (monthlyPrice, annualPrice) => {
  const monthlyTotal = monthlyPrice * 12;
  const savings = monthlyTotal - annualPrice;
  const savingsPercentage = (savings / monthlyTotal) * 100;
  return Math.round(savingsPercentage);
};

// Function to get pricing comparison
export const getPricingComparison = (config, plan = 'premium') => {
  const planPricing = getPlanPricing(config, plan);
  
  const weekly = planPricing.weekly;
  const monthly = planPricing.monthly;
  const annual = planPricing.annual;
  
  const weeklyMonthly = (weekly.price * 4) / monthly.price;
  const monthlyAnnual = (monthly.price * 12) / annual.price;
  
  return {
    weekly,
    monthly,
    annual,
    weeklyMonthly,
    monthlyAnnual,
    annualSavings: calculateSavings(monthly.price, annual.price)
  };
};

// Function to get recommended plan
export const getRecommendedPlan = (config, plan = 'premium') => {
  const comparison = getPricingComparison(config, plan);
  
  if (comparison.annualSavings > 15) {
    return {
      cycle: 'annual',
      reason: `Save ${comparison.annualSavings}% compared to monthly billing`,
      price: comparison.annual.price
    };
  } else if (comparison.weeklyMonthly > 1.1) {
    return {
      cycle: 'monthly',
      reason: 'Best value for monthly billing',
      price: comparison.monthly.price
    };
  } else {
    return {
      cycle: 'weekly',
      reason: 'Flexible weekly billing',
      price: comparison.weekly.price
    };
  }
};

// Function to get pricing display data
export const getPricingDisplayData = (config, plan = 'premium') => {
  const planPricing = getPlanPricing(config, plan);
  const comparison = getPricingComparison(config, plan);
  const recommended = getRecommendedPlan(config, plan);
  
  return {
    plan,
    cycles: Object.entries(planPricing).map(([cycle, pricing]) => ({
      cycle,
      price: pricing.price,
      currency: pricing.currency,
      description: pricing.description,
      formattedPrice: formatPrice(pricing.price, pricing.currency),
      isRecommended: recommended.cycle === cycle,
      savings: cycle === 'annual' ? comparison.annualSavings : null
    })),
    recommended
  };
};

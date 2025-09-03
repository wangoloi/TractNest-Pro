/**
 * Get the current currency setting from localStorage
 * @returns {string} - The currency code (e.g., 'UGX', 'USD', 'EUR', 'GBP')
 */
export function getCurrentCurrency() {
  try {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      const settingsData = JSON.parse(savedSettings);
      const currencySetting = settingsData.find(setting => setting.setting_key === 'default_currency');
      return currencySetting ? currencySetting.setting_value : 'UGX';
    }
  } catch (error) {
    console.warn('Error reading currency setting:', error);
  }
  return 'UGX'; // Default to UGX
}

/**
 * Get currency symbol and formatting options
 * @param {string} currencyCode - The currency code
 * @returns {object} - Currency configuration object
 */
export function getCurrencyConfig(currencyCode = null) {
  const currency = currencyCode || getCurrentCurrency();
  
  const configs = {
    'UGX': {
      symbol: 'UGX',
      locale: 'en-UG',
      position: 'before',
      decimalPlaces: 0,
      thousandsSeparator: ',',
      decimalSeparator: '.'
    },
    'USD': {
      symbol: '$',
      locale: 'en-US',
      position: 'before',
      decimalPlaces: 2,
      thousandsSeparator: ',',
      decimalSeparator: '.'
    },
    'EUR': {
      symbol: '€',
      locale: 'en-EU',
      position: 'before',
      decimalPlaces: 2,
      thousandsSeparator: '.',
      decimalSeparator: ','
    },
    'GBP': {
      symbol: '£',
      locale: 'en-GB',
      position: 'before',
      decimalPlaces: 2,
      thousandsSeparator: ',',
      decimalSeparator: '.'
    }
  };
  
  return configs[currency] || configs['UGX'];
}

/**
 * Format a number with commas as thousands separators
 * @param {number} num - The number to format
 * @returns {string} - The formatted number as a string
 */
export function formatNumber(num) {
  // Handle invalid inputs
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }
  
  // Convert to number if it's a string
  const number = typeof num === 'string' ? parseFloat(num) : num;
  
  // Check if conversion was successful
  if (isNaN(number)) {
    return '0';
  }
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(number);
}

/**
 * Format a number as currency using the current app settings
 * @param {number} amount - The amount to format
 * @param {string} currencyCode - Optional currency code override
 * @param {boolean} showSymbol - Whether to show the currency symbol
 * @returns {string} - The formatted currency string
 */
export function formatCurrency(amount, currencyCode = null, showSymbol = true) {
  // Handle invalid inputs
  if (amount === null || amount === undefined || isNaN(amount)) {
    amount = 0;
  }
  
  // Convert to number if it's a string
  const number = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Check if conversion was successful
  if (isNaN(number)) {
    amount = 0;
  }
  
  const config = getCurrencyConfig(currencyCode);
  
  // Format the number
  const formattedNumber = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: config.decimalPlaces,
    maximumFractionDigits: config.decimalPlaces,
    useGrouping: true
  }).format(Math.abs(number));
  
  // Add currency symbol
  if (showSymbol) {
    return config.position === 'before' 
      ? `${config.symbol} ${formattedNumber}`
      : `${formattedNumber} ${config.symbol}`;
  }
  
  return formattedNumber;
}

/**
 * Format a number as currency with the current app currency setting
 * @param {number} amount - The amount to format
 * @param {boolean} showSymbol - Whether to show the currency symbol
 * @returns {string} - The formatted currency string
 */
export function formatAppCurrency(amount, showSymbol = true) {
  return formatCurrency(amount, null, showSymbol);
}

/**
 * Parse a currency string back to a number
 * @param {string} currencyString - The currency string to parse
 * @param {string} currencyCode - The currency code
 * @returns {number} - The parsed number
 */
export function parseCurrency(currencyString, currencyCode = null) {
  if (!currencyString || typeof currencyString !== 'string') {
    return 0;
  }
  
  const config = getCurrencyConfig(currencyCode);
  
  // Remove currency symbol and spaces
  let cleanString = currencyString.replace(config.symbol, '').trim();
  
  // Remove thousands separators
  cleanString = cleanString.replace(new RegExp(`\\${config.thousandsSeparator}`, 'g'), '');
  
  // Replace decimal separator with standard decimal point
  if (config.decimalSeparator !== '.') {
    cleanString = cleanString.replace(config.decimalSeparator, '.');
  }
  
  const parsed = parseFloat(cleanString);
  return isNaN(parsed) ? 0 : parsed;
}

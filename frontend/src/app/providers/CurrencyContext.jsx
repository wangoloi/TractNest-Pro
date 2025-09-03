import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentCurrency, getCurrencyConfig } from '../../lib/utils/formatNumber';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [currentCurrency, setCurrentCurrency] = useState('UGX');
  const [currencyConfig, setCurrencyConfig] = useState(getCurrencyConfig('UGX'));

  // Listen for changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const newCurrency = getCurrentCurrency();
      setCurrentCurrency(newCurrency);
      setCurrencyConfig(getCurrencyConfig(newCurrency));
    };

    // Check currency on mount
    handleStorageChange();

    // Listen for storage events
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically for changes (in case localStorage is updated from same window)
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const updateCurrency = (newCurrency) => {
    setCurrentCurrency(newCurrency);
    setCurrencyConfig(getCurrencyConfig(newCurrency));
  };

  const value = {
    currentCurrency,
    currencyConfig,
    updateCurrency,
    getCurrencyConfig: (currency = null) => getCurrencyConfig(currency || currentCurrency)
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

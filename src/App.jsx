import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import './App.css';
// Import components
import StockingPlus from './components/StockingPlus';
import SalesPlus from './components/SalesPlus';
import MySales from './components/MySales';
import MyStock from './components/MyStock';

function App() {
  // State for active tab
  const [activeTab, setActiveTab] = useState('Dashboard');

  // Manage stock items
  const [stockItems, setStockItems] = useState([]);

  // Manage receipts and total stock amount
  const [receipts, setReceipts] = useState([]);
  const [totalStockAmount, setTotalStockAmount] = useState(0);

  // Manage sales records and total sales/profits
  const [salesRecords, setSalesRecords] = useState([]);
  const [totalSales, setTotalSales] = useState({ amount: 0, profit: 0 });
  // console.log(receipts, 'THERERERER');
  // Create stock data map from receipts for SalesPlus component
  const stockData = receipts.reduce((acc, receipt) => {
    if (receipt.items) {
      receipt.items.forEach(item => {
        // Use the latest price for each item
        acc[item.name] = item.price;
      });
    }
    return acc;
  }, {});

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="app-container">
      <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="content-area">
        {activeTab === 'Dashboard' && <Dashboard />}

        {activeTab === 'StockingPlus' && (
          <StockingPlus
            setStockItems={setStockItems}
            stockItems={stockItems}
            receipts={receipts}
            setReceipts={setReceipts}
            totalStockAmount={totalStockAmount}
            setTotalStockAmount={setTotalStockAmount}
          />
        )}

        {activeTab === 'SalesPlus' && (
          <SalesPlus
            salesRecords={salesRecords}
            setSalesRecords={setSalesRecords}
            totalSales={totalSales}
            setTotalSales={setTotalSales}
            stockData={stockData}
            stockItems={stockItems}
            setStockItems={setStockItems}
          />
        )}

        {activeTab === 'MyStock' && (
          <MyStock
            stockItems={stockItems}
            receipts={receipts}
            totalStockAmount={totalStockAmount}
          />
        )}

        {activeTab === 'MySales' && <MySales salesRecords={salesRecords} />}
      </div>
    </div>
  );
}

export default App;
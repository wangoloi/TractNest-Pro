import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/auth';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import StockingPlus from './components/stocking/StockingPlus';
import SalesPlus from './components/sales/SalesPlus';
import MySales from './components/sales/MySales';
import MyStock from './components/stocking/MyStock';
import Login from './pages/Login';
import Notifications from './pages/Notifications';
import Statements from './pages/Statements';
import './App.css';



// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  // State for stock items
  const [stockItems, setStockItems] = React.useState([]);

  // State for receipts and total stock amount
  const [receipts, setReceipts] = React.useState([]);
  const [totalStockAmount, setTotalStockAmount] = React.useState(0);

  // State for sales records and total sales/profits
  const [salesRecords, setSalesRecords] = React.useState([]);
  const [totalSales, setTotalSales] = React.useState({
    amount: 0,
    profit: 0,
  });

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

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout stockItems={stockItems} />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route
          path="stocking"
          element={
            <StockingPlus
              setStockItems={setStockItems}
              stockItems={stockItems}
              receipts={receipts}
              setReceipts={setReceipts}
              totalStockAmount={totalStockAmount}
              setTotalStockAmount={setTotalStockAmount}
            />
          }
        />
        <Route
          path="sales"
          element={
            <SalesPlus
              salesRecords={salesRecords}
              setSalesRecords={setSalesRecords}
              totalSales={totalSales}
              setTotalSales={setTotalSales}
              stockData={stockData}
              stockItems={stockItems}
              setStockItems={setStockItems}
            />
          }
        />
        <Route
          path="my-stock"
          element={
            <MyStock
              stockItems={stockItems}
              receipts={receipts}
              totalStockAmount={totalStockAmount}
              setReceipts={setReceipts}
            />
          }
        />
        <Route
          path="my-sales"
          element={
            <MySales
              salesRecords={salesRecords}
              stockItems={stockItems}
            />
          }
        />
        <Route
          path="statements"
          element={
            <Statements
              receipts={receipts}
              salesRecords={salesRecords}
            />
          }
        />
        <Route
          path="notifications"
          element={
            <Notifications
              stockItems={stockItems}
            />
          }
        />
        {/* <Route path="test" element={<Test />} /> */}
      </Route>
    </Routes>
  );
}

export default App;
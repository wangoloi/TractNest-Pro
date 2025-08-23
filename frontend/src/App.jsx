import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/auth';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import Inventory from './components/inventory/Inventory';
import Receipts from './components/receipts/Receipts';
import MySales from './components/sales/MySales';
import Login from './pages/Login';
import './App.css';
import api from '@utils/api';

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
  // Initialize app data
  useEffect(() => {
    // App initialization logic can go here
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="receipts" element={<Receipts />} />
        <Route path="sales" element={<MySales />} />
        {/* Favorites routes - redirect to dashboard for now */}
        <Route path="proficar" element={<Dashboard />} />
        <Route path="armytage" element={<Dashboard />} />
        <Route path="bullbread" element={<Dashboard />} />
        <Route path="two-ventory" element={<Dashboard />} />
        <Route path="winds-ramp" element={<Dashboard />} />
        <Route path="vintory-board" element={<Dashboard />} />
        <Route path="xpriory" element={<Dashboard />} />
        <Route path="star-ramps" element={<Dashboard />} />
        <Route path="zeep-board" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}

export default App;

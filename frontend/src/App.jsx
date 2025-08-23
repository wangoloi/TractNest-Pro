import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout and Error Boundary
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';

// Auth Components
import Login from './pages/Login';
import CustomerRegistration from './components/auth/CustomerRegistration';

// Main Components
import Dashboard from './components/dashboard/Dashboard';
import StockingPlus from './components/stocking/StockingPlus';
import SalesPlus from './components/sales/SalesPlus';
import MySales from './components/sales/MySales';
import MyStock from './components/stocking/MyStock';
import Statements from './pages/Statements';
import Notifications from './pages/Notifications';
import ContactForm from './components/contact/ContactForm';
import CustomerList from './components/customers/CustomerList';
import CustomerMessages from './components/messages/CustomerMessages';
import AppSettings from './components/settings/AppSettings';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';

// Context
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/useAuth';

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

// Admin protected route component
const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Check if user has admin or owner role
  const isAdmin = user?.role === 'admin' || user?.role === 'owner';
  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
};

// Customer protected route component
const CustomerProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Check if user has customer role
  const isCustomer = user?.role === 'customer';
  if (!isCustomer) {
    return <Navigate to="/" />;
  }

  return children;
};

function AppContent() {
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 Fetching application data...');
    const fetchData = async () => {
      try {
        const [, inventoryRes] = await Promise.all([
          fetch('http://localhost:4000/api/customers').catch(() => ({ ok: false })),
          fetch('http://localhost:4000/api/inventory').catch(() => ({ ok: false })),
          fetch('http://localhost:4000/api/receipts').catch(() => ({ ok: false })),
          fetch('http://localhost:4000/api/sales').catch(() => ({ ok: false }))
        ]);

        if (inventoryRes.ok) {
          const inventoryData = await inventoryRes.json();
          setStockItems(inventoryData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const refreshData = () => {
    setLoading(true);
    fetch('http://localhost:4000/api/inventory')
      .then(res => res.json())
      .then(data => {
        setStockItems(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error refreshing data:', error);
        setLoading(false);
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <ErrorBoundary>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register/customer" element={<CustomerRegistration />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout stockItems={stockItems} refreshData={refreshData} />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="stocking" element={<StockingPlus />} />
            <Route path="sales" element={<SalesPlus />} />
            <Route path="my-sales" element={<MySales />} />
            <Route path="my-stock" element={<MyStock />} />
            <Route path="statements" element={<Statements />} />
            <Route path="notifications" element={<Notifications />} />
            
            {/* Admin-only routes */}
            <Route path="contact" element={
              <AdminProtectedRoute>
                <ContactForm />
              </AdminProtectedRoute>
            } />
            <Route path="customers" element={
              <AdminProtectedRoute>
                <CustomerList />
              </AdminProtectedRoute>
            } />
            <Route path="messages" element={
              <AdminProtectedRoute>
                <CustomerMessages />
              </AdminProtectedRoute>
            } />
            <Route path="settings" element={
              <AdminProtectedRoute>
                <AppSettings />
              </AdminProtectedRoute>
            } />
            <Route path="admin" element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            } />
            <Route path="admin/users" element={
              <AdminProtectedRoute>
                <UserManagement />
              </AdminProtectedRoute>
            } />
          </Route>
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </AuthProvider>
  );
}

export default App;

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout and Auth
import SimplifiedNavigation from '../../components/shared/layout/SimplifiedNavigation';
import Login from '../../pages/Login';
import ProtectedRoute from '../../features/auth/components/ProtectedRoute';

// Business Components
import Dashboard from '../../components/dashboard/Dashboard';
import SalesManager from '../../features/sales/components/SalesManager';
import CustomerManager from '../../components/business/customers/CustomerManager';

// Management Components
import AppSettings from '../../components/settings/AppSettings';
import CustomerMessages from '../../components/messages/CustomerMessages';
import AdminManagement from '../../features/admin/components/admin/AdminManagement';
import PerformanceMonitor from '../../features/admin/components/performance/PerformanceMonitor';
import SubscriptionManager from '../../features/admin/components/subscriptions/SubscriptionManager';
import OwnerCommunications from '../../features/admin/components/communications/OwnerCommunications';
import UserManagement from '../../features/admin/components/UserManagement';
import AdminCommunications from '../../features/admin/components/communications/AdminCommunications';
import Reports from '../../features/reports/components/Reports';

const Organizations = () => (
  <div className="space-y-6 p-6">
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Organizations Management</h1>
      <p className="text-gray-600 mb-6">Manage business organizations and their settings</p>
      <div className="p-8 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-500">Organizations management coming soon...</p>
      </div>
    </div>
  </div>
);

const Inventory = () => (
  <div className="space-y-6 p-6">
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Products</h1>
      <p className="text-gray-600 mb-6">View available products and make purchases</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border border-gray-200 rounded-lg">
          <h3 className="font-semibold mb-2">Laptop Pro</h3>
          <p className="text-gray-600 mb-2">High-performance laptop for professionals</p>
          <p className="font-bold text-green-600">UGX 1,200,000</p>
        </div>
        <div className="p-6 border border-gray-200 rounded-lg">
          <h3 className="font-semibold mb-2">Smartphone X</h3>
          <p className="text-gray-600 mb-2">Latest smartphone with advanced features</p>
          <p className="font-bold text-green-600">UGX 800,000</p>
        </div>
        <div className="p-6 border border-gray-200 rounded-lg">
          <h3 className="font-semibold mb-2">Wireless Headphones</h3>
          <p className="text-gray-600 mb-2">Premium wireless audio experience</p>
          <p className="font-bold text-green-600">UGX 150,000</p>
        </div>
      </div>
    </div>
  </div>
);

const Purchases = () => (
  <div className="space-y-6 p-6">
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">My Purchases</h1>
      <p className="text-gray-600 mb-6">View your purchase history and receipts</p>
      <div className="p-8 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-500">Purchase history coming soon...</p>
      </div>
    </div>
  </div>
);

const SimplifiedAppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <ProtectedRoute requireAuth={false}>
          <Login />
        </ProtectedRoute>
      } />
      
      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <SimplifiedNavigation />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        
                 {/* Business Routes */}
         <Route path="sales" element={<SalesManager />} />
         <Route path="customers" element={<CustomerManager />} />
         <Route path="reports" element={<Reports />} />
         
         {/* Management Routes */}
         <Route path="settings" element={<AppSettings />} />
         <Route path="communications" element={<CustomerMessages />} />
         <Route path="organizations" element={<Organizations />} />
         
         {/* Owner-specific Routes */}
         <Route path="admin-management" element={<AdminManagement />} />
         <Route path="performance" element={<PerformanceMonitor />} />
         <Route path="subscriptions" element={<SubscriptionManager />} />
         <Route path="owner-communications" element={<OwnerCommunications />} />
         
         {/* Admin-specific Routes */}
         <Route path="user-management" element={<UserManagement />} />
         <Route path="admin-communications" element={<AdminCommunications />} />
        
        {/* User Routes */}
        <Route path="sales" element={<SalesManager />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="purchases" element={<Purchases />} />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default SimplifiedAppRoutes;

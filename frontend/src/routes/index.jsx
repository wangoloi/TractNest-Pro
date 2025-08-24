import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout and Error Boundary
import Layout from '../components/layout/Layout';

// Auth Components
import Login from '../pages/Login';
import CustomerRegistration from '../components/auth/CustomerRegistration';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Main Components
import Dashboard from '../components/dashboard/Dashboard';
import MySales from '../components/sales/MySales';
import SalesPlus from '../components/sales/SalesPlus';
import MyStock from '../components/stocking/MyStock';
import StockingPlus from '../components/stocking/StockingPlus';
import Statements from '../pages/Statements';
import Notifications from '../pages/Notifications';
import ContactForm from '../components/contact/ContactForm';
import CustomerList from '../components/customers/CustomerList';
import Messages from '../components/messages/CustomerMessages';
import AppSettings from '../components/settings/AppSettings';

// Admin Components
import UserManagement from '../components/admin/UserManagement';

// Owner Components
import OrganizationsManagement from '../components/owner/OrganizationsManagement';

const AppRoutes = ({ stockItems }) => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <ProtectedRoute requireAuth={false}>
          <Login />
        </ProtectedRoute>
      } />
      <Route path="/register/customer" element={<CustomerRegistration />} />
      
      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout stockItems={stockItems} />
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
        <Route path="messages" element={<Messages />} />

        <Route path="users" element={
          <ProtectedRoute adminOnly={true}>
            <UserManagement />
          </ProtectedRoute>
        } />
        <Route path="admin/users" element={
          <ProtectedRoute adminOnly={true}>
            <UserManagement />
          </ProtectedRoute>
        } />
        
        {/* Owner-only routes */}
        <Route path="organizations" element={
          <ProtectedRoute ownerOnly={true}>
            <OrganizationsManagement />
          </ProtectedRoute>
        } />
        <Route path="enterprise-users" element={
          <ProtectedRoute ownerOnly={true}>
            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-900">Enterprise Users Management</h1>
              <p className="text-gray-600">Manage users across all organizations</p>
              <div className="mt-6 p-8 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-500">Enterprise Users Management coming soon...</p>
              </div>
            </div>
          </ProtectedRoute>
        } />

        <Route path="enterprise-analytics" element={
          <ProtectedRoute ownerOnly={true}>
            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-900">Enterprise Analytics</h1>
              <p className="text-gray-600">View analytics across all organizations</p>
              <div className="mt-6 p-8 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-500">Enterprise Analytics coming soon...</p>
              </div>
            </div>
          </ProtectedRoute>
        } />
      </Route>
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout and Error Boundary
import Layout from '../../components/layout/Layout';

// Auth Components
import Login from '../../pages/Login';
import CustomerRegistration from '../../features/auth/components/CustomerRegistration';
import ProtectedRoute from '../../features/auth/components/ProtectedRoute';

// Main Components
import Dashboard from '../../components/dashboard/Dashboard';
import MySales from '../../features/sales/components/MySales';
import SalesPlus from '../../features/sales/components/SalesPlus';
import MyStock from '../../features/inventory/components/MyStock';
import StockingPlus from '../../features/inventory/components/StockingPlus';
import Statements from '../../pages/Statements';
import Notifications from '../../pages/Notifications';
import ContactForm from '../../components/contact/ContactForm';
import CustomerList from '../../components/customers/CustomerList';
import CustomerMessages from '../../components/messages/CustomerMessages';
import AppSettings from '../../components/settings/AppSettings';

// Admin Components
import UserManagement from '../../features/admin/components/UserManagement';

// Owner Components
import OrganizationsManagement from '../../components/owner/OrganizationsManagement';

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
        <Route path="contact" element={
          <ProtectedRoute adminOnly={true}>
            <ContactForm />
          </ProtectedRoute>
        } />
        <Route path="customers" element={
          <ProtectedRoute adminOnly={true}>
            <CustomerList />
          </ProtectedRoute>
        } />
        <Route path="messages" element={
          <ProtectedRoute adminOnly={true}>
            <CustomerMessages />
          </ProtectedRoute>
        } />
        <Route path="settings" element={
          <ProtectedRoute adminOnly={true}>
            <AppSettings />
          </ProtectedRoute>
        } />
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
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;

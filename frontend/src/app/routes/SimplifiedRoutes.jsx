import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout and Auth
import SimplifiedNavigation from '../../components/shared/layout/SimplifiedNavigation';
import ProtectedRoute from '../../features/auth/components/ProtectedRoute';
import Login from '../../components/auth/Login';

// Business Components
import Dashboard from '../../components/dashboard/Dashboard';
import SalesManager from '../../features/sales/components/SalesManager';
import CustomerManager from '../../features/admin/components/CustomerManager';

// Management Components
import AppSettings from '../../components/settings/AppSettings';
import CustomerMessages from '../../components/messages/CustomerMessages';
import AdminManagement from '../../features/admin/components/admin/AdminManagement';
import AdminSubscription from '../../features/admin/components/subscriptions/AdminSubscription';
import PerformanceMonitor from '../../features/admin/components/performance/PerformanceMonitor';
import SubscriptionManager from '../../features/admin/components/subscriptions/SubscriptionManager';
import OwnerCommunications from '../../features/admin/components/communications/OwnerCommunications';
import UserManagement from '../../features/admin/components/UserManagement';
import AccessControl from '../../features/admin/components/AccessControl';
import AdminCommunications from '../../features/admin/components/communications/AdminCommunications';

import Statements from '../../components/statements/Statements';
import EnterpriseUsers from '../../components/owner/EnterpriseUsers';
import OrganizationsManagement from '../../components/owner/OrganizationsManagement';

const Organizations = () => <OrganizationsManagement />;

const Inventory = () => (
  <div className="space-y-6 p-6">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Browse Products</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">View available products and make purchases</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
          <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Laptop Pro</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-2">High-performance laptop for professionals</p>
          <p className="font-bold text-green-600 dark:text-green-400">UGX 1,200,000</p>
        </div>
        <div className="p-6 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
          <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Smartphone X</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-2">Latest smartphone with advanced features</p>
          <p className="font-bold text-green-600 dark:text-green-400">UGX 800,000</p>
        </div>
        <div className="p-6 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
          <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Wireless Headphones</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-2">Premium wireless audio experience</p>
          <p className="font-bold text-green-600 dark:text-green-400">UGX 150,000</p>
        </div>
      </div>
    </div>
  </div>
);



const SimplifiedAppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      
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
         
         {/* Management Routes */}
         <Route path="settings" element={<AppSettings />} />
         <Route path="communications" element={<CustomerMessages />} />
         <Route path="organizations" element={<Organizations />} />
         
                              {/* Owner-specific Routes */}
                     <Route path="admin-management" element={<AdminManagement />} />
                     <Route path="performance" element={<PerformanceMonitor />} />
                     <Route path="subscriptions" element={<SubscriptionManager />} />
                     
                     {/* Admin-specific Routes */}
                     <Route path="my-subscription" element={<AdminSubscription />} />
         <Route path="owner-communications" element={<OwnerCommunications />} />
         <Route path="enterprise-users" element={<EnterpriseUsers />} />
         
         {/* Admin-specific Routes */}
         <Route path="user-management" element={
           <ProtectedRoute adminOnly={true}>
             <UserManagement />
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
         <Route path="access-control" element={
           <ProtectedRoute adminOnly={true}>
             <AccessControl />
           </ProtectedRoute>
         } />
         <Route path="admin/access-control" element={
           <ProtectedRoute adminOnly={true}>
             <AccessControl />
           </ProtectedRoute>
         } />

         <Route path="admin-communications" element={<AdminCommunications />} />
        
        {/* User Routes */}
        <Route path="sales" element={<SalesManager />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="statements" element={<Statements />} />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default SimplifiedAppRoutes;

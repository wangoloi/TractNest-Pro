import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
import { Menu, X, RefreshCw } from 'lucide-react';

const Layout = ({ stockItems, refreshData }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Map routes to tab names for backward compatibility
  const routeToTabMap = {
    '/': 'Dashboard',
    '/stocking': 'StockingPlus',
    '/sales': 'SalesPlus',
    '/my-stock': 'MyStock',
    '/my-sales': 'MySales',
    '/statements': 'Statements',
    '/notifications': 'Notifications',
    '/contact': 'Contact',
    '/customers': 'Customers',
    '/messages': 'Messages',
    '/settings': 'Settings',
    '/admin': 'Admin Dashboard',
    '/admin/users': 'User Management'
  };

  const getCurrentTab = () => {
    return routeToTabMap[location.pathname] || 'Dashboard';
  };

  const handleTabChange = (tab) => {
    const tabToRouteMap = {
      'Dashboard': '/',
      'StockingPlus': '/stocking',
      'SalesPlus': '/sales',
      'MyStock': '/my-stock',
      'MySales': '/my-sales',
      'Statements': '/statements',
      'Notifications': '/notifications',
      'Contact': '/contact',
      'Customers': '/customers',
      'Messages': '/messages',
      'Settings': '/settings',
      'Admin Dashboard': '/admin',
      'User Management': '/admin/users'
    };
    
    const route = tabToRouteMap[tab] || '/';
    navigate(route);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };


  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`bg-white shadow-md transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="p-4 border-b flex items-center justify-between">
          {!isSidebarCollapsed && (
            <h1 className="text-xl font-bold text-green-700">TrackNest Pro</h1>
          )}
          <div className="flex items-center gap-2">
            {refreshData && (
              <button
                onClick={refreshData}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                title="Refresh Data"
              >
                <RefreshCw className="text-gray-600" size={20} />
              </button>
            )}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              {isSidebarCollapsed ? (
                <Menu className="text-gray-600" size={24} />
              ) : (
                <X className="text-gray-600" size={24} />
              )}
            </button>
          </div>
        </div>
        
        <Navigation
          activeTab={getCurrentTab()}
          onTabChange={handleTabChange}
          isCollapsed={isSidebarCollapsed}
          stockItems={stockItems}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;

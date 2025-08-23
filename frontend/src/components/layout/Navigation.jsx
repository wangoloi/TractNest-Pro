import React from 'react';
import {
  Home,
  Package,
  ShoppingCart,
  FileText,
  Archive,
  Bell,
  LogOut,
  Settings,
  BarChart3,
  Users,
  MessageSquare,
  UserPlus,
  Contact,
  Box
} from 'lucide-react';
import { useAuth } from '../../contexts/useAuth';
import Tooltip from '../shared/Tooltip';

const Navigation = ({ activeTab, onTabChange, isCollapsed = false, stockItems = [] }) => {
  const { logout, user } = useAuth();
  
  // Get user role from auth context or localStorage
  const userRole = user?.role || localStorage.getItem('userRole') || 'user';
  const isAdmin = userRole === 'admin' || userRole === 'owner';
  
  // Base menu items for all users
  const baseMenuItems = [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      icon: Home
    },
    { 
      id: 'inventory', 
      name: 'Inventory', 
      icon: Box
    },
    { 
      id: 'stocking', 
      name: 'StockingPlus', 
      icon: Package
    },
    { 
      id: 'sales', 
      name: 'SalesPlus', 
      icon: ShoppingCart
    },
    { 
      id: 'my-sales', 
      name: 'MySales', 
      icon: BarChart3
    },
    { 
      id: 'my-stock', 
      name: 'MyStock', 
      icon: Archive
    },
    { 
      id: 'statements', 
      name: 'Statements', 
      icon: FileText
    },
    { 
      id: 'notifications', 
      name: 'Notifications', 
      icon: Bell
    }
  ];

  // Admin-only menu items
  const adminMenuItems = [
    { 
      id: 'contact', 
      name: 'Contact', 
      icon: Contact
    },
    { 
      id: 'customers', 
      name: 'Customers', 
      icon: UserPlus
    },
    { 
      id: 'messages', 
      name: 'Messages', 
      icon: MessageSquare
    },
    { 
      id: 'settings', 
      name: 'Settings', 
      icon: Settings
    }
  ];

  // Combine menu items based on user role
  const menuItems = [
    ...baseMenuItems,
    ...(isAdmin ? adminMenuItems : [])
  ];



  const getDisplayName = (itemName) => {
    switch (itemName) {
      case 'StockingPlus': return 'Stocking';
      case 'SalesPlus': return 'Sales';
      case 'MySales': return 'My Sales';
      case 'MyStock': return 'My Stock';
      case 'Inventory': return 'Inventory';
      case 'Receipts': return 'Receipts';
      case 'Customers': return 'Customers';
      case 'Messages': return 'Messages';
      case 'Contact': return 'Contact Customers';
      case 'Admin Dashboard': return 'Admin Dashboard';
      case 'User Management': return 'User Management';
      default: return itemName;
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await logout();
        window.location.href = '/login';
      } catch (error) {
        console.error('Logout failed:', error);
        // Fallback to direct navigation
        window.location.href = '/login';
      }
    }
  };

  return (
    <nav className="flex flex-col h-full">
      {/* Scrollable Navigation Items */}
      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Navigation Items */}
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.name;
            
            const handleClick = () => {
              onTabChange(item.name);
            };

                         // Count low stock items for notifications
             const lowStockCount = item.id === 'notifications' 
               ? (stockItems || []).filter(item => (item.qty || item.quantity || 0) < 5).length 
               : 0;
            
            const buttonContent = (
              <button
                className={`group w-full flex items-center rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                  isActive
                    ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white font-medium shadow-lg transform scale-[1.02]'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-gray-900'
                } ${isCollapsed ? 'justify-center p-3' : 'p-3'}`}
                onClick={handleClick}
              >
                <div className="relative">
                  <IconComponent 
                    size={20} 
                    className={`transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-gray-600'
                    }`} 
                  />
                  {lowStockCount > 0 && item.id === 'notifications' && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {lowStockCount}
                    </span>
                  )}
                </div>
                
                {!isCollapsed && (
                  <div className="ml-3 text-left flex-1">
                    <span className="block">{getDisplayName(item.name)}</span>
                  </div>
                )}

                {/* Active indicator */}
                {isActive && !isCollapsed && (
                  <div className="w-2 h-2 bg-white rounded-full ml-2 animate-pulse"></div>
                )}
              </button>
            );

            return (
              <li key={item.id}>
                {isCollapsed ? (
                  <Tooltip content={getDisplayName(item.name)} position="right">
                    {buttonContent}
                  </Tooltip>
                ) : (
                  buttonContent
                )}
              </li>
            );
          })}
        </ul>


      </div>

      {/* User Info and Logout Section - Fixed at Bottom */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        {/* User Profile Section */}
        {!isCollapsed && (
          <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                <Users size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username || 'Admin User'}
                </p>
                <p className="text-xs text-gray-600 truncate">{user?.email || 'admin@tracknest.com'}</p>
                <p className="text-xs text-green-600 font-medium capitalize">{user?.role || 'owner'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <Tooltip content="Logout" position="right" delay={0}>
          <button
            className={`group w-full flex items-center rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-red-600 hover:bg-red-50 hover:text-red-700 ${
              isCollapsed ? 'justify-center p-3' : 'p-3'
            }`}
            onClick={handleLogout}
          >
            <LogOut 
              size={20} 
              className="transition-transform duration-200 group-hover:scale-110 text-red-600" 
            />
            {!isCollapsed && (
              <span className="ml-3 text-left">Logout</span>
            )}
          </button>
        </Tooltip>
      </div>
    </nav>
  );
};

export default Navigation;

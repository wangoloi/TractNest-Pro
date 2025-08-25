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
  Box,
  Shield,
  Activity,
  Building2
} from 'lucide-react';
import { useAuth } from '../../app/providers/AuthContext';
import { useMessages } from '../../app/providers/MessageContext';
import Tooltip from '../ui/forms/Tooltip';

const Navigation = ({ activeTab, onTabChange, isCollapsed = false }) => {
  const { logout, user } = useAuth();
  const { unreadCount } = useMessages();
  
  // Get user role from auth context or localStorage
  const userRole = user?.role || localStorage.getItem('userRole') || 'user';
  const isAdmin = userRole === 'admin' || userRole === 'owner';
  const isOwner = userRole === 'owner';
  
  console.log('🔐 User Role:', userRole, 'isAdmin:', isAdmin, 'isOwner:', isOwner);
  
  // Base menu items for all users
  const baseMenuItems = [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      icon: Home
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
    },
    { 
      id: 'messages', 
      name: 'Messages', 
      icon: MessageSquare
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

  // Owner-only menu items
  const ownerMenuItems = [
    { 
      id: 'organizations', 
      name: 'Organizations', 
      icon: Building2
    },
    { 
      id: 'enterprise-users', 
      name: 'Enterprise Users', 
      icon: Users
    },
    { 
      id: 'enterprise-analytics', 
      name: 'Enterprise Analytics', 
      icon: Activity
    }
  ];

  // Combine menu items based on user role
  let menuItems = [...baseMenuItems];
  
  if (isAdmin) {
    menuItems = [...menuItems, ...adminMenuItems];
  }
  
  if (isOwner) {
    menuItems = [...menuItems, ...ownerMenuItems];
  }

  const getDisplayName = (itemName) => {
    return itemName;
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={`bg-white shadow-lg ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 ease-in-out h-full flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-gray-900">TrackNest Pro</h1>
              <p className="text-sm text-gray-600">{userRole}</p>
            </div>
          )}
          <button
            onClick={() => onTabChange && onTabChange('settings')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Settings size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            
            return (
              <li key={item.id}>
                <Tooltip content={isCollapsed ? getDisplayName(item.name) : ''} position="right">
                  <button
                    onClick={() => onTabChange && onTabChange(item.name)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    {!isCollapsed && (
                      <span className="ml-3">{getDisplayName(item.name)}</span>
                    )}
                    {item.id === 'messages' && unreadCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Navigation;

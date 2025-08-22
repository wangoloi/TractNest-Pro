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
  Zap,
  MessageSquare,
  UserPlus,
  Contact
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

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
      icon: Home,
      description: 'Overview & Analytics'
    },
    { 
      id: 'stocking', 
      name: 'StockingPlus', 
      icon: Package,
      description: 'Inventory Management'
    },
    { 
      id: 'sales', 
      name: 'SalesPlus', 
      icon: ShoppingCart,
      description: 'Sales & Invoicing'
    },
    { 
      id: 'my-sales', 
      name: 'MySales', 
      icon: BarChart3,
      description: 'Sales Reports'
    },
    { 
      id: 'my-stock', 
      name: 'MyStock', 
      icon: Archive,
      description: 'Stock Reports'
    },
    { 
      id: 'statements', 
      name: 'Statements', 
      icon: FileText,
      description: 'Financial Reports'
    },
    { 
      id: 'notifications', 
      name: 'Notifications', 
      icon: Bell,
      description: 'Alerts & Updates'
    }
  ];

  // Admin-only menu items
  const adminMenuItems = [
    { 
      id: 'contact', 
      name: 'Contact', 
      icon: Contact,
      description: 'Contact Customers'
    },
    { 
      id: 'admin', 
      name: 'Admin Dashboard', 
      icon: Settings,
      description: 'System Administration'
    },
    { 
      id: 'customers', 
      name: 'Customers', 
      icon: UserPlus,
      description: 'Customer Management'
    },
    { 
      id: 'messages', 
      name: 'Messages', 
      icon: MessageSquare,
      description: 'Customer Messages'
    },
    { 
      id: 'settings', 
      name: 'Settings', 
      icon: Settings,
      description: 'App Configuration'
    }
  ];

  // Combine menu items based on user role
  const menuItems = [
    ...baseMenuItems,
    ...(isAdmin ? adminMenuItems : []),
    { 
      id: 'logout', 
      name: 'Logout', 
      icon: LogOut,
      description: 'Sign out'
    }
  ];

  const getDisplayName = (itemName) => {
    switch (itemName) {
      case 'StockingPlus': return 'Stocking';
      case 'SalesPlus': return 'Sales';
      case 'MySales': return 'My Sales';
      case 'MyStock': return 'My Stock';
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
    <nav className="p-4 space-y-2">
      {/* User Profile Section */}
      {!isCollapsed && (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
              <Users size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username || 'Admin User'}
              </p>
              <p className="text-xs text-gray-600 truncate">{user?.email || 'admin@tracknest.com'}</p>
              <p className="text-xs text-green-600 font-medium capitalize">{user?.role || 'admin'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <ul className="space-y-1">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.name;
          const isLogout = item.id === 'logout';
          
          const handleClick = () => {
            if (isLogout) {
              handleLogout();
            } else {
              onTabChange(item.name);
            }
          };

          // Count low stock items for notifications
          const lowStockCount = item.id === 'notifications' 
            ? stockItems.filter(item => item.qty < 5).length 
            : 0;
          
          return (
            <li key={item.id}>
              <button
                className={`group w-full flex items-center rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                  isActive
                    ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white font-medium shadow-lg transform scale-[1.02]'
                    : isLogout
                    ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-gray-900'
                } ${isCollapsed ? 'justify-center p-3' : 'p-3'}`}
                onClick={handleClick}
              >
                <div className="relative">
                  <IconComponent 
                    size={20} 
                    className={`transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-white' : isLogout ? 'text-red-600' : 'text-gray-600'
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
                    <span className={`text-xs ${
                      isActive ? 'text-green-100' : 'text-gray-500'
                    }`}>
                      {item.description}
                    </span>
                  </div>
                )}

                {/* Active indicator */}
                {isActive && !isCollapsed && (
                  <div className="w-2 h-2 bg-white rounded-full ml-2 animate-pulse"></div>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
          <h3 className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
            <Zap size={16} />
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button 
              onClick={() => onTabChange('SalesPlus')}
              className="w-full text-left p-2 rounded-lg bg-white/50 hover:bg-white transition-colors text-sm text-purple-800"
            >
              + New Invoice
            </button>
            <button 
              onClick={() => onTabChange('StockingPlus')}
              className="w-full text-left p-2 rounded-lg bg-white/50 hover:bg-white transition-colors text-sm text-purple-800"
            >
              + Add Stock
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;

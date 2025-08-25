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
import { useAuth } from '../../contexts/useAuth';
<<<<<<< HEAD
=======
import { useMessages } from '../../contexts/MessageContext';
>>>>>>> 10343382ae11e45544ef657d05391aed8a6c8eb9
import Tooltip from '../shared/Tooltip';

const Navigation = ({ activeTab, onTabChange, isCollapsed = false, stockItems = [] }) => {
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
<<<<<<< HEAD
=======
    },
    { 
      id: 'messages', 
      name: 'Messages', 
      icon: MessageSquare
>>>>>>> 10343382ae11e45544ef657d05391aed8a6c8eb9
    }
  ];

  // Admin-only menu items
  const adminMenuItems = [
    { 
<<<<<<< HEAD
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
=======
      id: 'users', 
      name: 'Users', 
      icon: Users
>>>>>>> 10343382ae11e45544ef657d05391aed8a6c8eb9
    }
  ];

  // Owner-only menu items (enterprise management)
  const ownerMenuItems = [
    { 
      id: 'organizations', 
      name: 'Organizations', 
      icon: Building2
    },
    { 
      id: 'enterprise-users', 
      name: 'EnterpriseUsers', 
      icon: Users
    },
    { 
      id: 'enterprise-analytics', 
      name: 'EnterpriseAnalytics', 
      icon: BarChart3
    }
  ];

  // Logout item (available for all users)
  const logoutItem = {
    id: 'logout', 
    name: 'Logout', 
    icon: LogOut,
    isLogout: true
  };

  // Combine menu items based on user role
  const menuItems = [
    ...baseMenuItems,
<<<<<<< HEAD
    ...(isAdmin ? adminMenuItems : [])
=======
    ...(isAdmin ? adminMenuItems : []),
    ...(isOwner ? ownerMenuItems : []),
    logoutItem // Logout is available for all users
>>>>>>> 10343382ae11e45544ef657d05391aed8a6c8eb9
  ];



  const getDisplayName = (itemName) => {
    switch (itemName) {
      case 'StockingPlus': return 'Stocking';
      case 'SalesPlus': return 'Sales';
      case 'MySales': return 'My Sales';
      case 'MyStock': return 'My Stock';
      case 'Users': return 'Users';
      case 'Messages': return 'Messages';
      case 'Organizations': return 'Organizations';
      case 'EnterpriseUsers': return 'Enterprise Users';
      case 'EnterpriseAnalytics': return 'Analytics';
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
<<<<<<< HEAD
      {/* Scrollable Navigation Items */}
      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
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
            
            const handleClick = () => {
              onTabChange(item.name);
            };

            // Count low stock items for notifications
            const lowStockCount = item.id === 'notifications' 
              ? stockItems.filter(item => item.qty < 5).length 
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
=======
             {/* Scrollable Navigation Items */}
       <div 
         className="flex-1 p-4 space-y-2 overflow-y-auto navigation-scrollbar" 
         style={{
           scrollbarWidth: 'thin',
           scrollbarColor: '#6b7280 #e5e7eb',
           maxHeight: 'calc(100vh - 200px)'
         }}
       >
        {/* Navigation Items */}
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.name;
            
            const handleClick = () => {
              if (item.isLogout) {
                handleLogout();
              } else {
                onTabChange(item.name);
              }
            };

            // Count low stock items for notifications
            const lowStockCount = item.id === 'notifications' 
              ? (stockItems || []).filter(item => (item.qty || item.quantity || 0) < 5).length 
              : 0;
            
            // Count unread messages
            const messageCount = item.id === 'messages' ? unreadCount : 0;
            
            const buttonContent = (
                             <button
                 className={`group w-full flex items-center rounded-xl transition-all duration-300 focus:outline-none ${
                   item.isLogout
                     ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
                     : isActive
                     ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white font-medium shadow-lg transform scale-[1.02]'
                     : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-gray-900'
                 } ${isCollapsed ? 'justify-center p-3' : 'p-3'}`}
                 onClick={handleClick}
               >
>>>>>>> 10343382ae11e45544ef657d05391aed8a6c8eb9
                <div className="relative">
                  <IconComponent 
                    size={20} 
                    className={`transition-transform duration-200 group-hover:scale-110 ${
<<<<<<< HEAD
                      isActive ? 'text-white' : 'text-gray-600'
=======
                      item.isLogout 
                        ? 'text-red-600' 
                        : isActive 
                        ? 'text-white' 
                        : 'text-gray-600'
>>>>>>> 10343382ae11e45544ef657d05391aed8a6c8eb9
                    }`} 
                  />
                  {lowStockCount > 0 && item.id === 'notifications' && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {lowStockCount}
                    </span>
                  )}
                  {messageCount > 0 && item.id === 'messages' && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {messageCount}
                    </span>
                  )}
                </div>
                
                {!isCollapsed && (
                  <div className="ml-3 text-left flex-1">
                    <span className="block">{getDisplayName(item.name)}</span>
                  </div>
                )}

                {/* Active indicator */}
                {isActive && !isCollapsed && !item.isLogout && (
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

<<<<<<< HEAD
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
      </div>

      {/* Logout Section - Fixed at Bottom */}
      <div className="p-4 border-t border-gray-200">
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
=======

      </div>

             {/* User Info Section - Fixed at Bottom */}
       <div className="p-4 border-t border-gray-200">
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
       </div>
>>>>>>> 10343382ae11e45544ef657d05391aed8a6c8eb9
    </nav>
  );
};

export default Navigation;

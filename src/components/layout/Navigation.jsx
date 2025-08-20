import React from 'react';
import {
  Home,
  Package,
  ShoppingCart,
  FileText,
  Archive,
  Bell,
  LogOut
} from 'lucide-react';

const Navigation = ({ activeTab, onTabChange, isCollapsed = false, stockItems = [] }) => {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'stocking', name: 'StockingPlus', icon: Package },
    { id: 'sales', name: 'SalesPlus', icon: ShoppingCart },
    { id: 'my-sales', name: 'MySales', icon: FileText },
    { id: 'my-stock', name: 'MyStock', icon: Archive },
    { id: 'statements', name: 'Statements', icon: FileText },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'logout', name: 'Logout', icon: LogOut },
  ];

  const getDisplayName = (itemName) => {
    switch (itemName) {
      case 'StockingPlus': return 'Stocking';
      case 'SalesPlus': return 'Sales';
      case 'MySales': return 'My Sales';
      case 'MyStock': return 'My Stock';
      default: return itemName;
    }
  };

  return (
    <nav className="p-4">
      <ul className="space-y-2">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.name;
          
          // Special handling for Notifications and Logout
          const handleClick = () => {
            if (item.id === 'notifications') {
              // Handle notifications click
              onTabChange('Notifications');
            } else if (item.id === 'logout') {
              // Handle logout click
              if (window.confirm('Are you sure you want to logout?')) {
                // This would normally be handled by the parent component
                // For now, we'll just navigate to login
                window.location.href = '/login';
              }
            } else {
              // Handle regular navigation
              onTabChange(item.name);
            }
          };
          
          return (
            <li key={item.id}>
              <button
                className={`w-full flex items-center rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                  isActive
                    ? 'bg-green-600 text-white font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                } ${isCollapsed ? 'justify-center p-3' : 'p-3'}`}
                onClick={handleClick}
              >
                <IconComponent size={20} />
                {!isCollapsed && (
                  <span className="ml-3">{getDisplayName(item.name)}</span>
                )}
                {/* Notification badge */}
                {item.id === 'notifications' && (
                  (() => {
                    // Count items with quantity less than 5
                    const lowStockCount = stockItems.filter(item => item.qty < 5).length;
                    return lowStockCount > 0 ? (
                      <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {lowStockCount}
                      </span>
                    ) : null;
                  })()
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Navigation;
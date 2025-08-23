import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  FileText, 
  BarChart3, 
  Settings, 
  User,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  Moon,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/auth';

const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Receipts', href: '/receipts', icon: FileText },
    { name: 'Sales', href: '/sales', icon: ShoppingCart },
  ];

  const favorites = [
    { name: 'Proficar', href: '/proficar', icon: Package },
    { name: 'Armytage', href: '/armytage', icon: ShoppingCart },
    { name: 'Bullbread', href: '/bullbread', icon: FileText },
    { name: 'Two Ventory', href: '/two-ventory', icon: BarChart3 },
    { name: 'Winds Ramp', href: '/winds-ramp', icon: Settings },
    { name: 'Vintory Board', href: '/vintory-board', icon: Home },
    { name: 'Xpriory', href: '/xpriory', icon: Package },
    { name: 'Star Ramps', href: '/star-ramps', icon: ShoppingCart },
    { name: 'Zeep Board', href: '/zeep-board', icon: FileText },
  ];

  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`bg-gray-900 text-white transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">T</span>
                  </div>
                  <span className="font-semibold text-lg">TrackNest</span>
                </div>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1 rounded-lg hover:bg-gray-700 transition-colors"
              >
                {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
            </div>
          </div>

          {/* Search */}
          {!sidebarCollapsed && (
            <div className="p-4 border-b border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search Product"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            {/* Favorites */}
            <div className="p-4">
              {!sidebarCollapsed && (
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Favorites ({favorites.length})
                </h3>
              )}
              <nav className="space-y-1">
                {favorites.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive(item.href)
                          ? 'bg-white text-gray-900'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <Icon size={18} className="flex-shrink-0" />
                      {!sidebarCollapsed && <span className="ml-3">{item.name}</span>}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* All Navigation */}
            <div className="p-4 border-t border-gray-700">
              {!sidebarCollapsed && (
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  All ({navigation.length})
                </h3>
              )}
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive(item.href)
                          ? 'bg-white text-gray-900'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <Icon size={18} className="flex-shrink-0" />
                      {!sidebarCollapsed && <span className="ml-3">{item.name}</span>}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <User size={16} />
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.username || 'User'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {user?.role || 'User'}
                  </p>
                </div>
              )}
              <button className="p-1 rounded-lg hover:bg-gray-700 transition-colors">
                <Moon size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <nav className="flex space-x-4">
                <span className="text-gray-500">/</span>
                <span className="text-gray-900 font-medium">Overview</span>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Notifications */}
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                <Bell size={20} className="text-gray-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.username || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
                </div>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Logout"
                >
                  <LogOut size={16} className="text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

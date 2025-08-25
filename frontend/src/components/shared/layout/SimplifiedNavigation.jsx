import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthContext';
import { useRoleAccess } from '../../../features/auth/hooks/useRoleAccess';
import {
  Home,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart3,
  MessageSquare,
  DollarSign,
  Activity,
  User,
  FileText,
  UserPlus
} from 'lucide-react';

const SimplifiedNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const { isOwner, isAdmin } = useRoleAccess();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getNavigationItems = () => {
    if (isOwner) {
      return [
        { name: 'Dashboard', icon: Home, path: '/', description: 'System Overview' },
        { name: 'Admin Management', icon: Users, path: '/admin-management', description: 'Manage Admins' },
        { name: 'Performance Monitor', icon: Activity, path: '/performance', description: 'System Performance' },
        { name: 'Subscriptions', icon: DollarSign, path: '/subscriptions', description: 'Manage Subscriptions' },
        { name: 'Communications', icon: MessageSquare, path: '/owner-communications', description: 'Admin Communications' },
        { name: 'Settings', icon: Settings, path: '/settings', description: 'System Settings' }
      ];
    } else if (isAdmin) {
      return [
        { name: 'Dashboard', icon: Home, path: '/', description: 'Business Overview' },
        { name: 'Sales & Inventory', icon: ShoppingCart, path: '/sales', description: 'Manage Sales & Stock' },
        { name: 'Customers', icon: Users, path: '/customers', description: 'Customer Management' },
        { name: 'User Management', icon: UserPlus, path: '/user-management', description: 'Register & Manage Users' },
        { name: 'Communications', icon: MessageSquare, path: '/admin-communications', description: 'User Messages' },
        { name: 'Reports', icon: FileText, path: '/reports', description: 'Generate Reports' },
        { name: 'Settings', icon: Settings, path: '/settings', description: 'Business Settings' }
      ];
    } else {
      return [
        { name: 'Dashboard', icon: Home, path: '/', description: 'Personal Overview' },
        { name: 'Sales & Inventory', icon: ShoppingCart, path: '/sales', description: 'Make Sales & View Inventory' },
        { name: 'Browse Products', icon: ShoppingCart, path: '/inventory', description: 'View Available Items' },
        { name: 'My Purchases', icon: ShoppingCart, path: '/purchases', description: 'Purchase History' },
        { name: 'Contact Admin', icon: MessageSquare, path: '/communications', description: 'Send Messages' }
      ];
    }
  };

  const navigationItems = getNavigationItems();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-white rounded-lg shadow-lg border border-gray-200"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50">
          <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl">
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-8 flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">TrackNest Pro</h1>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Mobile User Profile Section */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.name || 'User Name'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email || 'user@example.com'}
                    </p>
                    <p className="text-xs text-blue-600 font-medium">
                      {isOwner ? 'Owner' : isAdmin ? 'Admin' : 'User'}
                    </p>
                  </div>
                </div>
              </div>

              <nav className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-2">
                {navigationItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      isActive(item.path)
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon size={20} />
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </button>
                ))}
              </nav>

              <div className="mt-8 pt-6 border-t border-gray-200 flex-shrink-0">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

             {/* Desktop Navigation */}
       <div className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r border-gray-200">
         <div className="p-6 h-full flex flex-col">
           <div className="mb-8 flex-shrink-0">
             <h1 className="text-2xl font-bold text-gray-900">TrackNest Pro</h1>
             <p className="text-sm text-gray-600 mt-1">
               {isOwner ? 'System Management' : isAdmin ? 'Business Management' : 'Customer Portal'}
             </p>
             
             {/* User Profile Section */}
             <div className="mt-6 p-4 bg-gray-50 rounded-lg">
               <div className="flex items-center space-x-3">
                 <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                   <User className="h-5 w-5 text-blue-600" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-sm font-medium text-gray-900 truncate">
                     {user?.name || 'User Name'}
                   </p>
                   <p className="text-xs text-gray-500 truncate">
                     {user?.email || 'user@example.com'}
                   </p>
                   <p className="text-xs text-blue-600 font-medium">
                     {isOwner ? 'Owner' : isAdmin ? 'Admin' : 'User'}
                   </p>
                 </div>
               </div>
             </div>
           </div>

                     <nav className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-2">
             {navigationItems.map((item) => (
               <button
                 key={item.name}
                 onClick={() => navigate(item.path)}
                 className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                   isActive(item.path)
                     ? 'bg-blue-50 text-blue-700 border border-blue-200'
                     : 'text-gray-700 hover:bg-gray-50'
                 }`}
               >
                 <item.icon size={20} />
                 <div>
                   <div className="font-medium">{item.name}</div>
                   <div className="text-xs text-gray-500">{item.description}</div>
                 </div>
               </button>
             ))}
           </nav>

          <div className="mt-8 pt-6 border-t border-gray-200 flex-shrink-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

             {/* Main content area */}
       <div className="lg:ml-64 min-h-screen bg-gray-50">
         <div className="lg:pt-0 pt-16">
           <Outlet />
         </div>
       </div>
    </>
  );
};

export default SimplifiedNavigation;

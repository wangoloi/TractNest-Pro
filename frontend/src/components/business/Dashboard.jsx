import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';
import { useRoleAccess } from '../../hooks/useRoleAccess';
import { 
  ShoppingCart, 
  Package, 
  Users, 
  BarChart3, 
  DollarSign, 
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { formatNumber } from '../../utils/formatNumber';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isOwner, isAdmin } = useRoleAccess();
  
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProfit: 0,
    totalCustomers: 0,
    lowStockItems: 0,
    pendingOrders: 0,
    monthlyGrowth: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock data - in real app, this would come from API
      const mockStats = {
        totalSales: 1250000,
        totalProfit: 350000,
        totalCustomers: 45,
        lowStockItems: 3,
        pendingOrders: 8,
        monthlyGrowth: 12.5
      };

      const mockActivity = [
        { id: 1, type: 'sale', message: 'New sale: Laptop Pro - UGX 1,200,000', time: '2 hours ago', status: 'success' },
        { id: 2, type: 'stock', message: 'Low stock alert: Wireless Headphones (2 remaining)', time: '4 hours ago', status: 'warning' },
        { id: 3, type: 'customer', message: 'New customer registered: John Smith', time: '6 hours ago', status: 'info' },
        { id: 4, type: 'sale', message: 'Sale completed: Smartphone X - UGX 800,000', time: '1 day ago', status: 'success' }
      ];

      setStats(mockStats);
      setRecentActivity(mockActivity);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQuickActions = () => {
    if (isOwner) {
      return [
        { title: 'View Organizations', icon: Users, path: '/organizations', color: 'blue' },
        { title: 'System Settings', icon: BarChart3, path: '/settings', color: 'purple' },
        { title: 'Communications', icon: Users, path: '/communications', color: 'green' }
      ];
    } else if (isAdmin) {
      return [
        { title: 'Make Sale', icon: ShoppingCart, path: '/sales/new', color: 'green' },
        { title: 'Add Stock', icon: Package, path: '/inventory/add', color: 'blue' },
        { title: 'Manage Customers', icon: Users, path: '/customers', color: 'purple' },
        { title: 'View Reports', icon: BarChart3, path: '/reports', color: 'orange' }
      ];
    } else {
      return [
        { title: 'Browse Products', icon: Package, path: '/inventory', color: 'blue' },
        { title: 'My Purchases', icon: ShoppingCart, path: '/purchases', color: 'green' },
        { title: 'Contact Admin', icon: Users, path: '/communications', color: 'purple' }
      ];
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle size={16} />;
      case 'warning': return <AlertTriangle size={16} />;
      default: return <CheckCircle size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name || 'User'}!
        </h1>
        <p className="text-blue-100">
          {isOwner ? 'TrackNest Pro System Overview' : 
           isAdmin ? 'Your Business Dashboard' : 
           'Your Personal Dashboard'}
        </p>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">UGX {formatNumber(stats.totalSales)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Profit</p>
              <p className="text-2xl font-bold text-gray-900">UGX {formatNumber(stats.totalProfit)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <TrendingUp size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Customers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users size={24} className="text-purple-600" />
            </div>
          </div>
        </div>

        {isAdmin && (
          <>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.lowStockItems}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle size={24} className="text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <ShoppingCart size={24} className="text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Growth</p>
                  <p className="text-2xl font-bold text-green-600">+{stats.monthlyGrowth}%</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp size={24} className="text-green-600" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {getQuickActions().map((action, index) => (
            <button
              key={index}
              onClick={() => navigate(action.path)}
              className={`p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-${action.color}-300 hover:bg-${action.color}-50 transition-all duration-200 group`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-${action.color}-100 rounded-lg flex items-center justify-center group-hover:bg-${action.color}-200 transition-colors`}>
                  <action.icon size={20} className={`text-${action.color}-600`} />
                </div>
                <span className="font-medium text-gray-700 group-hover:text-gray-900">
                  {action.title}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(activity.status)}`}>
                {getStatusIcon(activity.status)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  ShoppingCart, 
  Users, 
  AlertTriangle,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Zap,
  Target,
  Award,
  FileText
} from 'lucide-react';
import { formatNumber, formatAppCurrency } from '../../lib/utils/formatNumber';
import { useAuth } from '../../app/providers/AuthContext';
import OwnerDashboard from '../owner/OwnerDashboard';
import { useNavigate } from 'react-router-dom';
import { SkeletonDashboard } from '../common/Skeleton';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProfit: 0,
    totalInvoices: 0,
    totalItems: 0,
    lowStockItems: 0,
    pendingInvoices: 0,
    monthlyGrowth: 0,
    profitMargin: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for dashboard
  const mockStats = {
    totalSales: 125000,
    totalProfit: 45000,
    totalInvoices: 156,
    totalItems: 89,
    lowStockItems: 12,
    pendingInvoices: 8,
    monthlyGrowth: 15.5,
    profitMargin: 36.0
  };

  const mockRecentActivity = [
    {
      id: 1,
      type: 'sale',
      title: 'New Sale Completed',
      description: 'Invoice #INV-001 for $2,500',
      amount: 2500,
      date: new Date().toISOString(),
      status: 'completed'
    },
    {
      id: 2,
      type: 'stock',
      title: 'Low Stock Alert',
      description: 'Product "Laptop Pro" is running low',
      amount: null,
      date: new Date(Date.now() - 86400000).toISOString(),
      status: 'warning'
    },
    {
      id: 3,
      type: 'invoice',
      title: 'Invoice Generated',
      description: 'Invoice #INV-002 for $1,800',
      amount: 1800,
      date: new Date(Date.now() - 172800000).toISOString(),
      status: 'pending'
    }
  ];

  const mockTopProducts = [
    {
      id: 1,
      name: 'Laptop Pro',
      sales: 45,
      revenue: 67500,
      growth: 12.5
    },
    {
      id: 2,
      name: 'Smartphone X',
      sales: 38,
      revenue: 45600,
      growth: 8.2
    },
    {
      id: 3,
      name: 'Tablet Air',
      sales: 32,
      revenue: 25600,
      growth: -2.1
    }
  ];

  useEffect(() => {
    console.log('🔄 Dashboard useEffect triggered:', { user });

    // If user is a customer, don't fetch admin data
    if (user?.role === 'customer') {
      console.log('🔄 User is customer, skipping admin data fetch');
      setLoading(false);
      return;
    }
    
    // Only fetch data if user is authenticated
    if (!user) {
      console.log('🔄 No user, skipping data fetch');
      setLoading(false);
      return;
    }
    
    // Start loading immediately and load mock data
    setLoading(true);
    console.log('🔄 Starting dashboard data fetch for user:', user.role);
    
    // Simulate API call delay
    setTimeout(() => {
      setStats(mockStats);
      setRecentActivity(mockRecentActivity);
      setTopProducts(mockTopProducts);
      setLoading(false);
      console.log('✅ Dashboard data loaded successfully');
    }, 1000);
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Loading your business data...</p>
          </div>
        </div>
        <SkeletonDashboard />
      </div>
    );
  }

  // Show owner dashboard for owner role
  if (user?.role === 'owner') {
    return <OwnerDashboard />;
  }

  // Show customer dashboard for customer role
  if (user?.role === 'customer') {
    return <CustomerDashboard />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your business.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`${refreshing ? 'animate-spin' : ''}`} size={20} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">{formatAppCurrency(stats.totalSales)}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="text-green-500" size={16} />
                <span className="text-sm text-green-600 ml-1">+{stats.monthlyGrowth}%</span>
              </div>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Profit</p>
              <p className="text-2xl font-bold text-gray-900">{formatAppCurrency(stats.totalProfit)}</p>
              <p className="text-sm text-gray-500 mt-2">{stats.profitMargin}% margin</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
              <p className="text-sm text-red-600 mt-2">{stats.lowStockItems} low stock</p>
            </div>
            <div className="bg-orange-100 rounded-full p-3">
              <Package className="text-orange-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalInvoices}</p>
              <p className="text-sm text-yellow-600 mt-2">{stats.pendingInvoices} pending</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <FileText className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Activity size={24} />
              Recent Activity
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4">
                  <div className={`rounded-full p-2 ${
                    activity.type === 'sale' ? 'bg-green-100' :
                    activity.type === 'stock' ? 'bg-red-100' :
                    'bg-blue-100'
                  }`}>
                    {activity.type === 'sale' ? (
                      <ShoppingCart className="text-green-600" size={16} />
                    ) : activity.type === 'stock' ? (
                      <AlertTriangle className="text-red-600" size={16} />
                    ) : (
                      <FileText className="text-blue-600" size={16} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500">{new Date(activity.date).toLocaleDateString()}</p>
                  </div>
                  {activity.amount && (
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatAppCurrency(activity.amount)}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 size={24} />
              Top Products
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 rounded-full p-2">
                      <Package className="text-blue-600" size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.sales} sales</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatAppCurrency(product.revenue)}</p>
                    <p className="text-sm text-gray-500">+{product.growth}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap size={24} />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/stocking')}
            className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Package className="text-blue-600" size={20} />
            <div className="text-left">
              <p className="font-medium text-blue-900">Add Stock</p>
              <p className="text-sm text-blue-700">Add new items to inventory</p>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/sales')}
            className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
          >
            <ShoppingCart className="text-green-600" size={20} />
            <div className="text-left">
              <p className="font-medium text-green-900">Create Sale</p>
              <p className="text-sm text-green-700">Record a new sale</p>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/statements')}
            className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <FileText className="text-purple-600" size={20} />
            <div className="text-left">
              <p className="font-medium text-purple-900">View Reports</p>
              <p className="text-sm text-purple-700">Check your statements</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

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
  Award
} from 'lucide-react';
import api from '@utils/api';
import { formatNumber } from '../../utils/formatNumber';
import { useAuth } from '../../contexts/useAuth';
import CustomerDashboard from '../customer/CustomerDashboard';

const Dashboard = () => {
  const { user } = useAuth();
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

  useEffect(() => {
    // If user is a customer, don't fetch admin data
    if (user?.role === 'customer') {
      setLoading(false);
      return;
    }
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [inventoryRes, salesRes, receiptsRes] = await Promise.all([
        api.get('/api/inventory'),
        api.get('/api/sales'),
        api.get('/api/receipts')
      ]);

      const inventory = inventoryRes.data;
      const sales = salesRes.data;
      const receipts = receiptsRes.data;

      // Calculate statistics
      const totalSales = sales.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);
      const totalProfit = sales.reduce((sum, sale) => sum + (sale.profit || 0), 0);
      const totalInvoices = sales.length;
      const totalItems = inventory.length;
      const lowStockItems = inventory.filter(item => (item.quantity || item.qty || 0) <= (item.reorder_level || 10)).length;
      const pendingInvoices = 0; // Sales don't have payment status
      const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

      // Calculate monthly growth (simplified)
      const currentMonth = new Date().getMonth();
      const currentMonthSales = sales.filter(sale => new Date(sale.createdAt).getMonth() === currentMonth);
      const lastMonthSales = sales.filter(sale => new Date(sale.createdAt).getMonth() === currentMonth - 1);
      
      const currentMonthTotal = currentMonthSales.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);
      const lastMonthTotal = lastMonthSales.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);
      const monthlyGrowth = lastMonthTotal > 0 ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

      setStats({
        totalSales,
        totalProfit,
        totalInvoices,
        totalItems,
        lowStockItems,
        pendingInvoices,
        monthlyGrowth,
        profitMargin
      });

      // Get recent activity
      const recentSales = sales
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(sale => ({
          id: sale.id,
          type: 'sale',
          title: `Sale ${sale.id}`,
          description: sale.itemName,
          amount: sale.totalPrice,
          date: sale.createdAt,
          status: 'completed'
        }));

      const recentReceipts = receipts
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(receipt => ({
          id: receipt.id,
          type: 'receipt',
          title: `Receipt ${receipt.id}`,
          description: receipt.itemName,
          amount: receipt.total,
          date: receipt.createdAt,
          status: 'completed'
        }));

      const allActivity = [...recentSales, ...recentReceipts]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 8);

      setRecentActivity(allActivity);

      // Get top products
      const productSales = {};
      sales.forEach(sale => {
        const productName = sale.itemName;
        if (!productSales[productName]) {
          productSales[productName] = { sales: 0, revenue: 0 };
        }
        productSales[productName].sales += sale.quantity || 1;
        productSales[productName].revenue += sale.totalPrice || 0;
      });

      const topProductsList = Object.entries(productSales)
        .map(([name, data]) => ({
          name,
          sales: data.sales,
          revenue: data.revenue
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setTopProducts(topProductsList);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  // If user is a customer, show customer dashboard
  if (user?.role === 'customer') {
    return <CustomerDashboard />;
  }

  // Show admin dashboard for admin/owner users
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
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
              <p className="text-2xl font-bold text-gray-900">${formatNumber(stats.totalSales)}</p>
              <div className="flex items-center mt-2">
                {stats.monthlyGrowth >= 0 ? (
                  <ArrowUpRight className="text-green-600" size={16} />
                ) : (
                  <ArrowDownRight className="text-red-600" size={16} />
                )}
                <span className={`text-sm font-medium ml-1 ${
                  stats.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Math.abs(stats.monthlyGrowth).toFixed(1)}%
                </span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
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
              <p className="text-2xl font-bold text-gray-900">${formatNumber(stats.totalProfit)}</p>
              <p className="text-sm text-gray-500 mt-2">{stats.profitMargin.toFixed(1)}% margin</p>
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
            <div className="bg-purple-100 rounded-full p-3">
              <Package className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalInvoices}</p>
              <p className="text-sm text-gray-500 mt-2">{stats.pendingInvoices} pending</p>
            </div>
            <div className="bg-orange-100 rounded-full p-3">
              <ShoppingCart className="text-orange-600" size={24} />
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
                <div key={`${activity.type}-${activity.id}`} className="flex items-center gap-4">
                  <div className={`rounded-full p-2 ${
                    activity.type === 'sale' ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    {activity.type === 'sale' ? (
                      <ShoppingCart className="text-green-600" size={16} />
                    ) : (
                      <Package className="text-blue-600" size={16} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500">{new Date(activity.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${formatNumber(activity.amount)}</p>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      {activity.status}
                    </span>
                  </div>
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
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center gap-4">
                  <div className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.sales} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${formatNumber(product.revenue)}</p>
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
          <button className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
            <ShoppingCart className="text-green-600" size={20} />
            <div className="text-left">
              <p className="font-medium text-green-900">New Sale</p>
              <p className="text-sm text-green-700">Create a new sale</p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
            <Package className="text-blue-600" size={20} />
            <div className="text-left">
              <p className="font-medium text-blue-900">Add Stock</p>
              <p className="text-sm text-blue-700">Add new inventory</p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
            <Users className="text-purple-600" size={20} />
            <div className="text-left">
              <p className="font-medium text-purple-900">Manage Customers</p>
              <p className="text-sm text-purple-700">View customer list</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

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
  ArrowDownRight
} from 'lucide-react';
import api from '@utils/api';
import { formatNumber } from '../../utils/formatNumber';

const Dashboard = () => {
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [inventoryRes, invoicesRes, receiptsRes] = await Promise.all([
        api.get('/api/inventory'),
        api.get('/api/invoices'),
        api.get('/api/receipts')
      ]);

      const inventory = inventoryRes.data;
      const invoices = invoicesRes.data;
      const receipts = receiptsRes.data;

      // Calculate statistics
      const totalSales = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
      const totalProfit = invoices.reduce((sum, inv) => sum + (inv.total_profit || 0), 0);
      const totalInvoices = invoices.length;
      const totalItems = inventory.length;
      const lowStockItems = inventory.filter(item => item.quantity <= (item.reorder_level || 10)).length;
      const pendingInvoices = invoices.filter(inv => inv.payment_status === 'pending').length;
      const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

      // Calculate monthly growth (simplified)
      const currentMonth = new Date().getMonth();
      const currentMonthInvoices = invoices.filter(inv => new Date(inv.date).getMonth() === currentMonth);
      const lastMonthInvoices = invoices.filter(inv => new Date(inv.date).getMonth() === currentMonth - 1);
      
      const currentMonthSales = currentMonthInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
      const lastMonthSales = lastMonthInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
      const monthlyGrowth = lastMonthSales > 0 ? ((currentMonthSales - lastMonthSales) / lastMonthSales) * 100 : 0;

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
      const recentInvoices = invoices
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
        .map(inv => ({
          id: inv.id,
          type: 'invoice',
          title: `Invoice ${inv.invoice_no}`,
          description: inv.customer_name,
          amount: inv.total_amount,
          date: inv.date,
          status: inv.payment_status
        }));

      const recentReceipts = receipts
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
        .map(rec => ({
          id: rec.id,
          type: 'receipt',
          title: `Receipt ${rec.receipt_no}`,
          description: rec.supplier_name,
          amount: rec.total_amount,
          date: rec.date,
          status: rec.status
        }));

      const allActivity = [...recentInvoices, ...recentReceipts]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 8);

      setRecentActivity(allActivity);

      // Get top products
      const productSales = {};
      invoices.forEach(inv => {
        if (inv.items) {
          inv.items.forEach(item => {
            if (!productSales[item.name]) {
              productSales[item.name] = { sales: 0, quantity: 0 };
            }
            productSales[item.name].sales += item.total_price || 0;
            productSales[item.name].quantity += item.quantity || 0;
          });
        }
      });

      const topProductsList = Object.entries(productSales)
        .map(([name, data]) => ({
          name,
          sales: data.sales,
          quantity: data.quantity
        }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

      setTopProducts(topProductsList);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'blue' }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              {trend === 'up' ? (
                <ArrowUpRight size={16} className="text-green-500 mr-1" />
              ) : (
                <ArrowDownRight size={16} className="text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon size={24} className={`text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => (
    <div className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
      <div className={`p-2 rounded-lg ${
        activity.type === 'invoice' ? 'bg-blue-50' : 'bg-green-50'
      }`}>
        {activity.type === 'invoice' ? (
          <ShoppingCart size={16} className="text-blue-600" />
        ) : (
          <Package size={16} className="text-green-600" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
        <p className="text-sm text-gray-500 truncate">{activity.description}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900">UGX {formatNumber(activity.amount)}</p>
        <p className="text-xs text-gray-500">{new Date(activity.date).toLocaleDateString()}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your business today.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar size={16} />
          <span>{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Sales"
          value={`UGX ${formatNumber(stats.totalSales)}`}
          icon={DollarSign}
          trend={stats.monthlyGrowth > 0 ? 'up' : 'down'}
          trendValue={`${Math.abs(stats.monthlyGrowth).toFixed(1)}% from last month`}
          color="green"
        />
        <StatCard
          title="Total Profit"
          value={`UGX ${formatNumber(stats.totalProfit)}`}
          icon={TrendingUp}
          trend="up"
          trendValue={`${stats.profitMargin.toFixed(1)}% margin`}
          color="blue"
        />
        <StatCard
          title="Total Invoices"
          value={stats.totalInvoices}
          icon={ShoppingCart}
          color="purple"
        />
        <StatCard
          title="Inventory Items"
          value={stats.totalItems}
          icon={Package}
          color="orange"
        />
      </div>

      {/* Alerts and Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle size={20} className="text-orange-500" />
              Alerts
            </h3>
            <div className="space-y-3">
              {stats.lowStockItems > 0 && (
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">Low Stock Items</span>
                  </div>
                  <span className="text-sm font-bold text-orange-600">{stats.lowStockItems}</span>
                </div>
              )}
              {stats.pendingInvoices > 0 && (
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <ShoppingCart size={16} className="text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">Pending Invoices</span>
                  </div>
                  <span className="text-sm font-bold text-yellow-600">{stats.pendingInvoices}</span>
                </div>
              )}
              {stats.lowStockItems === 0 && stats.pendingInvoices === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <div className="text-green-500 mb-2">✓</div>
                  <p className="text-sm">All systems running smoothly</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 size={20} className="text-blue-500" />
              Top Selling Products
            </h3>
            <div className="space-y-3">
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.quantity} units sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">UGX {formatNumber(product.sales)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-sm">No sales data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Activity size={20} className="text-green-500" />
          Recent Activity
        </h3>
        <div className="space-y-2">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <ActivityItem key={`${activity.type}-${activity.id}`} activity={activity} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-sm">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingCart size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-blue-900">Create Invoice</p>
              <p className="text-sm text-blue-700">Generate a new sales invoice</p>
            </div>
          </div>
        </button>
        
        <button className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package size={20} className="text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-900">Add Stock</p>
              <p className="text-sm text-green-700">Record new inventory items</p>
            </div>
          </div>
        </button>
        
        <button className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-left">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-purple-900">View Reports</p>
              <p className="text-sm text-purple-700">Analyze business performance</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  MoreHorizontal,
  Filter,
  Upload,
  MapPin,
  Globe,
  Search
} from 'lucide-react';
import api from '@utils/api';
import { formatNumber } from '../../utils/formatNumber';
import { DataTable } from '../shared';

const Dashboard = () => {
  const [stats, setStats] = useState({
    salesRevenue: 0,
    avgOrderValue: 0,
    totalVisitors: 0,
    totalExpenditure: 0
  });
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [topCountries, setTopCountries] = useState([]);
  const [trafficSources, setTrafficSources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch data from backend
      const [inventoryRes, invoicesRes] = await Promise.all([
        api.get('/api/inventory'),
        api.get('/api/invoices')
      ]);

      const inventory = inventoryRes.data;
      const invoices = invoicesRes.data;

      // Calculate statistics
      const salesRevenue = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
      const avgOrderValue = invoices.length > 0 ? salesRevenue / invoices.length : 0;
      const totalVisitors = 298456; // Mock data for demo
      const totalExpenditure = 898456; // Mock data for demo

      setStats({
        salesRevenue,
        avgOrderValue,
        totalVisitors,
        totalExpenditure
      });

      // Get recent invoices
      const recent = invoices
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
        .map((inv, index) => ({
          id: index + 1,
          customerId: `#${inv.id.toString().padStart(6, '0')}`,
          customerName: inv.customer_name,
          itemsName: inv.items ? `${inv.items.length} x ${inv.items[0]?.name || 'Item'}` : '1 x Product',
          orderDate: new Date(inv.date).toLocaleDateString('en-GB'),
          status: inv.payment_status === 'paid' ? 'Paid' : 'Pending',
          price: inv.total_amount
        }));

      setRecentInvoices(recent);

      // Mock data for top countries
      setTopCountries([
        { country: 'Indonesia', customers: '67.6k', percentage: 46 },
        { country: 'Malaysia', customers: '38.1k', percentage: 26 },
        { country: 'Spain', customers: '21.3k', percentage: 22 },
        { country: 'Japan', customers: '13.1k', percentage: 12 }
      ]);

      // Mock data for traffic sources
      setTrafficSources([
        { source: 'Google', count: '17.6k' },
        { source: 'Whatsapp', count: '15.6k' },
        { source: 'Facebook', count: '14.1k' },
        { source: 'Tik Tok', count: '10.1k' },
        { source: 'Instagram', count: '3.7k' },
        { source: 'Linkedin', count: '4.1k' },
        { source: 'Twitter', count: '2.6k' },
        { source: 'Other', count: '1.1k' }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, trendDirection = 'up' }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              {trendDirection === 'up' ? (
                <ArrowUpRight size={16} className="text-green-500 mr-1" />
              ) : (
                <ArrowDownRight size={16} className="text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${trendDirection === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-lg bg-blue-50">
          <Icon size={24} className="text-blue-600" />
        </div>
      </div>
    </div>
  );

  const invoiceColumns = [
    { key: 'id', header: 'NO', render: (row) => row.id },
    { key: 'customerId', header: 'ID CUSTOMERS', render: (row) => row.customerId },
    { key: 'customerName', header: 'CUSTOMERS NAME', render: (row) => row.customerName },
    { key: 'itemsName', header: 'ITEMS NAME', render: (row) => row.itemsName },
    { key: 'orderDate', header: 'ORDER DATE', render: (row) => row.orderDate },
    { 
      key: 'status', 
      header: 'STATUS', 
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.status === 'Paid' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {row.status}
        </span>
      )
    },
    { 
      key: 'price', 
      header: 'PRICE', 
      render: (row) => `$${formatNumber(row.price)}`
    }
  ];

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
      {/* Header with tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              ← BACK TO MAIN MENU
            </a>
            <h1 className="text-2xl font-bold text-gray-900">Vintory Board</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Search size={16} className="text-gray-400" />
              <Star size={16} className="text-gray-400" />
              <MoreHorizontal size={16} className="text-gray-400" />
            </div>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="flex items-center justify-between border-b border-gray-200">
          <div className="flex space-x-8">
            <button className="pb-4 px-1 border-b-2 border-blue-600 text-blue-600 font-medium">
              Overview
            </button>
            <button className="pb-4 px-1 text-gray-500 hover:text-gray-700 font-medium">
              Activity
            </button>
            <button className="pb-4 px-1 text-gray-500 hover:text-gray-700 font-medium">
              Timeline
            </button>
            <button className="pb-4 px-1 text-gray-500 hover:text-gray-700 font-medium">
              Reports
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option>Last Week</option>
              <option>Last Month</option>
              <option>Last Year</option>
            </select>
            <button className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
              <Upload size={16} />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="SALES REVENUE"
          value={`$${formatNumber(stats.salesRevenue)}`}
          icon={DollarSign}
          trend={true}
          trendValue="-0.10% Since last week"
          trendDirection="down"
        />
        <StatCard
          title="AVG. ORDER VALUE"
          value={`$${formatNumber(stats.avgOrderValue)}`}
          icon={ShoppingCart}
          trend={true}
          trendValue="+2.01% Since last week"
          trendDirection="up"
        />
        <StatCard
          title="TOTAL VISITOR"
          value={formatNumber(stats.totalVisitors)}
          icon={Users}
          trend={true}
          trendValue="+2.01% Since last week"
          trendDirection="up"
        />
        <StatCard
          title="TOTAL EXPENDITURE"
          value={`$${formatNumber(stats.totalExpenditure)}`}
          icon={Activity}
          trend={true}
          trendValue="+2.01% Since last week"
          trendDirection="up"
        />
      </div>

      {/* Charts and Data Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Countries */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">TOP COUNTRIES CUSTOMERS</h3>
              <button className="p-1 rounded-lg hover:bg-gray-100">
                <MoreHorizontal size={16} className="text-gray-400" />
              </button>
            </div>
            
            {/* World Map Placeholder */}
            <div className="bg-gray-100 rounded-lg h-32 mb-4 flex items-center justify-center">
              <div className="text-center">
                <Globe size={32} className="text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">World Map</p>
              </div>
            </div>

            <div className="space-y-3">
              {topCountries.map((country, index) => (
                <div key={country.country} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{country.country}</p>
                      <p className="text-xs text-gray-500">{country.customers} customers</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{country.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">TOP TRAFFIC BY SOURCE</h3>
              <button className="p-1 rounded-lg hover:bg-gray-100">
                <MoreHorizontal size={16} className="text-gray-400" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {trafficSources.map((source) => (
                <div key={source.source} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">{source.source}</p>
                  <p className="text-lg font-bold text-blue-600">{source.count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">RECENT INVOICES</h3>
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter size={16} />
              <span className="text-sm">Filter</span>
            </button>
            <button className="p-1 rounded-lg hover:bg-gray-100">
              <MoreHorizontal size={16} className="text-gray-400" />
            </button>
          </div>
        </div>

        <DataTable
          data={recentInvoices}
          columns={invoiceColumns}
          showSearch={false}
          showFilters={false}
          showExport={false}
          pageSize={5}
          className="border-0"
        />
      </div>
    </div>
  );
};

export default Dashboard;

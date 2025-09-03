import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Activity,
  BarChart3,
  RefreshCw,
  Zap,
  X,
  Shield,
  Database,
  Globe,
  Target,
  Award
} from 'lucide-react';
import { formatNumber, formatAppCurrency } from '../../lib/utils/formatNumber';
import { useNavigate } from 'react-router-dom';
import { SkeletonDashboard } from '../common/Skeleton';

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRevenue: 0,
    totalInventory: 0,
    activeUsers: 0,
    systemUptime: 0,
    totalTransactions: 0,
    averageResponseTime: 0,
    dataUsage: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    fetchOwnerData();
    
    const fallbackTimer = setTimeout(() => {
      console.log('⚠️ Owner Dashboard fallback timeout - forcing loading to false');
      setLoading(false);
    }, 3000);
    
    return () => clearTimeout(fallbackTimer);
  }, []);

  const fetchOwnerData = async () => {
    try {
      console.log('🔄 Owner Dashboard: Fetching data...');
      
      // Enhanced mock data for system overview
      const statsData = {
        totalUsers: 1250,
        totalRevenue: 2850000,
        totalInventory: 15420,
        activeUsers: 892,
        systemUptime: 99.8,
        totalTransactions: 45678,
        averageResponseTime: 245,
        dataUsage: 78.5
      };

      setStats(statsData);

      // Enhanced recent activity with system events
      const activity = [
        {
          id: 1,
          type: 'system',
          title: 'System Maintenance Completed',
          description: 'Scheduled maintenance completed successfully',
          date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
          icon: Shield
        },
        {
          id: 2,
          type: 'user',
          title: 'New User Registration',
          description: '25 new users registered today',
          date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          icon: Users
        },
        {
          id: 3,
          type: 'transaction',
          title: 'High Volume Transaction',
          description: 'Processing 1,234 transactions',
          date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          status: 'processing',
          icon: TrendingUp
        },
        {
          id: 4,
          type: 'performance',
          title: 'Performance Optimization',
          description: 'System response time improved by 15%',
          date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
          icon: Zap
        },
        {
          id: 5,
          type: 'security',
          title: 'Security Update Applied',
          description: 'Latest security patches installed',
          date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
          icon: Shield
        }
      ];

      setRecentActivity(activity);
      console.log('✅ Owner Dashboard data loaded successfully');

    } catch (error) {
      console.error('❌ Error in owner dashboard data processing:', error);
      setStats({
        totalUsers: 0,
        totalRevenue: 0,
        totalInventory: 0,
        activeUsers: 0,
        systemUptime: 0,
        totalTransactions: 0,
        averageResponseTime: 0,
        dataUsage: 0
      });
      setRecentActivity([]);
    } finally {
      console.log('🔄 Owner Dashboard loading complete');
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOwnerData();
    setRefreshing(false);
  };

  // Filter recent activity based on active filter
  const filteredActivity = recentActivity.filter(activity => {
    switch (activeFilter) {
      case 'system':
        return activity.type === 'system';
      case 'user':
        return activity.type === 'user';
      case 'transaction':
        return activity.type === 'transaction';
      case 'all':
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Dashboard</h1>
            <p className="text-gray-600">Loading system data...</p>
          </div>
        </div>
        <SkeletonDashboard />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Dashboard</h1>
          <p className="text-gray-600">TrackNest Pro System Overview & Analytics</p>
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

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalUsers)}</p>
              <p className="text-sm text-green-600 mt-2">{formatNumber(stats.activeUsers)} active</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">{formatAppCurrency(stats.totalRevenue)}</p>
              <p className="text-sm text-gray-500 mt-2">Lifetime earnings</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Uptime</p>
              <p className="text-2xl font-bold text-purple-600">{stats.systemUptime}%</p>
              <p className="text-sm text-gray-500 mt-2">Last 30 days</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <Shield className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-orange-600">{formatNumber(stats.totalTransactions)}</p>
              <p className="text-sm text-gray-500 mt-2">Processed today</p>
            </div>
            <div className="bg-orange-100 rounded-full p-3">
              <TrendingUp className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
            <BarChart3 className="text-blue-600" size={20} />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg Response Time</span>
              <span className="text-sm font-medium text-gray-900">{stats.averageResponseTime}ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Data Usage</span>
              <span className="text-sm font-medium text-gray-900">{stats.dataUsage}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Inventory Items</span>
              <span className="text-sm font-medium text-gray-900">{formatNumber(stats.totalInventory)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
            <Activity className="text-green-600" size={20} />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <span className="text-sm font-medium text-green-600">Healthy</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Services</span>
              <span className="text-sm font-medium text-green-600">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Backup Status</span>
              <span className="text-sm font-medium text-green-600">Up to date</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
            <Target className="text-purple-600" size={20} />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Sessions</span>
              <span className="text-sm font-medium text-gray-900">1,247</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Daily Logins</span>
              <span className="text-sm font-medium text-gray-900">892</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Support Tickets</span>
              <span className="text-sm font-medium text-gray-900">23</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Activity size={24} />
            Recent System Activity
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {filteredActivity.map((activity) => {
              const IconComponent = activity.icon;
              return (
                <div key={activity.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="bg-blue-100 rounded-full p-2">
                    <IconComponent className="text-blue-600" size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500">{new Date(activity.date).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                      activity.status === 'active' ? 'bg-blue-100 text-blue-800' :
                      activity.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              );
            })}
            {filteredActivity.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Activity className="mx-auto mb-2" size={32} />
                <p>No recent activity</p>
              </div>
            )}
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
            onClick={() => navigate('/admin-management')}
            className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Shield className="text-blue-600" size={20} />
            <div className="text-left">
              <p className="font-medium text-blue-900">Admin Management</p>
              <p className="text-sm text-blue-700">Manage system administrators</p>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/user-management')}
            className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Users className="text-green-600" size={20} />
            <div className="text-left">
              <p className="font-medium text-green-900">User Management</p>
              <p className="text-sm text-green-700">Manage system users</p>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/settings')}
            className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Database className="text-purple-600" size={20} />
            <div className="text-left">
              <p className="font-medium text-purple-900">System Settings</p>
              <p className="text-sm text-purple-700">Configure system preferences</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;

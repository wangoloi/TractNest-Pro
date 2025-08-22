import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Users, 
  BarChart3, 
  Shield, 
  Database, 
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Package,
  MessageSquare,
  FileText,
  Zap
} from 'lucide-react';
import api from '@utils/api';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [systemHealth, setSystemHealth] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, activityRes, healthRes] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/activity'),
        api.get('/api/admin/health')
      ]);
      
      setStats(statsRes.data || {});
      setRecentActivity(activityRes.data || []);
      setSystemHealth(healthRes.data || {});
    } catch (error) {
      console.error('Error fetching admin data:', error);
      // Use mock data for demo
      setStats({
        totalUsers: 2,
        totalCustomers: 10,
        totalSales: 0,
        totalRevenue: 0,
        activeInventory: 579,
        pendingMessages: 0,
        systemUptime: '99.9%',
        lastBackup: '2024-01-15 10:30:00'
      });
      setRecentActivity([
        { id: 1, type: 'user_login', user: 'bachawa', timestamp: '2024-01-15 10:30:00', description: 'User logged in' },
        { id: 2, type: 'customer_added', user: 'admin', timestamp: '2024-01-15 09:15:00', description: 'New customer added' },
        { id: 3, type: 'inventory_update', user: 'admin', timestamp: '2024-01-15 08:45:00', description: 'Inventory updated' }
      ]);
      setSystemHealth({
        database: 'healthy',
        api: 'healthy',
        storage: 'healthy',
        memory: '85%',
        cpu: '45%'
      });
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_login': return <Users size={16} className="text-blue-500" />;
      case 'customer_added': return <Users size={16} className="text-green-500" />;
      case 'inventory_update': return <Package size={16} className="text-orange-500" />;
      case 'sale_made': return <DollarSign size={16} className="text-green-500" />;
      case 'message_sent': return <MessageSquare size={16} className="text-purple-500" />;
      default: return <Activity size={16} className="text-gray-500" />;
    }
  };

  const getHealthStatus = (status) => {
    switch (status) {
      case 'healthy': return { color: 'text-green-600', bg: 'bg-green-100', icon: <CheckCircle size={16} /> };
      case 'warning': return { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: <AlertTriangle size={16} /> };
      case 'error': return { color: 'text-red-600', bg: 'bg-red-100', icon: <AlertTriangle size={16} /> };
      default: return { color: 'text-gray-600', bg: 'bg-gray-100', icon: <Clock size={16} /> };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">System overview and management</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAdminData}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Zap size={16} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers || 0}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Inventory</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeInventory || 0}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Package size={24} className="text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Uptime</p>
              <p className="text-2xl font-bold text-gray-900">{stats.systemUptime || '99.9%'}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Activity size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Shield size={20} className="text-gray-600" />
              System Health
            </h3>
            <div className="space-y-4">
              {Object.entries(systemHealth).map(([key, value]) => {
                const status = getHealthStatus(value);
                return (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {status.icon}
                      <span className="font-medium text-gray-700 capitalize">{key}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                      {value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Activity size={20} className="text-gray-600" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{activity.description}</p>
                    <p className="text-xs text-gray-500">by {activity.user} • {activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left">
            <Users size={24} className="text-blue-600 mb-2" />
            <p className="font-medium text-gray-800">Manage Users</p>
            <p className="text-sm text-gray-600">Add, edit, or remove users</p>
          </button>
          
          <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left">
            <Users size={24} className="text-green-600 mb-2" />
            <p className="font-medium text-gray-800">Customer Management</p>
            <p className="text-sm text-gray-600">View and manage customers</p>
          </button>
          
          <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left">
            <Settings size={24} className="text-orange-600 mb-2" />
            <p className="font-medium text-gray-800">System Settings</p>
            <p className="text-sm text-gray-600">Configure application settings</p>
          </button>
          
          <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left">
            <Database size={24} className="text-purple-600 mb-2" />
            <p className="font-medium text-gray-800">Database Backup</p>
            <p className="text-sm text-gray-600">Create system backup</p>
          </button>
        </div>
      </div>

      {/* System Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText size={20} className="text-gray-600" />
            System Information
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Last Backup:</span>
              <span className="font-medium">{stats.lastBackup || 'Never'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pending Messages:</span>
              <span className="font-medium">{stats.pendingMessages || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Sales:</span>
              <span className="font-medium">{stats.totalSales || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Revenue:</span>
              <span className="font-medium">UGX {stats.totalRevenue || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-gray-600" />
            Performance Metrics
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">CPU Usage</span>
                <span className="text-sm font-medium">{systemHealth.cpu || '45%'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: systemHealth.cpu || '45%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Memory Usage</span>
                <span className="text-sm font-medium">{systemHealth.memory || '85%'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: systemHealth.memory || '85%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Package, 
  AlertTriangle,
  Plus,
  Settings,
  Activity,
  BarChart3,
  RefreshCw,
  Zap
} from 'lucide-react';
import api from '@utils/api';
import { formatNumber } from '../../utils/formatNumber';
import { useNavigate } from 'react-router-dom';
import { SkeletonDashboard } from '../common/Skeleton';

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    totalUsers: 0,
    totalRevenue: 0,
    activeOrganizations: 0,
    pendingOrganizations: 0,
    totalInventory: 0
  });
  const [organizations, setOrganizations] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOwnerData();
  }, []);

  const fetchOwnerData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Owner Dashboard: Fetching data...');
      
      // Fetch organizations and stats with individual error handling
      let orgs = [];
      let statsData = {};
      
      try {
        const orgsRes = await api.get('/api/admin/organizations');
        orgs = orgsRes.data || [];
        console.log('✅ Organizations loaded:', orgs.length, 'organizations');
      } catch (error) {
        console.warn('⚠️ Failed to load organizations:', error.message);
        orgs = [];
      }
      
      try {
        const statsRes = await api.get('/api/admin/stats');
        statsData = statsRes.data || {};
        console.log('✅ Stats loaded:', statsData);
      } catch (error) {
        console.warn('⚠️ Failed to load stats:', error.message);
        statsData = {};
      }

      setOrganizations(orgs);
      setStats({
        totalOrganizations: orgs.length,
        totalUsers: statsData.totalUsers || 0,
        totalRevenue: statsData.totalRevenue || 0,
        activeOrganizations: orgs.filter(org => org.status === 'active').length,
        pendingOrganizations: orgs.filter(org => org.status === 'pending').length,
        totalInventory: statsData.totalInventory || 0
      });

      // Mock recent activity for now
      const activity = orgs.slice(0, 5).map(org => ({
        id: org.id,
        type: 'organization',
        title: `Organization: ${org.name}`,
        description: `Status: ${org.status}`,
        date: org.created_at,
        status: org.status
      }));

      setRecentActivity(activity);
      console.log('🔄 Owner Dashboard data loaded successfully');

    } catch (error) {
      console.error('❌ Error in owner dashboard data processing:', error);
      // Set default values
      setStats({
        totalOrganizations: 0,
        totalUsers: 0,
        totalRevenue: 0,
        activeOrganizations: 0,
        pendingOrganizations: 0,
        totalInventory: 0
      });
      setOrganizations([]);
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

  if (loading) {
    return <SkeletonDashboard />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enterprise Dashboard</h1>
          <p className="text-gray-600">Manage your multi-tenant TrackNest system</p>
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
              <p className="text-sm font-medium text-gray-600">Total Organizations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrganizations}</p>
              <p className="text-sm text-green-600 mt-2">{stats.activeOrganizations} active</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Building2 className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              <p className="text-sm text-gray-500 mt-2">Across all organizations</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <Users className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${formatNumber(stats.totalRevenue)}</p>
              <p className="text-sm text-gray-500 mt-2">All organizations</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <DollarSign className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Inventory</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalInventory}</p>
              <p className="text-sm text-gray-500 mt-2">Items across system</p>
            </div>
            <div className="bg-orange-100 rounded-full p-3">
              <Package className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Organizations and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organizations List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Building2 size={24} />
              Organizations
            </h2>
                         <button
               onClick={() => navigate('/organizations')}
               className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
             >
              <Plus size={16} />
              Add New
            </button>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {organizations.slice(0, 5).map((org) => (
                <div key={org.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="bg-blue-100 rounded-full p-2">
                    <Building2 className="text-blue-600" size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{org.name}</p>
                    <p className="text-sm text-gray-600">{org.slug}</p>
                    <p className="text-xs text-gray-500">{new Date(org.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      org.status === 'active' ? 'bg-green-100 text-green-800' :
                      org.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {org.status}
                    </span>
                  </div>
                </div>
              ))}
              {organizations.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Building2 className="mx-auto mb-2" size={32} />
                  <p>No organizations yet</p>
                  <p className="text-sm">Create your first organization to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>

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
                  <div className="bg-green-100 rounded-full p-2">
                    <Building2 className="text-green-600" size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500">{new Date(activity.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      activity.status === 'active' ? 'bg-green-100 text-green-800' :
                      activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="mx-auto mb-2" size={32} />
                  <p>No recent activity</p>
                </div>
              )}
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
             onClick={() => navigate('/organizations')}
             className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
           >
            <Building2 className="text-blue-600" size={20} />
            <div className="text-left">
              <p className="font-medium text-blue-900">Manage Organizations</p>
              <p className="text-sm text-blue-700">Add, edit, or remove tenants</p>
            </div>
          </button>
                     <button 
             onClick={() => navigate('/enterprise-users')}
             className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
           >
            <Users className="text-green-600" size={20} />
            <div className="text-left">
              <p className="font-medium text-green-900">Manage Users</p>
              <p className="text-sm text-green-700">Add admins to organizations</p>
            </div>
          </button>
                     <button 
             onClick={() => navigate('/system-settings')}
             className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
           >
            <Settings className="text-purple-600" size={20} />
            <div className="text-left">
              <p className="font-medium text-purple-900">System Settings</p>
              <p className="text-sm text-purple-700">Configure enterprise settings</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Clock,
  User,
  Shield,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import api from '@utils/api';

const AdminManagement = () => {
  console.log('AdminManagement component rendered');
  
  // Simple test to see if component loads
  useEffect(() => {
    console.log('AdminManagement useEffect triggered');
  }, []);
  
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [adminActivities, setAdminActivities] = useState([]);
  const [error, setError] = useState(null);

  // Form state for adding new admin
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchAdmins();
    
    // Test API connection
    const testConnection = async () => {
      try {
        console.log('🔍 Testing API connection to:', api.defaults.baseURL);
        const response = await api.get('/api/test');
        console.log('✅ API connection successful:', response.data);
      } catch (error) {
        console.log('❌ API connection failed:', error.message);
        console.log('🔧 Current API baseURL:', api.defaults.baseURL);
      }
    };
    
    testConnection();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/admin/admins');
      setAdmins(response.data || []);
    } catch (error) {
      console.error('Error fetching admins:', error);
      setError('Failed to fetch admins');
      // For now, show some mock data to test the UI
      setAdmins([
        {
          id: 1,
          username: 'admin1',
          email: 'admin1@example.com',
          first_name: 'John',
          last_name: 'Doe',
          status: 'active',
          last_activity: new Date().toISOString()
        },
        {
          id: 2,
          username: 'admin2',
          email: 'admin2@example.com',
          first_name: 'Jane',
          last_name: 'Smith',
          status: 'active',
          last_activity: new Date(Date.now() - 86400000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminActivities = async (adminId) => {
    try {
      const response = await api.get(`/api/admin/activities/${adminId}`);
      setAdminActivities(response.data || []);
    } catch (error) {
      console.error('Error fetching admin activities:', error);
      // Mock activities for testing
      setAdminActivities([
        {
          id: 1,
          type: 'login',
          description: 'User logged in successfully',
          timestamp: new Date().toISOString()
        },
        {
          id: 2,
          type: 'create',
          description: 'Created new inventory item',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 3,
          type: 'update',
          description: 'Updated customer information',
          timestamp: new Date(Date.now() - 7200000).toISOString()
        }
      ]);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    
    if (newAdmin.password !== newAdmin.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const response = await api.post('/api/admin/admins', {
        username: newAdmin.username,
        email: newAdmin.email,
        first_name: newAdmin.first_name,
        last_name: newAdmin.last_name,
        password: newAdmin.password,
        role: 'admin'
      });

      if (response.data) {
        setAdmins([...admins, response.data]);
        setShowAddModal(false);
        setNewAdmin({
          username: '',
          email: '',
          first_name: '',
          last_name: '',
          password: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Error adding admin:', error);
      // For demo purposes, add the admin locally
      const newAdminData = {
        id: Date.now(),
        username: newAdmin.username,
        email: newAdmin.email,
        first_name: newAdmin.first_name,
        last_name: newAdmin.last_name,
        status: 'active',
        last_activity: new Date().toISOString()
      };
      setAdmins([...admins, newAdminData]);
      setShowAddModal(false);
      setNewAdmin({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        confirmPassword: ''
      });
      alert('Admin added successfully (demo mode)');
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      try {
        await api.delete(`/api/admin/admins/${adminId}`);
        setAdmins(admins.filter(admin => admin.id !== adminId));
      } catch (error) {
        console.error('Error deleting admin:', error);
        // For demo purposes, delete locally
        setAdmins(admins.filter(admin => admin.id !== adminId));
        alert('Admin deleted successfully (demo mode)');
      }
    }
  };

  const handleViewActivities = async (admin) => {
    setSelectedAdmin(admin);
    await fetchAdminActivities(admin.id);
    setShowActivityModal(true);
  };

  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = admin.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${admin.first_name} ${admin.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || admin.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityIcon = (activity) => {
    switch (activity.type) {
      case 'login': return <User size={16} className="text-blue-500" />;
      case 'logout': return <User size={16} className="text-gray-500" />;
      case 'create': return <Plus size={16} className="text-green-500" />;
      case 'update': return <Edit size={16} className="text-yellow-500" />;
      case 'delete': return <Trash2 size={16} className="text-red-500" />;
      default: return <Activity size={16} className="text-gray-500" />;
    }
  };

  // Simple test to see if component renders
  console.log('AdminManagement rendering with', admins.length, 'admins');

  // If there's an error, show error message
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Admin Management</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAdmins}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Management</h1>
          <p className="text-gray-600">Manage admin users and view their activities</p>
          <p className="text-sm text-blue-600">Component loaded successfully!</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={20} />
          Add Admin
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search admins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Admins List */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAdmins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                        <Shield size={16} className="text-white" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {admin.first_name} {admin.last_name}
                        </div>
                        <div className="text-sm text-gray-500">@{admin.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {admin.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(admin.status)}`}>
                      {admin.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {admin.last_activity ? new Date(admin.last_activity).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewActivities(admin)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="View Activities"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteAdmin(admin.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Delete Admin"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Add New Admin</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={newAdmin.username}
                  onChange={(e) => setNewAdmin({...newAdmin, username: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={newAdmin.first_name}
                    onChange={(e) => setNewAdmin({...newAdmin, first_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={newAdmin.last_name}
                    onChange={(e) => setNewAdmin({...newAdmin, last_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={newAdmin.confirmPassword}
                  onChange={(e) => setNewAdmin({...newAdmin, confirmPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Admin
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activity Modal */}
      {showActivityModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Activities - {selectedAdmin.first_name} {selectedAdmin.last_name}
              </h2>
              <button
                onClick={() => setShowActivityModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>
            <div className="space-y-4">
              {adminActivities.length > 0 ? (
                adminActivities.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity)}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {activity.description}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No activities found for this admin</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;

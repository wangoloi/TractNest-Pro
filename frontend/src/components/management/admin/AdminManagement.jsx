import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Mail,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  DollarSign,
  Activity,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../../shared/Modal';
import Dropdown from '../../shared/Dropdown';

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showGeneratedCredentials, setShowGeneratedCredentials] = useState({});
  const [newAdmin, setNewAdmin] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'admin'
  });

  // Mock data for admins
  useEffect(() => {
    const mockAdmins = [
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@company.com',
        phone: '+1234567890',
        username: 'admin_john',
        status: 'active',
        subscription: {
          plan: 'Premium',
          status: 'active',
          expiresAt: '2024-12-31',
          amount: 99.99
        },
        lastLogin: '2024-01-15T10:30:00Z',
        performance: {
          salesCount: 150,
          revenue: 45000,
          customers: 45
        },
        accessControl: 'enabled'
      },
      {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@company.com',
        phone: '+1234567891',
        username: 'admin_jane',
        status: 'active',
        subscription: {
          plan: 'Basic',
          status: 'expired',
          expiresAt: '2024-01-01',
          amount: 49.99
        },
        lastLogin: '2024-01-10T14:20:00Z',
        performance: {
          salesCount: 89,
          revenue: 26700,
          customers: 23
        },
        accessControl: 'disabled'
      },
      {
        id: 3,
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@company.com',
        phone: '+1234567892',
        username: 'admin_mike',
        status: 'inactive',
        subscription: {
          plan: 'Premium',
          status: 'cancelled',
          expiresAt: '2024-02-01',
          amount: 99.99
        },
        lastLogin: '2024-01-05T09:15:00Z',
        performance: {
          salesCount: 67,
          revenue: 20100,
          customers: 18
        },
        accessControl: 'disabled'
      }
    ];
    setAdmins(mockAdmins);
  }, []);

  const filteredAdmins = admins.filter(admin =>
    admin.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateCredentials = () => {
    const username = `admin_${newAdmin.firstName.toLowerCase()}_${Date.now().toString().slice(-4)}`;
    const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).toUpperCase().slice(-4) + '!1';
    return { username, password };
  };

  const handleAddAdmin = () => {
    if (!newAdmin.firstName || !newAdmin.lastName || !newAdmin.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    const credentials = generateCredentials();
    const admin = {
      id: Date.now(),
      ...newAdmin,
      username: credentials.username,
      status: 'active',
      subscription: {
        plan: 'Basic',
        status: 'trial',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        amount: 49.99
      },
      lastLogin: null,
      performance: {
        salesCount: 0,
        revenue: 0,
        customers: 0
      },
      accessControl: 'enabled'
    };

    setAdmins([...admins, admin]);
    setShowGeneratedCredentials({
      ...showGeneratedCredentials,
      [admin.id]: true
    });
    setNewAdmin({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'admin'
    });
    setShowAddModal(false);
    toast.success('Admin added successfully! Credentials generated.');
  };

  const toggleAccessControl = (adminId) => {
    setAdmins(admins.map(admin =>
      admin.id === adminId
        ? { ...admin, accessControl: admin.accessControl === 'enabled' ? 'disabled' : 'enabled' }
        : admin
    ));
    toast.success('Access control updated');
  };

  const deleteAdmin = (adminId) => {
    setAdmins(admins.filter(admin => admin.id !== adminId));
    toast.success('Admin removed');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSubscriptionColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'trial': return 'text-blue-600 bg-blue-100';
      case 'expired': return 'text-orange-600 bg-orange-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const stats = {
    totalAdmins: admins.length,
    activeAdmins: admins.filter(a => a.status === 'active').length,
    subscribedAdmins: admins.filter(a => a.subscription.status === 'active').length,
    totalRevenue: admins.reduce((sum, admin) => sum + admin.performance.revenue, 0)
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Management</h1>
          <p className="text-gray-600">Manage your admin users, subscriptions, and access controls</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Admins</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAdmins}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Admins</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeAdmins}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Subscribed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.subscribedAdmins}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Activity className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search admins..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Admin
              </button>
            </div>
          </div>

          {/* Admins Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Access Control
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
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {admin.firstName[0]}{admin.lastName[0]}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {admin.firstName} {admin.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{admin.email}</div>
                          <div className="text-xs text-gray-400">@{admin.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(admin.status)}`}>
                        {admin.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSubscriptionColor(admin.subscription.status)}`}>
                          {admin.subscription.status}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {admin.subscription.plan} - ${admin.subscription.amount}
                        </div>
                        <div className="text-xs text-gray-400">
                          Expires: {new Date(admin.subscription.expiresAt).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>Sales: {admin.performance.salesCount}</div>
                        <div>Revenue: ${admin.performance.revenue.toLocaleString()}</div>
                        <div>Customers: {admin.performance.customers}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleAccessControl(admin.id)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          admin.accessControl === 'enabled'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {admin.accessControl === 'enabled' ? (
                          <>
                            <Unlock className="h-3 w-3 mr-1" />
                            Enabled
                          </>
                        ) : (
                          <>
                            <Lock className="h-3 w-3 mr-1" />
                            Disabled
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toast.info('Edit functionality coming soon')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteAdmin(admin.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Generated Credentials Display */}
        {Object.keys(showGeneratedCredentials).length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-yellow-800 mb-2">Generated Credentials</h3>
            <p className="text-sm text-yellow-700 mb-4">
              Please save these credentials securely. They will not be shown again.
            </p>
            {admins.filter(admin => showGeneratedCredentials[admin.id]).map(admin => (
              <div key={admin.id} className="bg-white rounded border border-yellow-300 p-4 mb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{admin.firstName} {admin.lastName}</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-600 w-20">Username:</span>
                        <span className="text-sm text-gray-900 font-mono">{admin.username}</span>
                        <button
                          onClick={() => copyToClipboard(admin.username)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-600 w-20">Password:</span>
                        <span className="text-sm text-gray-900 font-mono">••••••••</span>
                        <button
                          onClick={() => copyToClipboard('generated_password_here')}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowGeneratedCredentials(prev => ({ ...prev, [admin.id]: false }))}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Admin Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        size="lg"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Add New Admin</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={newAdmin.firstName}
                  onChange={(e) => setNewAdmin({ ...newAdmin, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={newAdmin.lastName}
                  onChange={(e) => setNewAdmin({ ...newAdmin, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter last name"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={newAdmin.phone}
                onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter phone number"
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-800">
                  System will automatically generate username and password
                </span>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleAddAdmin}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Admin
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminManagement;

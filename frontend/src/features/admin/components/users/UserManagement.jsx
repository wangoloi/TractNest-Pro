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
  Eye,
  Lock,
  Unlock,
  UserPlus,
  Activity,
  Calendar,
  Phone,
  MapPin,
  Copy,
  RefreshCw,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../../shared/Modal';
import Dropdown from '../../shared/Dropdown';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGeneratedCredentials, setShowGeneratedCredentials] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    role: 'user'
  });

  // Mock data for users
  useEffect(() => {
    const mockUsers = [
      {
        id: 1,
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@company.com',
        phone: '+1234567890',
        address: '123 Main St, City, State',
        username: 'user_alice',
        status: 'active',
        role: 'user',
        lastLogin: '2024-01-15T10:30:00Z',
        registrationDate: '2024-01-01T09:00:00Z',
        activity: {
          loginCount: 45,
          lastPurchase: '2024-01-14T15:20:00Z',
          totalPurchases: 12,
          totalSpent: 2400
        },
        accessControl: 'enabled'
      },
      {
        id: 2,
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob.smith@company.com',
        phone: '+1234567891',
        address: '456 Oak Ave, City, State',
        username: 'user_bob',
        status: 'active',
        role: 'user',
        lastLogin: '2024-01-14T14:20:00Z',
        registrationDate: '2024-01-02T11:00:00Z',
        activity: {
          loginCount: 23,
          lastPurchase: '2024-01-13T16:30:00Z',
          totalPurchases: 8,
          totalSpent: 1800
        },
        accessControl: 'enabled'
      },
      {
        id: 3,
        firstName: 'Carol',
        lastName: 'Davis',
        email: 'carol.davis@company.com',
        phone: '+1234567892',
        address: '789 Pine Rd, City, State',
        username: 'user_carol',
        status: 'inactive',
        role: 'user',
        lastLogin: '2024-01-10T09:15:00Z',
        registrationDate: '2024-01-03T13:00:00Z',
        activity: {
          loginCount: 12,
          lastPurchase: '2024-01-09T12:45:00Z',
          totalPurchases: 3,
          totalSpent: 600
        },
        accessControl: 'disabled'
      }
    ];
    setUsers(mockUsers);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const generateCredentials = () => {
    const username = `user_${newUser.firstName.toLowerCase()}_${Date.now().toString().slice(-4)}`;
    const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).toUpperCase().slice(-4) + '!1';
    return { username, password };
  };

  const handleAddUser = () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    const credentials = generateCredentials();
    const user = {
      id: Date.now(),
      ...newUser,
      username: credentials.username,
      status: 'active',
      lastLogin: null,
      registrationDate: new Date().toISOString(),
      activity: {
        loginCount: 0,
        lastPurchase: null,
        totalPurchases: 0,
        totalSpent: 0
      },
      accessControl: 'enabled'
    };

    setUsers([...users, user]);
    setShowGeneratedCredentials({
      ...showGeneratedCredentials,
      [user.id]: true
    });
    setNewUser({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      role: 'user'
    });
    setShowAddModal(false);
    toast.success('User registered successfully! Credentials sent to email.');
  };

  const toggleAccessControl = (userId) => {
    setUsers(users.map(user =>
      user.id === userId
        ? { ...user, accessControl: user.accessControl === 'enabled' ? 'disabled' : 'enabled' }
        : user
    ));
    toast.success('User access control updated');
  };

  const deleteUser = (userId) => {
    setUsers(users.filter(user => user.id !== userId));
    toast.success('User removed');
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



  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    enabledUsers: users.filter(u => u.accessControl === 'enabled').length,
    totalActivity: users.reduce((sum, user) => sum + user.activity.loginCount, 0)
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Register and manage your business users</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Enabled Access</p>
                <p className="text-2xl font-bold text-gray-900">{stats.enabledUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Activity className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Logins</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalActivity}</p>
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
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Register User
                </button>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
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
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {user.firstName[0]}{user.lastName[0]}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-xs text-gray-400">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>Logins: {user.activity.loginCount}</div>
                        <div>Purchases: {user.activity.totalPurchases}</div>
                        <div>Spent: ${user.activity.totalSpent}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleAccessControl(user.id)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          user.accessControl === 'enabled'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {user.accessControl === 'enabled' ? (
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
                          onClick={() => toast.info('View user details coming soon')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toast.info('Edit user coming soon')}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
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
            {users.filter(user => showGeneratedCredentials[user.id]).map(user => (
              <div key={user.id} className="bg-white rounded border border-yellow-300 p-4 mb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-600 w-20">Username:</span>
                        <span className="text-sm text-gray-900 font-mono">{user.username}</span>
                        <button
                          onClick={() => copyToClipboard(user.username)}
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
                    onClick={() => setShowGeneratedCredentials(prev => ({ ...prev, [user.id]: false }))}
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

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        size="lg"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Register New User</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
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
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
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
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
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
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                value={newUser.address}
                onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter address"
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-800">
                  System will automatically generate username and password, and send them to the user's email
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
              onClick={handleAddUser}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Register User
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Shield,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  Copy,
  CheckCircle,
  X,
  Mail,
  MailCheck
} from 'lucide-react';
import { useAuth } from '../../app/providers/AuthContext';
import DataTable from '../ui/tables/DataTable';
import Modal from '../ui/modals/Modal';
import Dropdown from '../ui/forms/Dropdown';

const EnterpriseUsers = () => {
  const { getAllUsers, updateUserStatus, addNewUser, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'admin',
    status: 'active'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setLoading(true);
    try {
      const allUsers = getAllUsers();
      const adminUsers = allUsers.filter(user => user.role === 'admin');
      setUsers(adminUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    switch (activeFilter) {
      case 'active':
        return user.status === 'active' && !user.isBlocked;
      case 'blocked':
        return user.isBlocked;
      case 'admins':
        return user.role === 'admin';
      default:
        return true;
    }
  });

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      first_name: '',
      last_name: '',
      role: 'admin',
      status: 'active'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editingUser) {
      setUsers(users.map(user => 
        user.username === editingUser.username 
          ? { ...user, ...formData, name: `${formData.first_name} ${formData.last_name}`.trim() }
          : user
      ));
      setShowModal(false);
    } else {
      try {
        setLoading(true);
        const result = await addNewUser({
          firstName: formData.first_name,
          lastName: formData.last_name,
          email: formData.email,
          role: formData.role,
          status: formData.status
        });
        
        setGeneratedCredentials(result.credentials);
        setShowCredentialsModal(true);
        setShowModal(false);
        loadUsers();
      } catch (error) {
        console.error('Error adding new user:', error);
        alert('Failed to add new user. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDropdownChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const columns = [
    {
      key: 'username',
      header: 'Admin User',
      accessor: (user) => user.username,
      render: (user) => (
        <div>
          <div className="font-medium text-gray-900">{user.name}</div>
          <div className="text-sm text-gray-500">@{user.username}</div>
          <div className="text-xs text-gray-400">{user.email}</div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      accessor: (user) => user.role,
      render: (user) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          {user.role}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (user) => user.status,
      render: (user) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user.isBlocked ? 'bg-red-100 text-red-800' :
          user.status === 'active' ? 'bg-green-100 text-green-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {user.isBlocked ? 'Blocked' : user.status}
        </span>
      )
    },
    {
      key: 'credentials',
      header: 'Stored Credentials',
      accessor: (user) => user.generatedCredentials,
      render: (user) => {
        if (!user.generatedCredentials) return <span className="text-gray-400">-</span>;
        
        return (
          <div className="text-sm">
            <div className="font-medium text-gray-900">
              {user.generatedCredentials.username}
            </div>
            <div className="text-xs text-gray-500 font-mono">
              {user.generatedCredentials.password}
            </div>
            <div className="text-xs text-gray-400">
              Generated: {new Date(user.generatedCredentials.generatedAt).toLocaleDateString()}
            </div>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="text-purple-600" size={32} />
            Enterprise Users Management
          </h1>
          <p className="text-gray-600">Manage admin users across all organizations</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus size={20} />
          Add Admin
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => setActiveFilter('all')}
          className={`bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all duration-200 hover:shadow-md ${
            activeFilter === 'all' ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Admins</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <div className={`p-3 rounded-lg ${
              activeFilter === 'all' ? 'bg-purple-200' : 'bg-purple-100'
            }`}>
              <Shield size={24} className="text-purple-600" />
            </div>
          </div>
        </button>

        <button
          onClick={() => setActiveFilter('active')}
          className={`bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all duration-200 hover:shadow-md ${
            activeFilter === 'active' ? 'ring-2 ring-green-500 bg-green-50' : 'hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Admins</p>
              <p className="text-2xl font-bold text-green-600">
                {users.filter(u => u.status === 'active' && !u.isBlocked).length}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${
              activeFilter === 'active' ? 'bg-green-200' : 'bg-green-100'
            }`}>
              <UserCheck size={24} className="text-green-600" />
            </div>
          </div>
        </button>

        <button
          onClick={() => setActiveFilter('blocked')}
          className={`bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all duration-200 hover:shadow-md ${
            activeFilter === 'blocked' ? 'ring-2 ring-red-500 bg-red-50' : 'hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Blocked Admins</p>
              <p className="text-2xl font-bold text-red-600">
                {users.filter(u => u.isBlocked).length}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${
              activeFilter === 'blocked' ? 'bg-red-200' : 'bg-red-100'
            }`}>
              <UserX size={24} className="text-red-600" />
            </div>
          </div>
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <DataTable
          data={filteredUsers}
          columns={columns}
          loading={loading}
          showSearch={true}
          showFilters={true}
          showExport={true}
          pageSize={10}
          pageSizeOptions={[5, 10, 25, 50]}
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? 'Edit Admin User' : 'Add New Admin User'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
            <div className="flex items-end">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <Dropdown
                  options={[
                    { value: 'admin', label: 'Admin' },
                    { value: 'owner', label: 'Owner' }
                  ]}
                  value={formData.role}
                  onChange={(value) => handleDropdownChange('role', value)}
                  placeholder="Select role..."
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <Dropdown
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
              ]}
              value={formData.status}
              onChange={(value) => handleDropdownChange('status', value)}
              placeholder="Select status..."
            />
          </div>
          
          {!editingUser && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-purple-600" size={20} />
                <div>
                  <h3 className="font-medium text-purple-800">Auto-Generated Credentials</h3>
                  <p className="text-sm text-purple-600 mt-1">
                    Username and password will be automatically generated based on the admin's name.
                  </p>
                  <p className="text-xs text-purple-500 mt-1">
                    Password format: firstname@lastname (e.g., john@doe)
                  </p>
                  <p className="text-xs text-purple-500">
                    Credentials will be automatically sent to the admin's email address.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Admin...' : (editingUser ? 'Update Admin' : 'Add Admin')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Generated Credentials Modal */}
      <Modal
        isOpen={showCredentialsModal}
        onClose={() => setShowCredentialsModal(false)}
        title="Admin Account Created Successfully!"
      >
        <div className="space-y-6">
          {generatedCredentials && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-600" size={20} />
                <div>
                  <h3 className="font-medium text-green-800">Admin Account Created</h3>
                  <p className="text-sm text-green-600 mt-1">
                    New admin account has been created with auto-generated credentials.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Email Status */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              {generatedCredentials?.emailSent ? (
                <MailCheck className="text-green-600" size={20} />
              ) : (
                <Mail className="text-purple-600" size={20} />
              )}
              <div>
                <h3 className="font-medium text-purple-800">
                  {generatedCredentials?.emailSent ? 'Email Sent Successfully' : 'Email Status'}
                </h3>
                <p className="text-sm text-purple-600 mt-1">
                  {generatedCredentials?.emailSent 
                    ? 'Credentials have been automatically sent to the admin\'s email address.'
                    : 'Email sending is in progress...'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Generated Username
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={generatedCredentials?.username || ''}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(generatedCredentials?.username || '', 'username')}
                  className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded transition-colors"
                  title="Copy username"
                >
                  {copiedField === 'username' ? <CheckCircle size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Generated Password (Name-based)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={generatedCredentials?.password || ''}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(generatedCredentials?.password || '', 'password')}
                  className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded transition-colors"
                  title="Copy password"
                >
                  {copiedField === 'password' ? <CheckCircle size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Password format: firstname@lastname (based on admin's name)
              </p>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-yellow-600 mt-0.5">⚠️</div>
              <div>
                <h4 className="font-medium text-yellow-800 mb-2">Important Instructions</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Share these credentials securely with the new admin</li>
                  <li>• The admin should change their password upon first login</li>
                  <li>• Keep these credentials confidential and secure</li>
                  <li>• Store this information safely for future reference</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowCredentialsModal(false)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EnterpriseUsers;

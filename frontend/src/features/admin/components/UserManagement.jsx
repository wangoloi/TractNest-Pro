import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, UserCheck, UserX, Search, Shield, Lock, Unlock, Copy, CheckCircle, X, Mail, MailCheck } from 'lucide-react';
import { useAuth } from '../../../app/providers/AuthContext';
import DataTable from '../../../components/ui/tables/DataTable';
import Modal from '../../../components/ui/modals/Modal';
import Dropdown from '../../../components/ui/forms/Dropdown';
import { formatCredentialsMessage, generateEmailContent } from '../../../lib/utils/userGenerator';
import EmailNotification from '../../../components/email/EmailNotification';

const UserManagement = () => {
  const { getAllUsers, updateUserStatus, addNewUser, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [blockReason, setBlockReason] = useState('');
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showEmailNotification, setShowEmailNotification] = useState(false);
  const [emailData, setEmailData] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'user',
    status: 'active'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setLoading(true);
    try {
      const allUsers = getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on active filter
  const filteredUsers = users.filter(user => {
    switch (activeFilter) {
      case 'active':
        return user.status === 'active' && !user.isBlocked;
      case 'blocked':
        return user.isBlocked;
      case 'admins':
        return user.role === 'admin';
      case 'inactive':
        return user.status === 'inactive';
      default:
        return true; // 'all' case
    }
  });

  const handleBlockUser = (user) => {
    setSelectedUser(user);
    setBlockReason('');
    setShowBlockModal(true);
  };

  const handleUnblockUser = (user) => {
    setSelectedUser(user);
    setShowUnblockModal(true);
  };

  const confirmBlockUser = () => {
    if (!selectedUser || !blockReason.trim()) return;

    try {
      updateUserStatus(selectedUser.username, 'blocked', blockReason, currentUser.username);
      loadUsers(); // Reload users
      setShowBlockModal(false);
      setSelectedUser(null);
      setBlockReason('');
    } catch (error) {
      console.error('Error blocking user:', error);
      alert('Failed to block user. Please try again.');
    }
  };

  const confirmUnblockUser = () => {
    if (!selectedUser) return;

    try {
      updateUserStatus(selectedUser.username, 'active', null, null);
      loadUsers(); // Reload users
      setShowUnblockModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error unblocking user:', error);
      alert('Failed to unblock user. Please try again.');
    }
  };

  const getStatusBadge = (user) => {
    if (user.isBlocked) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <Lock size={12} className="mr-1" />
          Blocked
        </span>
      );
    }
    
    switch (user.status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <UserCheck size={12} className="mr-1" />
            Active
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <UserX size={12} className="mr-1" />
            Inactive
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Unknown
          </span>
        );
    }
  };

  const columns = [
    {
      key: 'username',
      header: 'Username',
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
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user.role === 'admin' 
            ? 'bg-purple-100 text-purple-800' 
            : user.role === 'owner'
            ? 'bg-indigo-100 text-indigo-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {user.role}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (user) => user.status,
      render: (user) => getStatusBadge(user)
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      accessor: (user) => user.lastLogin,
      render: (user) => (
        <div className="text-sm">
          {user.lastLogin ? (
            <div>
              <div>{new Date(user.lastLogin).toLocaleDateString()}</div>
              <div className="text-xs text-gray-500">
                {new Date(user.lastLogin).toLocaleTimeString()}
              </div>
            </div>
          ) : (
            <span className="text-gray-400">Never</span>
          )}
        </div>
      )
    },
    {
      key: 'blockedInfo',
      header: 'Block Info',
      accessor: (user) => user.isBlocked,
      render: (user) => {
        if (!user.isBlocked) return <span className="text-gray-400">-</span>;
        
        return (
          <div className="text-sm">
            <div className="text-red-600 font-medium">
              Blocked by {user.blockedBy}
            </div>
            <div className="text-xs text-gray-500">
              {user.blockedAt && new Date(user.blockedAt).toLocaleDateString()}
            </div>
            {user.blockedReason && (
              <div className="text-xs text-gray-600 mt-1">
                "{user.blockedReason}"
              </div>
            )}
          </div>
        );
      }
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
            <div className="text-xs text-gray-400">
              By: {user.generatedCredentials.generatedBy}
            </div>
          </div>
        );
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(user)}
            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
            title="Edit user"
          >
            <Edit size={16} />
          </button>
          
          <button
            onClick={() => handleBlockUser(user)}
            disabled={user.isBlocked || user.role === 'owner' || user.username === currentUser?.username}
            className={`p-1 rounded transition-colors ${
              user.isBlocked || user.role === 'owner' || user.username === currentUser?.username
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-red-600 hover:text-red-800 hover:bg-red-50'
            }`}
            title={
              user.isBlocked 
                ? 'User is already blocked' 
                : user.role === 'owner' 
                ? 'Cannot block owner' 
                : user.username === currentUser?.username 
                ? 'Cannot block yourself' 
                : 'Block user'
            }
          >
            <Lock size={16} />
          </button>
          
          <button
            onClick={() => handleUnblockUser(user)}
            disabled={!user.isBlocked}
            className={`p-1 rounded transition-colors ${
              !user.isBlocked
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-green-600 hover:text-green-800 hover:bg-green-50'
            }`}
            title={!user.isBlocked ? 'User is not blocked' : 'Unblock user'}
          >
            <Unlock size={16} />
          </button>
          
          <button
            onClick={() => handleDelete(user)}
            disabled={user.role === 'owner' || user.username === currentUser?.username}
            className={`p-1 rounded transition-colors ${
              user.role === 'owner' || user.username === currentUser?.username
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-red-600 hover:text-red-800 hover:bg-red-50'
            }`}
            title={
              user.role === 'owner' 
                ? 'Cannot delete owner' 
                : user.username === currentUser?.username 
                ? 'Cannot delete yourself' 
                : 'Delete user'
            }
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      first_name: '',
      last_name: '',
      role: 'user',
      status: 'active'
    });
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      first_name: user.name.split(' ')[0] || '',
      last_name: user.name.split(' ').slice(1).join(' ') || '',
      role: user.role,
      status: user.status
    });
    setShowModal(true);
  };

  const handleDelete = (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      setUsers(users.filter(u => u.username !== user.username));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔄 handleSubmit called with formData:', formData);
    
    if (editingUser) {
      // Update existing user
      setUsers(users.map(user => 
        user.username === editingUser.username 
          ? { ...user, ...formData, name: `${formData.first_name} ${formData.last_name}`.trim() }
          : user
      ));
      setShowModal(false);
    } else {
      // Add new user with auto-generated credentials
      try {
        console.log('🔄 Adding new user with data:', {
          firstName: formData.first_name,
          lastName: formData.last_name,
          email: formData.email,
          role: formData.role,
          status: formData.status
        });
        
        setLoading(true);
        const result = await addNewUser({
          firstName: formData.first_name,
          lastName: formData.last_name,
          email: formData.email,
          role: formData.role,
          status: formData.status
        });
        
        console.log('🔍 Result from addNewUser:', result);
        console.log('🔍 Credentials object:', result.credentials);
        console.log('🔍 Password value:', result.credentials?.password);
        
        // Show credentials modal
        setGeneratedCredentials(result.credentials);
         setShowCredentialsModal(true);
         setShowModal(false);
         
         // Prepare email data for notification
         const emailContent = generateEmailContent(
           result.credentials.username,
           result.credentials.password,
           `${formData.first_name} ${formData.last_name}`,
           currentUser?.name || 'Administrator'
         );
         
         setEmailData({
           to: formData.email,
           subject: emailContent.subject,
           body: emailContent.body
         });
         
         // Show email notification
         setShowEmailNotification(true);
         
         // Reload users to show the new user
         loadUsers();
      } catch (error) {
        console.error('Error adding new user:', error);
        const errorMessage = error.message || 'Failed to add new user. Please try again.';
        alert(`Error: ${errorMessage}`);
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
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="text-blue-600" size={32} />
            User Management
          </h1>
          <p className="text-gray-600">Manage users within your organization</p>
          <p className="text-sm text-blue-600 mt-2">
            🔒 <strong>Access Control:</strong> Block or unblock users, manage roles, and control access permissions.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <button
          onClick={() => setActiveFilter('all')}
          className={`bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all duration-200 hover:shadow-md ${
            activeFilter === 'all' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <div className={`p-3 rounded-lg ${
              activeFilter === 'all' ? 'bg-blue-200' : 'bg-blue-100'
            }`}>
              <Shield size={24} className="text-blue-600" />
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
              <p className="text-sm font-medium text-gray-600">Active Users</p>
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
              <p className="text-sm font-medium text-gray-600">Blocked Users</p>
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

        <button
          onClick={() => setActiveFilter('admins')}
          className={`bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all duration-200 hover:shadow-md ${
            activeFilter === 'admins' ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-purple-600">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${
              activeFilter === 'admins' ? 'bg-purple-200' : 'bg-purple-100'
            }`}>
              <Shield size={24} className="text-purple-600" />
            </div>
          </div>
        </button>
      </div>

      {/* Filter Indicator */}
      {activeFilter !== 'all' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                <span>
                  {activeFilter === 'active' && 'Active Users'}
                  {activeFilter === 'blocked' && 'Blocked Users'}
                  {activeFilter === 'admins' && 'Admin Users'}
                  {activeFilter === 'inactive' && 'Inactive Users'}
                </span>
                <button
                  onClick={() => setActiveFilter('all')}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <span className="text-sm text-gray-600">
                Showing {filteredUsers.length} of {users.length} users
              </span>
            </div>
            {filteredUsers.length === 0 && (
              <p className="text-sm text-gray-500">No users found matching your criteria</p>
            )}
          </div>
        </div>
      )}

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
        title={editingUser ? 'Edit User' : 'Add New User'}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    { value: 'user', label: 'User' },
                    { value: 'admin', label: 'Admin' }
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-blue-600" size={20} />
                <div>
                  <h3 className="font-medium text-blue-800">Auto-Generated Credentials</h3>
                  <p className="text-sm text-blue-600 mt-1">
                    Username and password will be automatically generated based on the user's name.
                  </p>
                  <p className="text-xs text-blue-500 mt-1">
                    Password format: firstname@lastname (e.g., john@doe)
                  </p>
                  <p className="text-xs text-blue-500">
                    Credentials will be automatically sent to the user's email address.
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating User...' : (editingUser ? 'Update User' : 'Add User')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Block User Modal */}
      <Modal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        title="Block User Access"
      >
        <div className="space-y-4">
          {selectedUser && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <UserX className="text-red-600" size={20} />
                <div>
                  <h3 className="font-medium text-red-800">
                    Block {selectedUser.name} (@{selectedUser.username})
                  </h3>
                  <p className="text-sm text-red-600 mt-1">
                    This will immediately revoke their access to the system.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Blocking
            </label>
            <textarea
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
              rows={3}
              placeholder="Enter the reason for blocking this user..."
              required
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowBlockModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmBlockUser}
              disabled={!blockReason.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Block User
            </button>
          </div>
        </div>
      </Modal>

      {/* Unblock User Modal */}
      <Modal
        isOpen={showUnblockModal}
        onClose={() => setShowUnblockModal(false)}
        title="Unblock User Access"
      >
        <div className="space-y-4">
          {selectedUser && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <UserCheck className="text-green-600" size={20} />
                <div>
                  <h3 className="font-medium text-green-800">
                    Unblock {selectedUser.name} (@{selectedUser.username})
                  </h3>
                  <p className="text-sm text-green-600 mt-1">
                    This will restore their access to the system.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowUnblockModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmUnblockUser}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Unblock User
            </button>
          </div>
        </div>
      </Modal>

      {/* Generated Credentials Modal */}
      <Modal
        isOpen={showCredentialsModal}
        onClose={() => setShowCredentialsModal(false)}
        title="User Account Created Successfully!"
      >
        <div className="space-y-6">
          {generatedCredentials && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-600" size={20} />
                <div>
                  <h3 className="font-medium text-green-800">Account Created</h3>
                  <p className="text-sm text-green-600 mt-1">
                    New user account has been created with auto-generated credentials.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Email Status */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              {generatedCredentials?.emailSent ? (
                <MailCheck className="text-green-600" size={20} />
              ) : (
                <Mail className="text-blue-600" size={20} />
              )}
              <div>
                <h3 className="font-medium text-blue-800">
                  {generatedCredentials?.emailSent ? 'Email Sent Successfully' : 'Email Status'}
                </h3>
                <p className="text-sm text-blue-600 mt-1">
                  {generatedCredentials?.emailSent 
                    ? 'Credentials have been automatically sent to the user\'s email address.'
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
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
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
                  style={{ fontFamily: 'monospace' }}
                  autoComplete="off"
                  spellCheck="false"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(generatedCredentials?.password || '', 'password')}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                  title="Copy password"
                >
                  {copiedField === 'password' ? <CheckCircle size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Password format: firstname@lastname (based on user's name)
              </p>
              {/* Debug info */}
              <p className="text-xs text-red-500 mt-1">
                Debug: Password length: {generatedCredentials?.password?.length || 0}
              </p>
              {/* Fallback password display */}
              {generatedCredentials?.password && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-xs text-yellow-800 font-medium">Password (fallback display):</p>
                  <p className="text-sm font-mono text-yellow-900 break-all">
                    {generatedCredentials.password}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-yellow-600 mt-0.5">⚠️</div>
              <div>
                <h4 className="font-medium text-yellow-800 mb-2">Important Instructions</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Share these credentials securely with the new user</li>
                  <li>• The user should change their password upon first login</li>
                  <li>• Keep these credentials confidential and secure</li>
                  <li>• Store this information safely for future reference</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowCredentialsModal(false)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Done
            </button>
                     </div>
         </div>
       </Modal>

       {/* Email Notification Modal */}
       <EmailNotification
         isOpen={showEmailNotification}
         onClose={() => setShowEmailNotification(false)}
         emailData={emailData}
         title="Send Email to New User"
       />
     </div>
     
   );
 };

export default UserManagement;

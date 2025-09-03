import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  UserCheck, 
  UserX, 
  AlertTriangle, 
  Clock, 
  Edit, 
  Eye, 
  Lock, 
  Unlock,
  Users,
  Activity,
  Calendar,
  MessageSquare,
  X
} from 'lucide-react';
import { useAuth } from '../../../app/providers/AuthContext';
import Modal from '../../../components/ui/modals/Modal';
import Dropdown from '../../../components/ui/forms/Dropdown';
import DataTable from '../../../components/ui/tables/DataTable';

const AccessControl = () => {
  const { getAllUsers, updateUserStatus, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [blockReason, setBlockReason] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');

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
            <Clock size={12} className="mr-1" />
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

  const getRoleBadge = (user) => {
    const roleColors = {
      owner: 'bg-purple-100 text-purple-800',
      admin: 'bg-blue-100 text-blue-800',
      user: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role] || roleColors.user}`}>
        {user.role}
      </span>
    );
  };

  const columns = [
    {
      key: 'username',
      header: 'User',
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
      render: (user) => getRoleBadge(user)
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
      key: 'actions',
      header: 'Actions',
      render: (user) => (
        <div className="flex items-center gap-2">
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
            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
            title="View user details"
          >
            <Eye size={16} />
          </button>
        </div>
      )
    }
  ];

  // Filter users based on active filter from stats cards
  const filteredUsers = users.filter(user => {
    // Apply active filter from stats cards
    let matchesActiveFilter = true;
    if (activeFilter === 'active') {
      matchesActiveFilter = user.status === 'active' && !user.isBlocked;
    } else if (activeFilter === 'blocked') {
      matchesActiveFilter = user.isBlocked;
    } else if (activeFilter === 'inactive') {
      matchesActiveFilter = user.status === 'inactive';
    }
    
    // Apply dropdown filter
    let matchesDropdownFilter = true;
    if (filterStatus === 'blocked') matchesDropdownFilter = user.isBlocked;
    else if (filterStatus === 'active') matchesDropdownFilter = user.status === 'active' && !user.isBlocked;
    else if (filterStatus === 'inactive') matchesDropdownFilter = user.status === 'inactive';
    
    return matchesActiveFilter && matchesDropdownFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Shield className="text-blue-600" size={32} />
              Access Control
            </h1>
            <p className="text-gray-600 mt-1">Manage user access and permissions</p>
            <p className="text-sm text-blue-600 mt-2">
              🔒 <strong>Security:</strong> Block or unblock users, control access levels, and monitor user activity.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Dropdown
              options={[
                { value: 'all', label: 'All Users' },
                { value: 'active', label: 'Active Users' },
                { value: 'blocked', label: 'Blocked Users' },
                { value: 'inactive', label: 'Inactive Users' }
              ]}
              value={filterStatus}
              onChange={setFilterStatus}
              placeholder="Filter by status..."
            />
            <button
              onClick={loadUsers}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Activity size={16} />
              Refresh
            </button>
          </div>
        </div>
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
              <Users size={24} className="text-blue-600" />
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
          onClick={() => setActiveFilter('inactive')}
          className={`bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all duration-200 hover:shadow-md ${
            activeFilter === 'inactive' ? 'ring-2 ring-yellow-500 bg-yellow-50' : 'hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive Users</p>
              <p className="text-2xl font-bold text-yellow-600">
                {users.filter(u => u.status === 'inactive').length}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${
              activeFilter === 'inactive' ? 'bg-yellow-200' : 'bg-yellow-100'
            }`}>
              <Clock size={24} className="text-yellow-600" />
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

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <DataTable
          data={filteredUsers}
          columns={columns}
          loading={loading}
          showSearch={true}
          showFilters={false}
          showExport={true}
          pageSize={10}
          pageSizeOptions={[5, 10, 25, 50]}
        />
      </div>

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
                <AlertTriangle className="text-red-600" size={20} />
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
    </div>
  );
};

export default AccessControl;

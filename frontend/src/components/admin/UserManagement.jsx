import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, UserCheck, UserX, Search } from 'lucide-react';
import DataTable from '../shared/DataTable';
import Modal from '../shared/Modal';
import Dropdown from '../shared/Dropdown';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'user',
    status: 'active'
  });

  // Mock data for users
  const mockUsers = [
    {
      id: 1,
      username: 'john_doe',
      email: 'john@example.com',
      first_name: 'John',
      last_name: 'Doe',
      role: 'user',
      status: 'active',
      created_at: '2024-01-15',
      last_login: '2024-01-20'
    },
    {
      id: 2,
      username: 'jane_smith',
      email: 'jane@example.com',
      first_name: 'Jane',
      last_name: 'Smith',
      role: 'admin',
      status: 'active',
      created_at: '2024-01-10',
      last_login: '2024-01-19'
    },
    {
      id: 3,
      username: 'bob_wilson',
      email: 'bob@example.com',
      first_name: 'Bob',
      last_name: 'Wilson',
      role: 'user',
      status: 'inactive',
      created_at: '2024-01-05',
      last_login: '2024-01-15'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, []);

  const columns = [
    {
      key: 'username',
      header: 'Username',
      accessor: (user) => user.username
    },
    {
      key: 'name',
      header: 'Full Name',
      accessor: (user) => `${user.first_name} ${user.last_name}`,
      render: (user) => (
        <div>
          <div className="font-medium text-gray-900">{user.first_name} {user.last_name}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
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
      render: (user) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {user.status}
        </span>
      )
    },
    {
      key: 'created_at',
      header: 'Created',
      accessor: (user) => user.created_at,
      render: (user) => new Date(user.created_at).toLocaleDateString()
    },
    {
      key: 'last_login',
      header: 'Last Login',
      accessor: (user) => user.last_login,
      render: (user) => new Date(user.last_login).toLocaleDateString()
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(user)}
            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleToggleStatus(user)}
            className={`p-1 rounded ${
              user.status === 'active'
                ? 'text-red-600 hover:text-red-800 hover:bg-red-50'
                : 'text-green-600 hover:text-green-800 hover:bg-green-50'
            }`}
          >
            {user.status === 'active' ? <UserX size={16} /> : <UserCheck size={16} />}
          </button>
          <button
            onClick={() => handleDelete(user)}
            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
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
      username: '',
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
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      status: user.status
    });
    setShowModal(true);
  };

  const handleDelete = (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.first_name} ${user.last_name}?`)) {
      setUsers(users.filter(u => u.id !== user.id));
    }
  };

  const handleToggleStatus = (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    setUsers(users.map(u => 
      u.id === user.id ? { ...u, status: newStatus } : u
    ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingUser) {
      // Update existing user
      setUsers(users.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...formData }
          : user
      ));
    } else {
      // Add new user
      const newUser = {
        id: Date.now(),
        ...formData,
        created_at: new Date().toISOString().split('T')[0],
        last_login: new Date().toISOString().split('T')[0]
      };
      setUsers([...users, newUser]);
    }
    
    setShowModal(false);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage users within your organization</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add User
        </button>
      </div>

      {/* Data Table */}
      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        showSearch={true}
        showFilters={true}
        showExport={true}
        pageSize={10}
        pageSizeOptions={[5, 10, 25, 50]}
      />

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
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
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
          
          <div className="grid grid-cols-2 gap-4">
            <div>
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
          </div>
          
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingUser ? 'Update User' : 'Add User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;

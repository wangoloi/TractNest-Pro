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
  X,
  Printer
} from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../../../../components/ui/modals/Modal';
import Dropdown from '../../../../components/ui/forms/Dropdown';
import { useAuth } from '../../../../app/providers/AuthContext';
import { generateUsername, generatePassword, generateEmailContent, sendEmail } from '../../../../lib/utils/userGenerator';

const AdminManagement = () => {
  const { addNewUser, getAllUsers, updateUserStatus, updateUserDetails, deleteUser, addNewAdminWithBusiness, addSubUserToBusiness, user: currentUser } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showGeneratedCredentials, setShowGeneratedCredentials] = useState({});
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [newAdmin, setNewAdmin] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    businessName: '',
    businessType: 'retail',
    businessAddress: '',
    businessPhone: '',
    businessEmail: '',
    role: 'admin'
  });
  
  // New state for view, edit, and delete modals
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [deletingAdmin, setDeletingAdmin] = useState(null);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    businessName: '',
    businessType: 'retail',
    businessAddress: '',
    businessPhone: '',
    businessEmail: ''
  });

  // Load admins from AuthContext on component mount
  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = () => {
    try {
      setLoading(true);
      console.log('🔄 Loading users from AuthContext...');
      console.log('👤 Current user:', currentUser);
      
      const allUsers = getAllUsers();
      console.log('📋 All users from AuthContext:', allUsers);
      
      let filteredUsers = [];
      
      // Business isolation logic
      if (currentUser?.role === 'owner') {
        // Owner can see all admin users
        filteredUsers = allUsers.filter(user => user.role === 'admin');
        console.log('👑 Owner view: All admin users');
      } else if (currentUser?.role === 'admin') {
        // Admin can only see their own sub-users (users with same businessId)
        filteredUsers = allUsers.filter(user => 
          user.businessId === currentUser.businessId && user.role !== 'admin'
        );
        console.log('👥 Admin view: Only sub-users in same business');
      } else {
        // Other roles see no users
        filteredUsers = [];
        console.log('🚫 No access: User role not authorized');
      }
      
      console.log('👥 Filtered users found:', filteredUsers);
      
      // Transform the data to match the expected format
      const transformedAdmins = filteredUsers.map(user => ({
        id: user.username, // Use username as ID
        firstName: user.name.split(' ')[0] || '',
        lastName: user.name.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || '',
        username: user.username,
        role: user.role, // Include role for display
        status: user.status || 'active',
        businessId: user.businessId || '',
        businessName: user.businessName || 'No Business',
        businessType: user.businessType || 'retail',
        businessAddress: user.businessAddress || '',
        businessPhone: user.businessPhone || '',
        businessEmail: user.businessEmail || '',
        subscription: {
          plan: user.subscription?.plan || 'Basic',
          status: user.subscription?.status || (user.status === 'active' ? 'active' : 'inactive'),
          expiresAt: user.subscription?.nextPayment || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          amount: user.subscription?.amount || 49.99
        },
        lastLogin: user.lastLogin,
        performance: {
          salesCount: 0,
          revenue: 0,
          customers: 0
        },
        accessControl: user.isBlocked ? 'disabled' : 'enabled',
        subUsers: user.subUsers || [],
        permissions: user.permissions || {},
        // Include generated credentials if available
        generatedCredentials: user.generatedCredentials
      }));
      
      setAdmins(transformedAdmins);
      console.log('✅ Loaded users from AuthContext:', transformedAdmins);
    } catch (error) {
      console.error('❌ Error loading admins:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  // Filter admins based on active filter and search term
  const filteredAdmins = admins.filter(admin => {
    // Apply search filter
    const matchesSearch = 
      admin.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply active filter from stats cards
    let matchesActiveFilter = true;
    if (activeFilter === 'active') {
      matchesActiveFilter = admin.status === 'active';
    } else if (activeFilter === 'subscribed') {
      matchesActiveFilter = admin.subscription.status === 'active';
    } else if (activeFilter === 'inactive') {
      matchesActiveFilter = admin.status === 'inactive';
    }
    
    return matchesSearch && matchesActiveFilter;
  });



  const handleAddAdmin = async () => {
    if (!newAdmin.firstName || !newAdmin.lastName || !newAdmin.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Additional validation for owner adding admin
    if (currentUser?.role === 'owner' && !newAdmin.businessName) {
      toast.error('Business name is required when adding an admin');
      return;
    }

    try {
      setLoading(true);
      let result;
      
      if (currentUser?.role === 'owner') {
        // Owner is adding a new admin with business
        console.log('🔄 Owner adding new admin with business data:', newAdmin);

        result = await addNewAdminWithBusiness({
          firstName: newAdmin.firstName,
          lastName: newAdmin.lastName,
          email: newAdmin.email,
          phone: newAdmin.phone,
          businessName: newAdmin.businessName,
          businessType: newAdmin.businessType || 'retail',
          businessAddress: newAdmin.businessAddress || '',
          businessPhone: newAdmin.businessPhone || newAdmin.phone || '',
          businessEmail: newAdmin.businessEmail || newAdmin.email
        });

        console.log('✅ Admin with business added successfully:', result);
        toast.success('Admin with business added successfully! They can now manage their own business independently.');
      } else if (currentUser?.role === 'admin') {
        // Admin is adding a sub-user to their business
        console.log('🔄 Admin adding new sub-user to business:', newAdmin);

        result = await addSubUserToBusiness(currentUser.businessId, {
          firstName: newAdmin.firstName,
          lastName: newAdmin.lastName,
          email: newAdmin.email,
          phone: newAdmin.phone,
          role: 'user' // Sub-users are regular users
        });

        console.log('✅ Sub-user added successfully:', result);
        toast.success('User added successfully to your business!');
      }
      
      // Show generated credentials
      setShowGeneratedCredentials({
        ...showGeneratedCredentials,
        [result.user.username]: true
      });
      
      // Reset form
      setNewAdmin({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        businessName: '',
        businessType: 'retail',
        businessAddress: '',
        businessPhone: '',
        businessEmail: '',
        role: 'admin'
      });
      setShowAddModal(false);
      
      // Reload admins to get the updated list
      loadAdmins();
      
    } catch (error) {
      console.error('❌ Error adding user:', error);
      toast.error(`Failed to add user: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleAccessControl = async (adminId) => {
    try {
      const admin = admins.find(a => a.id === adminId);
      if (!admin) return;

      const newStatus = admin.accessControl === 'enabled' ? 'blocked' : 'active';
      const reason = newStatus === 'blocked' ? 'Access disabled by administrator' : 'Access enabled by administrator';
      
      // Use AuthContext's updateUserStatus function
      await updateUserStatus(admin.username, newStatus, reason, 'Owner');
      
      // Reload admins to get updated data
      loadAdmins();
      
      toast.success(`Access control ${newStatus === 'blocked' ? 'disabled' : 'enabled'} for ${admin.firstName} ${admin.lastName}`);
    } catch (error) {
      console.error('❌ Error updating access control:', error);
      toast.error('Failed to update access control');
    }
  };

  const deleteAdmin = async (adminId) => {
    try {
      const admin = admins.find(a => a.id === adminId);
      if (!admin) return;

      // Use AuthContext's updateUserStatus to deactivate the user
      await updateUserStatus(admin.username, 'inactive', 'Account deactivated by administrator', 'Owner');
      
      // Reload admins to get updated data
      loadAdmins();
      
      toast.success('Admin deactivated successfully');
    } catch (error) {
      console.error('❌ Error deleting admin:', error);
      toast.error('Failed to deactivate admin');
    }
  };

  // View admin details
  const viewAdminDetails = (admin) => {
    console.log('🔍 Viewing admin details:', admin);
    setSelectedAdmin(admin);
    setShowViewModal(true);
  };

  // Edit admin functions
  const handleEditAdmin = (admin) => {
    console.log('🔍 Edit admin clicked:', admin);
    setEditingAdmin(admin);
    setEditForm({
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      phone: admin.phone || '',
      businessName: admin.businessName || '',
      businessType: admin.businessType || 'retail',
      businessAddress: admin.businessAddress || '',
      businessPhone: admin.businessPhone || '',
      businessEmail: admin.businessEmail || ''
    });
    setShowEditModal(true);
  };

  const saveEditAdmin = async () => {
    try {
      console.log('🔍 Saving edit admin:', { editingAdmin, editForm });
      
      if (!editForm.firstName.trim() || !editForm.lastName.trim() || !editForm.email.trim() || !editForm.businessName.trim()) {
        toast.error('First name, last name, email, and business name are required');
        return;
      }

      // Update the admin user using AuthContext function
      console.log('🔍 Calling updateUserDetails with:', editingAdmin.username, {
        name: `${editForm.firstName} ${editForm.lastName}`,
        email: editForm.email,
        phone: editForm.phone,
        businessName: editForm.businessName,
        businessType: editForm.businessType,
        businessAddress: editForm.businessAddress,
        businessPhone: editForm.businessPhone,
        businessEmail: editForm.businessEmail
      });
      
      await updateUserDetails(editingAdmin.username, {
        name: `${editForm.firstName} ${editForm.lastName}`,
        email: editForm.email,
        phone: editForm.phone,
        businessName: editForm.businessName,
        businessType: editForm.businessType,
        businessAddress: editForm.businessAddress,
        businessPhone: editForm.businessPhone,
        businessEmail: editForm.businessEmail
      });

      // Update local state
      setAdmins(prev => 
        prev.map(admin => 
          admin.id === editingAdmin.id 
            ? { 
                ...admin, 
                firstName: editForm.firstName,
                lastName: editForm.lastName,
                email: editForm.email,
                phone: editForm.phone,
                businessName: editForm.businessName,
                businessType: editForm.businessType,
                businessAddress: editForm.businessAddress,
                businessPhone: editForm.businessPhone,
                businessEmail: editForm.businessEmail
              }
            : admin
        )
      );

      toast.success('Admin details updated successfully');
      setShowEditModal(false);
      setEditingAdmin(null);
      setEditForm({ firstName: '', lastName: '', email: '', phone: '' });
      
      // Reload admins to get updated data
      loadAdmins();
    } catch (error) {
      console.error('❌ Error updating admin:', error);
      toast.error('Failed to update admin details');
    }
  };

  // Delete admin functions
  const handleDeleteAdmin = (admin) => {
    console.log('🔍 Delete admin clicked:', admin);
    setDeletingAdmin(admin);
    setShowDeleteModal(true);
  };

  const confirmDeleteAdmin = async () => {
    try {
      console.log('🔍 Confirming delete admin:', deletingAdmin);
      
      // Delete the admin user using AuthContext function
      console.log('🔍 Calling deleteUser with:', deletingAdmin.username);
      await deleteUser(deletingAdmin.username);

      // Update local state
      setAdmins(prev => prev.filter(admin => admin.id !== deletingAdmin.id));

      toast.success(`Admin ${deletingAdmin.firstName} ${deletingAdmin.lastName} deleted successfully`);
      setShowDeleteModal(false);
      setDeletingAdmin(null);
    } catch (error) {
      console.error('❌ Error deleting admin:', error);
      toast.error(error.message || 'Failed to delete admin');
    }
  };

  // Print admin details
  const printAdminDetails = (admin) => {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <html>
        <head>
          <title>Admin Details - ${admin.firstName} ${admin.lastName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .section h3 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 5px; }
            .info-row { margin: 10px 0; }
            .label { font-weight: bold; color: #555; }
            .value { margin-left: 10px; }
            .status { padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; }
            .status.active { background-color: #d4edda; color: #155724; }
            .status.inactive { background-color: #f8d7da; color: #721c24; }
            .status.blocked { background-color: #fff3cd; color: #856404; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Admin Details Report</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="section">
            <h3>Admin Information</h3>
            <div class="info-row">
              <span class="label">Full Name:</span>
              <span class="value">${admin.firstName} ${admin.lastName}</span>
            </div>
            <div class="info-row">
              <span class="label">Email:</span>
              <span class="value">${admin.email}</span>
            </div>
            <div class="info-row">
              <span class="label">Phone:</span>
              <span class="value">${admin.phone || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="label">Username:</span>
              <span class="value">${admin.username}</span>
            </div>
            <div class="info-row">
              <span class="label">Status:</span>
              <span class="value">
                <span class="status ${admin.status}">${admin.status}</span>
              </span>
            </div>
            <div class="info-row">
              <span class="label">Business ID:</span>
              <span class="value">${admin.businessId}</span>
            </div>
          </div>
          
          <div class="section">
            <h3>Business Information</h3>
            <div class="info-row">
              <span class="label">Business Name:</span>
              <span class="value">${admin.businessName}</span>
            </div>
            <div class="info-row">
              <span class="label">Business Type:</span>
              <span class="value">${admin.businessType}</span>
            </div>
            <div class="info-row">
              <span class="label">Business Address:</span>
              <span class="value">${admin.businessAddress || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="label">Business Phone:</span>
              <span class="value">${admin.businessPhone || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="label">Business Email:</span>
              <span class="value">${admin.businessEmail || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="label">Sub-Users:</span>
              <span class="value">${admin.subUsers.length} users</span>
            </div>
          </div>
          
          <div class="section">
            <h3>Subscription Information</h3>
            <div class="info-row">
              <span class="label">Plan:</span>
              <span class="value">${admin.subscription.plan}</span>
            </div>
            <div class="info-row">
              <span class="label">Status:</span>
              <span class="value">
                <span class="status ${admin.subscription.status}">${admin.subscription.status}</span>
              </span>
            </div>
            <div class="info-row">
              <span class="label">Amount:</span>
              <span class="value">$${admin.subscription.amount}</span>
            </div>
            <div class="info-row">
              <span class="label">Expires:</span>
              <span class="value">${new Date(admin.subscription.expiresAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div class="section">
            <h3>Performance Metrics</h3>
            <div class="info-row">
              <span class="label">Sales Count:</span>
              <span class="value">${admin.performance.salesCount}</span>
            </div>
            <div class="info-row">
              <span class="label">Revenue:</span>
              <span class="value">$${admin.performance.revenue.toLocaleString()}</span>
            </div>
            <div class="info-row">
              <span class="label">Customers:</span>
              <span class="value">${admin.performance.customers}</span>
            </div>
          </div>
          
          ${admin.generatedCredentials ? `
          <div class="section">
            <h3>Generated Credentials</h3>
            <div class="info-row">
              <span class="label">Username:</span>
              <span class="value">${admin.generatedCredentials.username}</span>
            </div>
            <div class="info-row">
              <span class="label">Generated By:</span>
              <span class="value">${admin.generatedCredentials.generatedBy}</span>
            </div>
            <div class="info-row">
              <span class="label">Generated At:</span>
              <span class="value">${new Date(admin.generatedCredentials.generatedAt).toLocaleString()}</span>
            </div>
          </div>
          ` : ''}
          
          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()">Print Report</button>
            <button onclick="window.close()">Close</button>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
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

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
                                    {/* Header */}
                            <div className="mb-8">
                              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {currentUser?.role === 'owner' ? 'Admin Management' : 'User Management'}
                              </h1>
                              <p className="text-gray-600">
                                {currentUser?.role === 'owner' 
                                  ? 'Manage admin users, subscriptions, and access controls' 
                                  : 'Manage your business users and team members'
                                }
                              </p>
                            </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => setActiveFilter('all')}
            className={`bg-white rounded-lg shadow p-6 transition-all duration-200 hover:shadow-md ${
              activeFilter === 'all' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${
                activeFilter === 'all' ? 'bg-blue-200' : 'bg-blue-100'
              }`}>
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Admins</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAdmins}</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveFilter('active')}
            className={`bg-white rounded-lg shadow p-6 transition-all duration-200 hover:shadow-md ${
              activeFilter === 'active' ? 'ring-2 ring-green-500 bg-green-50' : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${
                activeFilter === 'active' ? 'bg-green-200' : 'bg-green-100'
              }`}>
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Admins</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeAdmins}</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveFilter('subscribed')}
            className={`bg-white rounded-lg shadow p-6 transition-all duration-200 hover:shadow-md ${
              activeFilter === 'subscribed' ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${
                activeFilter === 'subscribed' ? 'bg-purple-200' : 'bg-purple-100'
              }`}>
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Subscribed</p>
                <p className="text-2xl font-bold text-purple-600">{stats.subscribedAdmins}</p>
              </div>
            </div>
          </button>

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

        {/* Filter Indicator */}
        {activeFilter !== 'all' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  <span>
                    {activeFilter === 'active' && 'Active Admins'}
                    {activeFilter === 'subscribed' && 'Subscribed Admins'}
                    {activeFilter === 'inactive' && 'Inactive Admins'}
                  </span>
                  <button
                    onClick={() => setActiveFilter('all')}
                    className="ml-1 hover:text-blue-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <span className="text-sm text-gray-600">
                  Showing {filteredAdmins.length} of {admins.length} admins
                </span>
              </div>
              {filteredAdmins.length === 0 && (
                <p className="text-sm text-gray-500">No admins found matching your criteria</p>
              )}
            </div>
          </div>
        )}

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
                                    {currentUser?.role === 'owner' ? 'Add Admin' : 'Add User'}
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
                     Business
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Status
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Subscription
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Sub-Users
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
                       <div>
                         <div className="text-sm font-medium text-gray-900">{admin.businessName}</div>
                         <div className="text-xs text-gray-500 capitalize">{admin.businessType}</div>
                         <div className="text-xs text-gray-400">{admin.businessAddress}</div>
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
                         <div className="font-medium">{admin.subUsers.length} Sub-Users</div>
                         <div className="text-xs text-gray-500">
                           {admin.subUsers.length > 0 ? 'Active' : 'None added'}
                         </div>
                       </div>
                     </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">Business Owner</div>
                        <div className="text-xs text-gray-500">
                          {Object.keys(admin.permissions).filter(key => admin.permissions[key]).length} permissions
                        </div>
                      </div>
                    </td>
                                         <td className="px-6 py-4 whitespace-nowrap">
                       {admin.generatedCredentials ? (
                         <div className="text-sm">
                           <div className="font-medium text-gray-900">
                             {admin.generatedCredentials.username}
                           </div>
                           <div className="text-xs text-gray-500 font-mono">
                             {admin.generatedCredentials.password}
                           </div>
                           <div className="text-xs text-gray-400">
                             Generated: {new Date(admin.generatedCredentials.generatedAt).toLocaleDateString()}
                           </div>
                           <div className="text-xs text-gray-400">
                             By: {admin.generatedCredentials.generatedBy}
                           </div>
                         </div>
                       ) : (
                         <span className="text-gray-400">-</span>
                       )}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       {admin.emailSent !== undefined ? (
                         <div className="text-sm">
                           <div className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                             admin.emailStatus === 'sent' 
                               ? 'text-green-600 bg-green-100' 
                               : 'text-red-600 bg-red-100'
                           }`}>
                             {admin.emailStatus === 'sent' ? (
                               <>
                                 <Mail className="h-3 w-3 mr-1" />
                                 Sent
                               </>
                             ) : (
                               <>
                                 <XCircle className="h-3 w-3 mr-1" />
                                 Failed
                               </>
                             )}
                           </div>
                           {admin.emailSentAt && (
                             <div className="text-xs text-gray-400 mt-1">
                               {new Date(admin.emailSentAt).toLocaleDateString()}
                             </div>
                           )}
                           {admin.emailError && (
                             <div className="text-xs text-red-500 mt-1">
                               {admin.emailError}
                             </div>
                           )}
                         </div>
                       ) : (
                         <span className="text-gray-400">-</span>
                       )}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            console.log('👁️ View button clicked for:', admin);
                            viewAdminDetails(admin);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            console.log('✏️ Edit button clicked for:', admin);
                            handleEditAdmin(admin);
                          }}
                          className="text-orange-600 hover:text-orange-900"
                          title="Edit Admin"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            console.log('🗑️ Delete button clicked for:', admin);
                            handleDeleteAdmin(admin);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Admin"
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
                         <span className="text-sm text-gray-900 font-mono">{admin.password}</span>
                         <button
                           onClick={() => copyToClipboard(admin.password)}
                           className="ml-2 text-blue-600 hover:text-blue-800"
                         >
                           <Copy className="h-3 w-3" />
                         </button>
                       </div>
                       <div className="flex items-center mt-2">
                         <span className="text-sm font-medium text-gray-600 w-20">Email Status:</span>
                         <div className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                           admin.emailStatus === 'sent' 
                             ? 'text-green-600 bg-green-100' 
                             : 'text-red-600 bg-red-100'
                         }`}>
                           {admin.emailStatus === 'sent' ? (
                             <>
                               <Mail className="h-3 w-3 mr-1" />
                               Sent to {admin.email}
                             </>
                           ) : (
                             <>
                               <XCircle className="h-3 w-3 mr-1" />
                               Failed to send
                             </>
                           )}
                         </div>
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
        size="xl"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {currentUser?.role === 'owner' ? 'Add New Admin with Business' : 'Add New User to Your Business'}
          </h2>
          <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Personal Information</h3>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
              </div>
            </div>

            {/* Business Information - Only for Owner */}
            {currentUser?.role === 'owner' && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Business Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      value={newAdmin.businessName}
                      onChange={(e) => setNewAdmin({ ...newAdmin, businessName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter business name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Type
                    </label>
                    <select
                      value={newAdmin.businessType}
                      onChange={(e) => setNewAdmin({ ...newAdmin, businessType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="retail">Retail</option>
                      <option value="wholesale">Wholesale</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="services">Services</option>
                      <option value="food">Food & Beverage</option>
                      <option value="fashion">Fashion</option>
                      <option value="electronics">Electronics</option>
                      <option value="automotive">Automotive</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Address
                    </label>
                    <input
                      type="text"
                      value={newAdmin.businessAddress}
                      onChange={(e) => setNewAdmin({ ...newAdmin, businessAddress: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter business address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Phone
                    </label>
                    <input
                      type="tel"
                      value={newAdmin.businessPhone}
                      onChange={(e) => setNewAdmin({ ...newAdmin, businessPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter business phone"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Email
                  </label>
                  <input
                    type="email"
                    value={newAdmin.businessEmail}
                    onChange={(e) => setNewAdmin({ ...newAdmin, businessEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter business email"
                  />
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <span className="text-sm font-medium text-blue-800">
                    {currentUser?.role === 'owner' ? 'Business Isolation & Sub-User Management' : 'User Management'}
                  </span>
                  {currentUser?.role === 'owner' ? (
                    <>
                      <p className="text-xs text-blue-600 mt-1">
                        This admin will have their own isolated business environment.
                      </p>
                      <p className="text-xs text-blue-600">
                        They can add sub-users to help manage their business after payment.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-blue-600 mt-1">
                        This user will be added to your business environment.
                      </p>
                      <p className="text-xs text-blue-600">
                        They will have access to your business data and operations.
                      </p>
                    </>
                  )}
                  <p className="text-xs text-blue-600">
                    System will automatically generate username and password.
                  </p>
                </div>
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
              {currentUser?.role === 'owner' ? 'Add Admin with Business' : 'Add User'}
            </button>
          </div>
        </div>
      </Modal>

      {/* View Admin Details Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        size="lg"
      >
        {selectedAdmin && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Admin Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Admin Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Admin Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Full Name:</span>
                    <span className="ml-2 text-sm text-gray-900">{selectedAdmin.firstName} {selectedAdmin.lastName}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Email:</span>
                    <span className="ml-2 text-sm text-gray-900">{selectedAdmin.email}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Phone:</span>
                    <span className="ml-2 text-sm text-gray-900">{selectedAdmin.phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Username:</span>
                    <span className="ml-2 text-sm text-gray-900">{selectedAdmin.username}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedAdmin.status)}`}>
                      {selectedAdmin.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Business ID:</span>
                    <span className="ml-2 text-sm text-gray-900 font-mono">{selectedAdmin.businessId}</span>
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Business Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Business Name:</span>
                    <span className="ml-2 text-sm text-gray-900">{selectedAdmin.businessName}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Business Type:</span>
                    <span className="ml-2 text-sm text-gray-900 capitalize">{selectedAdmin.businessType}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Business Address:</span>
                    <span className="ml-2 text-sm text-gray-900">{selectedAdmin.businessAddress || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Business Phone:</span>
                    <span className="ml-2 text-sm text-gray-900">{selectedAdmin.businessPhone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Business Email:</span>
                    <span className="ml-2 text-sm text-gray-900">{selectedAdmin.businessEmail || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Sub-Users:</span>
                    <span className="ml-2 text-sm text-gray-900">{selectedAdmin.subUsers.length} users</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Subscription Information</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Plan:</span>
                    <span className="ml-2 text-sm text-gray-900">{selectedAdmin.subscription.plan}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSubscriptionColor(selectedAdmin.subscription.status)}`}>
                      {selectedAdmin.subscription.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Amount:</span>
                    <span className="ml-2 text-sm text-gray-900">${selectedAdmin.subscription.amount}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Expires:</span>
                    <span className="ml-2 text-sm text-gray-900">{new Date(selectedAdmin.subscription.expiresAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Performance Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-600">Sales Count</div>
                  <div className="text-2xl font-bold text-gray-900">{selectedAdmin.performance.salesCount}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-600">Revenue</div>
                  <div className="text-2xl font-bold text-gray-900">${selectedAdmin.performance.revenue.toLocaleString()}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-600">Customers</div>
                  <div className="text-2xl font-bold text-gray-900">{selectedAdmin.performance.customers}</div>
                </div>
              </div>
            </div>
            
            {selectedAdmin.generatedCredentials && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Generated Credentials</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Username:</span>
                      <span className="ml-2 text-sm text-gray-900 font-mono">{selectedAdmin.generatedCredentials.username}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Generated By:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedAdmin.generatedCredentials.generatedBy}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Generated At:</span>
                      <span className="ml-2 text-sm text-gray-900">{new Date(selectedAdmin.generatedCredentials.generatedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => printAdminDetails(selectedAdmin)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Details
              </button>
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Admin Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        size="lg"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Edit Admin Details</h2>
            <button
              onClick={() => setShowEditModal(false)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
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
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
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
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={editForm.businessName}
                    onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter business name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Type
                  </label>
                  <select
                    value={editForm.businessType}
                    onChange={(e) => setEditForm({ ...editForm, businessType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="retail">Retail</option>
                    <option value="wholesale">Wholesale</option>
                    <option value="service">Service</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Address
                  </label>
                  <input
                    type="text"
                    value={editForm.businessAddress}
                    onChange={(e) => setEditForm({ ...editForm, businessAddress: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter business address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Phone
                  </label>
                  <input
                    type="tel"
                    value={editForm.businessPhone}
                    onChange={(e) => setEditForm({ ...editForm, businessPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter business phone"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Email
                </label>
                <input
                  type="email"
                  value={editForm.businessEmail}
                  onChange={(e) => setEditForm({ ...editForm, businessEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter business email"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={saveEditAdmin}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Admin Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        size="md"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-red-600">Delete Admin</h2>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold">Confirm Deletion</h3>
            </div>
            <p className="text-gray-600">
              Are you sure you want to delete <strong>{deletingAdmin?.firstName} {deletingAdmin?.lastName}</strong>? 
              This action cannot be undone and will permanently remove the admin from the system.
            </p>
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This will also delete their subscription data and performance metrics.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteAdmin}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete Admin
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminManagement;

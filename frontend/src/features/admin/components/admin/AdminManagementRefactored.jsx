import React, { useState, useEffect } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../../../app/providers/AuthContext';
import { getStatusColor, getSubscriptionColor, printAdminDetails } from './utils/adminUtils';
import AddAdminModal from './modals/AddAdminModal';
import ViewAdminModal from './modals/ViewAdminModal';
import EditAdminModal from './modals/EditAdminModal';
import DeleteAdminModal from './modals/DeleteAdminModal';
import AdminTable from './components/AdminTable';
import AdminStats from './components/AdminStats';

const AdminManagement = () => {
  const { addNewUser, getAllUsers, updateUserStatus, updateUserDetails, deleteUser, addNewAdminWithBusiness } = useAuth();
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
  
  // Modal states
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

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = () => {
    try {
      setLoading(true);
      console.log('🔄 Loading admins from AuthContext...');
      const allUsers = getAllUsers();
      console.log('📋 All users from AuthContext:', allUsers);
      
      const adminUsers = allUsers.filter(user => user.role === 'admin');
      console.log('👥 Admin users found:', adminUsers);
      
      const transformedAdmins = adminUsers.map(user => ({
        id: user.username,
        firstName: user.name.split(' ')[0] || '',
        lastName: user.name.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || '',
        username: user.username,
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
        generatedCredentials: user.generatedCredentials
      }));
      
      setAdmins(transformedAdmins);
      console.log('✅ Loaded admins from AuthContext:', transformedAdmins);
    } catch (error) {
      console.error('❌ Error loading admins:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = 
      admin.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.username.toLowerCase().includes(searchTerm.toLowerCase());
    
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
    if (!newAdmin.firstName || !newAdmin.lastName || !newAdmin.email || !newAdmin.businessName) {
      toast.error('Please fill in all required fields including business name');
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Adding new admin with business data:', newAdmin);
      
      const result = await addNewAdminWithBusiness({
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
      
      setShowGeneratedCredentials({
        ...showGeneratedCredentials,
        [result.user.username]: true
      });
      
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
      
      loadAdmins();
      
      toast.success('Admin with business added successfully! They can now manage their own business independently.');
      
    } catch (error) {
      console.error('❌ Error adding admin with business:', error);
      toast.error(`Failed to add admin: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const viewAdminDetails = (admin) => {
    console.log('🔍 Viewing admin details:', admin);
    setSelectedAdmin(admin);
    setShowViewModal(true);
  };

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
      
      loadAdmins();
    } catch (error) {
      console.error('❌ Error updating admin:', error);
      toast.error('Failed to update admin details');
    }
  };

  const handleDeleteAdmin = (admin) => {
    console.log('🔍 Delete admin clicked:', admin);
    setDeletingAdmin(admin);
    setShowDeleteModal(true);
  };

  const confirmDeleteAdmin = async () => {
    try {
      console.log('🔍 Confirming delete admin:', deletingAdmin);
      
      console.log('🔍 Calling deleteUser with:', deletingAdmin.username);
      await deleteUser(deletingAdmin.username);

      setAdmins(prev => prev.filter(admin => admin.id !== deletingAdmin.id));

      toast.success(`Admin ${deletingAdmin.firstName} ${deletingAdmin.lastName} deleted successfully`);
      setShowDeleteModal(false);
      setDeletingAdmin(null);
    } catch (error) {
      console.error('❌ Error deleting admin:', error);
      toast.error(error.message || 'Failed to delete admin');
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Management</h1>
          <p className="text-gray-600">Manage your admin users, subscriptions, and access controls</p>
        </div>

        {/* Stats Cards */}
        <AdminStats 
          stats={stats} 
          activeFilter={activeFilter} 
          onFilterChange={setActiveFilter} 
        />

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
                Add Admin
              </button>
            </div>
          </div>

          {/* Admins Table */}
          <AdminTable 
            filteredAdmins={filteredAdmins}
            onViewAdmin={viewAdminDetails}
            onEditAdmin={handleEditAdmin}
            onDeleteAdmin={handleDeleteAdmin}
            getStatusColor={getStatusColor}
            getSubscriptionColor={getSubscriptionColor}
          />
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
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-600 w-20">Password:</span>
                        <span className="text-sm text-gray-900 font-mono">{admin.password}</span>
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

      {/* Modals */}
      <AddAdminModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        newAdmin={newAdmin}
        setNewAdmin={setNewAdmin}
        onAddAdmin={handleAddAdmin}
        loading={loading}
      />

      <ViewAdminModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        selectedAdmin={selectedAdmin}
        onPrintDetails={printAdminDetails}
        getStatusColor={getStatusColor}
        getSubscriptionColor={getSubscriptionColor}
      />

      <EditAdminModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        editForm={editForm}
        setEditForm={setEditForm}
        onSaveChanges={saveEditAdmin}
        loading={loading}
      />

      <DeleteAdminModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        deletingAdmin={deletingAdmin}
        onConfirmDelete={confirmDeleteAdmin}
        loading={loading}
      />
    </div>
  );
};

export default AdminManagement;

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Download,
  Eye,
  Plus,
  Mail,
  Calendar,
  Clock,
  Users,
  TrendingUp,
  RefreshCw,
  X,
  Settings,
  Building2,
  Smartphone,
  Globe,
  Star,
  Edit,
  Trash2,
  Printer
} from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../../../../components/ui/modals/Modal';
import { useAuth } from '../../../../app/providers/AuthContext';

const SubscriptionManager = () => {
  const { getAllUsers, updateUserSubscription, updateUserDetails, deleteUser } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPaymentConfigModal, setShowPaymentConfigModal] = useState(false);
  const [showPricingConfigModal, setShowPricingConfigModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [deletingAdmin, setDeletingAdmin] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [paymentConfig, setPaymentConfig] = useState({
    bankAccount: {
      accountNumber: '',
      bankName: '',
      routingNumber: '',
      accountHolderName: ''
    },
    paypal: {
      email: ''
    },
    mobileMoney: {
      phoneNumber: '',
      provider: ''
    },
    crypto: {
      walletAddress: '',
      network: ''
    }
  });
  
  // Pricing configuration for subscription plans
  const [pricingConfig, setPricingConfig] = useState({
    premium: {
      weekly: 19.99,
      monthly: 59.99,
      annually: 599.99
    }
  });

  // Payment configuration methods
  const paymentMethods = {
    bankAccount: {
      name: 'Bank Account',
      icon: Building2,
      color: 'blue',
      fields: [
        { name: 'accountNumber', label: 'Account Number', type: 'text', placeholder: '1234567890' },
        { name: 'bankName', label: 'Bank Name', type: 'text', placeholder: 'Bank of America' },
        { name: 'routingNumber', label: 'Routing Number', type: 'text', placeholder: '021000021' },
        { name: 'accountHolderName', label: 'Account Holder Name', type: 'text', placeholder: 'John Doe' }
      ]
    },
    paypal: {
      name: 'PayPal',
      icon: Mail,
      color: 'purple',
      fields: [
        { name: 'email', label: 'PayPal Email', type: 'email', placeholder: 'owner@paypal.com' }
      ]
    },
    mobileMoney: {
      name: 'Mobile Money',
      icon: Smartphone,
      color: 'green',
      fields: [
        { name: 'phoneNumber', label: 'Phone Number', type: 'tel', placeholder: '+1234567890' },
        { name: 'provider', label: 'Provider', type: 'select', options: ['M-Pesa', 'Airtel Money', 'MTN Mobile Money'] }
      ]
    },
    crypto: {
      name: 'Cryptocurrency',
      icon: Globe,
      color: 'orange',
      fields: [
        { name: 'walletAddress', label: 'Wallet Address', type: 'text', placeholder: '0x1234...' },
        { name: 'network', label: 'Network', type: 'select', options: ['Bitcoin', 'Ethereum', 'USDT', 'USDC'] }
      ]
    }
  };

  useEffect(() => {
    loadSubscriptions();
    loadPaymentConfig();
    loadPricingConfig();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const users = getAllUsers();
      console.log('🔍 All users:', users);
      
      const adminUsers = users.filter(user => user.role === 'admin');
      console.log('🔍 Admin users found:', adminUsers.length, adminUsers);
      
      const adminSubscriptions = adminUsers.map(user => {
        console.log('🔍 Processing admin user:', user);
        const subscription = {
          id: user.username,
          adminName: user.name || 'Unknown',
          adminEmail: user.email || 'No email',
          adminPhone: user.phone || '',
          plan: user.subscription?.plan || 'premium',
          status: user.subscription?.status || 'trial',
          amount: user.subscription?.amount || 0,
          billingCycle: user.subscription?.billingCycle || 'monthly',
          nextPayment: user.subscription?.nextPayment || new Date().toISOString(),
          paymentHistory: user.subscription?.paymentHistory || [],
          ...user.subscription
        };
        console.log('🔍 Created subscription object:', subscription);
        return subscription;
      });
      
      setSubscriptions(adminSubscriptions);
      console.log('✅ Loaded admin subscriptions:', adminSubscriptions);
    } catch (error) {
      console.error('❌ Error loading subscriptions:', error);
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentConfig = () => {
    try {
      const savedConfig = localStorage.getItem('tracknest_payment_config');
      if (savedConfig) {
        setPaymentConfig(JSON.parse(savedConfig));
      }
    } catch (error) {
      console.error('❌ Error loading payment config:', error);
    }
  };

  const savePaymentConfig = async () => {
    try {
      localStorage.setItem('tracknest_payment_config', JSON.stringify(paymentConfig));
      toast.success('Payment configuration saved successfully');
      setShowPaymentConfigModal(false);
    } catch (error) {
      console.error('❌ Error saving payment config:', error);
      toast.error('Failed to save payment configuration');
    }
  };

  const loadPricingConfig = () => {
    try {
      const savedPricing = localStorage.getItem('tracknest_pricing_config');
      if (savedPricing) {
        setPricingConfig(JSON.parse(savedPricing));
      }
    } catch (error) {
      console.error('❌ Error loading pricing config:', error);
    }
  };

  const savePricingConfig = async () => {
    try {
      localStorage.setItem('tracknest_pricing_config', JSON.stringify(pricingConfig));
      toast.success('Pricing configuration saved successfully');
      setShowPricingConfigModal(false);
    } catch (error) {
      console.error('❌ Error saving pricing config:', error);
      toast.error('Failed to save pricing configuration');
    }
  };

  const viewSubscriptionDetails = (subscription) => {
    console.log('🔍 Viewing subscription details:', subscription);
    setSelectedSubscription(subscription);
    setShowDetailsModal(true);
  };

  const activateAdminSubscription = async (subscription) => {
    try {
      const updatedSubscription = {
        ...subscription,
        status: 'active',
        activatedAt: new Date().toISOString(),
        activatedBy: 'owner'
      };

      await updateUserSubscription(subscription.id, updatedSubscription);
      
      // Update local state
      setSubscriptions(prev => 
        prev.map(sub => 
          sub.id === subscription.id 
            ? { ...sub, ...updatedSubscription }
            : sub
        )
      );

      toast.success(`Admin ${subscription.adminName} subscription activated successfully`);
    } catch (error) {
      console.error('❌ Error activating subscription:', error);
      toast.error('Failed to activate subscription');
    }
  };

  const deactivateAdminSubscription = async (subscription) => {
    try {
      const updatedSubscription = {
        ...subscription,
        status: 'suspended',
        deactivatedAt: new Date().toISOString(),
        deactivatedBy: 'owner'
      };

      await updateUserSubscription(subscription.id, updatedSubscription);
      
      // Update local state
      setSubscriptions(prev => 
        prev.map(sub => 
          sub.id === subscription.id 
            ? { ...sub, ...updatedSubscription }
            : sub
        )
      );

      toast.success(`Admin ${subscription.adminName} subscription deactivated`);
    } catch (error) {
      console.error('❌ Error deactivating subscription:', error);
      toast.error('Failed to deactivate subscription');
    }
  };

  // Edit admin functions
  const handleEditAdmin = (subscription) => {
    console.log('🔍 Edit admin clicked:', subscription);
    setEditingAdmin(subscription);
    setEditForm({
      name: subscription.adminName,
      email: subscription.adminEmail,
      phone: subscription.adminPhone || ''
    });
    setShowEditModal(true);
  };

  const saveEditAdmin = async () => {
    try {
      console.log('🔍 Saving edit admin:', { editingAdmin, editForm });
      
      if (!editForm.name.trim() || !editForm.email.trim()) {
        toast.error('Name and email are required');
        return;
      }

      // Update the admin user using AuthContext function
      console.log('🔍 Calling updateUserDetails with:', editingAdmin.id, {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone
      });
      
      await updateUserDetails(editingAdmin.id, {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone
      });

      // Update local state
      setSubscriptions(prev => 
        prev.map(sub => 
          sub.id === editingAdmin.id 
            ? { 
                ...sub, 
                adminName: editForm.name,
                adminEmail: editForm.email,
                adminPhone: editForm.phone
              }
            : sub
        )
      );

      toast.success('Admin details updated successfully');
      setShowEditModal(false);
      setEditingAdmin(null);
      setEditForm({ name: '', email: '', phone: '' });
      
      // Reload subscriptions to get updated data
      loadSubscriptions();
    } catch (error) {
      console.error('❌ Error updating admin:', error);
      toast.error('Failed to update admin details');
    }
  };

  // Delete admin functions
  const handleDeleteAdmin = (subscription) => {
    console.log('🔍 Delete admin clicked:', subscription);
    setDeletingAdmin(subscription);
    setShowDeleteModal(true);
  };

  const confirmDeleteAdmin = async () => {
    try {
      console.log('🔍 Confirming delete admin:', deletingAdmin);
      
      // Delete the admin user using AuthContext function
      console.log('🔍 Calling deleteUser with:', deletingAdmin.id);
      await deleteUser(deletingAdmin.id);

      // Update local state
      setSubscriptions(prev => prev.filter(sub => sub.id !== deletingAdmin.id));

      toast.success(`Admin ${deletingAdmin.adminName} deleted successfully`);
      setShowDeleteModal(false);
      setDeletingAdmin(null);
    } catch (error) {
      console.error('❌ Error deleting admin:', error);
      toast.error(error.message || 'Failed to delete admin');
    }
  };

  // Print admin details
  const printAdminDetails = (subscription) => {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <html>
        <head>
          <title>Admin Details - ${subscription.adminName}</title>
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
            .status.suspended { background-color: #fff3cd; color: #856404; }
            .status.trial { background-color: #d1ecf1; color: #0c5460; }
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
              <span class="label">Name:</span>
              <span class="value">${subscription.adminName}</span>
            </div>
            <div class="info-row">
              <span class="label">Email:</span>
              <span class="value">${subscription.adminEmail}</span>
            </div>
            <div class="info-row">
              <span class="label">Phone:</span>
              <span class="value">${subscription.adminPhone || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="label">Username:</span>
              <span class="value">${subscription.id}</span>
            </div>
          </div>
          
          <div class="section">
            <h3>Subscription Information</h3>
            <div class="info-row">
              <span class="label">Plan:</span>
              <span class="value">${subscription.plan}</span>
            </div>
            <div class="info-row">
              <span class="label">Status:</span>
              <span class="value">
                <span class="status ${subscription.status}">${subscription.status}</span>
              </span>
            </div>
            <div class="info-row">
              <span class="label">Amount:</span>
              <span class="value">${formatCurrency(subscription.amount)}</span>
            </div>
            <div class="info-row">
              <span class="label">Billing Cycle:</span>
              <span class="value">${subscription.billingCycle}</span>
            </div>
            <div class="info-row">
              <span class="label">Next Payment:</span>
              <span class="value">${formatDate(subscription.nextPayment)}</span>
            </div>
          </div>
          
          ${subscription.paymentHistory && subscription.paymentHistory.length > 0 ? `
          <div class="section">
            <h3>Payment History</h3>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${subscription.paymentHistory.map(payment => `
                  <tr>
                    <td>${formatDate(payment.date)}</td>
                    <td>${payment.method}</td>
                    <td>${formatCurrency(payment.amount)}</td>
                    <td>
                      <span class="status ${payment.status === 'completed' ? 'active' : 'suspended'}">
                        ${payment.status}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
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

  const filteredSubscriptions = subscriptions.filter(subscription =>
    subscription.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subscription.adminEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subscription.plan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'trial': return 'text-blue-600 bg-blue-100';
      case 'expired': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      case 'suspended': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Subscriptions</h1>
              <p className="text-gray-600">Monitor and manage admin subscription payments</p>
            </div>
                         <div className="flex space-x-3">
               <button
                 onClick={loadSubscriptions}
                 className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
               >
                 <RefreshCw className="h-4 w-4 mr-2" />
                 Refresh
               </button>
               <button
                 onClick={() => setShowPaymentConfigModal(true)}
                 className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
               >
                 <Settings className="h-4 w-4 mr-2" />
                 Payment Settings
               </button>
               <button
                 onClick={() => setShowPricingConfigModal(true)}
                 className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
               >
                 <DollarSign className="h-4 w-4 mr-2" />
                 Pricing Settings
               </button>
             </div>
          </div>
        </div>

        {/* Payment Configuration Summary */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(paymentMethods).map(([key, method]) => {
                const Icon = method.icon;
                const config = paymentConfig[key];
                const isConfigured = config && Object.values(config).some(value => value);
                
                return (
                  <div key={key} className={`p-4 rounded-lg border-2 ${
                    isConfigured ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-center mb-2">
                      <Icon className={`h-5 w-5 text-${method.color}-600 mr-2`} />
                      <span className="font-medium text-gray-900">{method.name}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {isConfigured ? (
                        <span className="text-green-600 font-medium">✓ Configured</span>
                      ) : (
                        <span className="text-gray-500">Not configured</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pricing Configuration Summary */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(pricingConfig).map(([planKey, plan]) => (
                <div key={planKey} className="p-4 rounded-lg border-2 border-blue-500 bg-blue-50">
                  <div className="flex items-center mb-2">
                    <Star className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium text-gray-900 capitalize">{planKey} Plan</span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Weekly: ${plan.weekly}</div>
                    <div>Monthly: ${plan.monthly}</div>
                    <div>Annually: ${plan.annually}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

                 {/* Debug Information */}
         <div className="bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
           <div className="p-4">
             <h3 className="text-lg font-semibold text-yellow-800 mb-2">Debug Information</h3>
             <div className="text-sm text-yellow-700">
               <p>Total subscriptions loaded: {subscriptions.length}</p>
               <p>Filtered subscriptions: {filteredSubscriptions.length}</p>
               <p>Loading state: {loading ? 'Loading...' : 'Loaded'}</p>
               <p>Show Details Modal: {showDetailsModal ? 'Open' : 'Closed'}</p>
               <p>Show Edit Modal: {showEditModal ? 'Open' : 'Closed'}</p>
               <p>Show Delete Modal: {showDeleteModal ? 'Open' : 'Closed'}</p>
               <details className="mt-2">
                 <summary className="cursor-pointer font-medium">Subscription Data</summary>
                 <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                   {JSON.stringify(subscriptions, null, 2)}
                 </pre>
               </details>
             </div>
           </div>
         </div>

         {/* Search and Filters */}
         <div className="bg-white rounded-lg shadow mb-6">
           <div className="p-6">
             <div className="flex items-center justify-between mb-4">
               <div className="flex items-center space-x-4">
                 <div className="relative">
                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                   <input
                     type="text"
                     placeholder="Search admins..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   />
                 </div>
               </div>
               <div className="flex items-center space-x-2">
                 <span className="text-sm text-gray-600">
                   {filteredSubscriptions.length} of {subscriptions.length} subscriptions
                 </span>
               </div>
             </div>
           </div>
         </div>

        {/* Subscriptions Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{subscription.adminName}</div>
                        <div className="text-sm text-gray-500">{subscription.adminEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 capitalize">{subscription.plan}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(subscription.status)}`}>
                        {subscription.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(subscription.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(subscription.nextPayment)}
                    </td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                       <div className="flex items-center space-x-2">
                         <button
                           onClick={() => {
                             console.log('👁️ View button clicked for:', subscription);
                             viewSubscriptionDetails(subscription);
                           }}
                           className="text-blue-600 hover:text-blue-900"
                           title="View Details"
                         >
                           <Eye className="h-4 w-4" />
                         </button>
                         <button
                           onClick={() => {
                             console.log('✏️ Edit button clicked for:', subscription);
                             handleEditAdmin(subscription);
                           }}
                           className="text-orange-600 hover:text-orange-900"
                           title="Edit Admin"
                         >
                           <Edit className="h-4 w-4" />
                         </button>
                         <button
                           onClick={() => {
                             console.log('🗑️ Delete button clicked for:', subscription);
                             handleDeleteAdmin(subscription);
                           }}
                           className="text-red-600 hover:text-red-900"
                           title="Delete Admin"
                         >
                           <Trash2 className="h-4 w-4" />
                         </button>
                         {subscription.status === 'trial' && (
                           <button
                             onClick={() => activateAdminSubscription(subscription)}
                             className="text-green-600 hover:text-green-900"
                             title="Activate Subscription"
                           >
                             <CheckCircle className="h-4 w-4" />
                           </button>
                         )}
                         {subscription.status === 'active' && (
                           <button
                             onClick={() => deactivateAdminSubscription(subscription)}
                             className="text-yellow-600 hover:text-yellow-900"
                             title="Deactivate Subscription"
                           >
                             <XCircle className="h-4 w-4" />
                           </button>
                         )}
                       </div>
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Subscription Details Modal */}
        {console.log('Modal state:', { showDetailsModal, selectedSubscription })}
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          size="lg"
        >
          {selectedSubscription && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Subscription Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Admin Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Name:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedSubscription.adminName}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Email:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedSubscription.adminEmail}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Phone:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedSubscription.adminPhone || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Subscription Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Plan:</span>
                      <span className="ml-2 text-sm text-gray-900 capitalize">{selectedSubscription.plan}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Status:</span>
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedSubscription.status)}`}>
                        {selectedSubscription.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Amount:</span>
                      <span className="ml-2 text-sm text-gray-900">{formatCurrency(selectedSubscription.amount)}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Billing Cycle:</span>
                      <span className="ml-2 text-sm text-gray-900 capitalize">{selectedSubscription.billingCycle}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Payment History</h3>
                {selectedSubscription.paymentHistory && selectedSubscription.paymentHistory.length > 0 ? (
                  <div className="space-y-2">
                    {selectedSubscription.paymentHistory.map((payment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{formatDate(payment.date)}</div>
                          <div className="text-xs text-gray-500">{payment.method}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{formatCurrency(payment.amount)}</div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            payment.status === 'completed' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                          }`}>
                            {payment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No payment history available</p>
                )}
              </div>
              
                             <div className="mt-6 flex justify-end space-x-3">
                 <button
                   onClick={() => printAdminDetails(selectedSubscription)}
                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                 >
                   <Printer className="h-4 w-4 mr-2" />
                   Print Details
                 </button>
                 <button
                   onClick={() => setShowDetailsModal(false)}
                   className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                 >
                   Close
                 </button>
               </div>
            </div>
          )}
        </Modal>

        {/* Payment Configuration Modal */}
        <Modal
          isOpen={showPaymentConfigModal}
          onClose={() => setShowPaymentConfigModal(false)}
          size="xl"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Payment Configuration</h2>
              <button
                onClick={() => setShowPaymentConfigModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {Object.entries(paymentMethods).map(([key, method]) => {
                const Icon = method.icon;
                return (
                  <div key={key} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-4">
                      <Icon className={`h-6 w-6 text-${method.color}-600 mr-3`} />
                      <h3 className="text-lg font-semibold">{method.name}</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {method.fields.map((field) => (
                        <div key={field.name}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {field.label}
                          </label>
                          {field.type === 'select' ? (
                            <select
                              value={paymentConfig[key]?.[field.name] || ''}
                              onChange={(e) => setPaymentConfig({
                                ...paymentConfig,
                                [key]: {
                                  ...paymentConfig[key],
                                  [field.name]: e.target.value
                                }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Select {field.label}</option>
                              {field.options.map((option) => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={field.type}
                              placeholder={field.placeholder}
                              value={paymentConfig[key]?.[field.name] || ''}
                              onChange={(e) => setPaymentConfig({
                                ...paymentConfig,
                                [key]: {
                                  ...paymentConfig[key],
                                  [field.name]: e.target.value
                                }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowPaymentConfigModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={savePaymentConfig}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </Modal>

        {/* Pricing Configuration Modal */}
        <Modal
          isOpen={showPricingConfigModal}
          onClose={() => setShowPricingConfigModal(false)}
          size="lg"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Pricing Configuration</h2>
              <button
                onClick={() => setShowPricingConfigModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {Object.entries(pricingConfig).map(([planKey, plan]) => (
                <div key={planKey} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <Star className="h-6 w-6 text-purple-600 mr-3" />
                    <h3 className="text-lg font-semibold capitalize">{planKey} Plan Pricing</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Weekly Price ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={plan.weekly}
                        onChange={(e) => setPricingConfig({
                          ...pricingConfig,
                          [planKey]: {
                            ...plan,
                            weekly: parseFloat(e.target.value) || 0
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Monthly Price ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={plan.monthly}
                        onChange={(e) => setPricingConfig({
                          ...pricingConfig,
                          [planKey]: {
                            ...plan,
                            monthly: parseFloat(e.target.value) || 0
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Annual Price ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={plan.annually}
                        onChange={(e) => setPricingConfig({
                          ...pricingConfig,
                          [planKey]: {
                            ...plan,
                            annually: parseFloat(e.target.value) || 0
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> These prices will be displayed to admins when they choose subscription plans. 
                      Make sure to set competitive and fair pricing for your services.
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowPricingConfigModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={savePricingConfig}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Save Pricing
              </button>
            </div>
          </div>
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
             
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Full Name *
                 </label>
                 <input
                   type="text"
                   value={editForm.name}
                   onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   placeholder="Enter full name"
                 />
               </div>
               
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
                 Are you sure you want to delete <strong>{deletingAdmin?.adminName}</strong>? 
                 This action cannot be undone and will permanently remove the admin from the system.
               </p>
               <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                 <p className="text-sm text-red-800">
                   <strong>Warning:</strong> This will also delete their subscription data and payment history.
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
     </div>
   );
 };

export default SubscriptionManager;

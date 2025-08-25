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
  Mail
} from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../../../../components/ui/modals/Modal';

const SubscriptionManager = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  // Mock subscription data
  useEffect(() => {
    const mockSubscriptions = [
      {
        id: 1,
        adminName: 'John Doe',
        adminEmail: 'john.doe@company.com',
        plan: 'Premium',
        amount: 99.99,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'active',
        paymentMethod: 'Credit Card',
        lastPayment: '2024-01-15',
        nextPayment: '2024-02-15',
        autoRenew: true,
        usage: { salesCount: 150, revenue: 45000, customers: 45 }
      },
      {
        id: 2,
        adminName: 'Jane Smith',
        adminEmail: 'jane.smith@company.com',
        plan: 'Basic',
        amount: 49.99,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        status: 'expired',
        paymentMethod: 'PayPal',
        lastPayment: '2024-01-01',
        nextPayment: '2024-02-01',
        autoRenew: false,
        usage: { salesCount: 89, revenue: 26700, customers: 23 }
      },
      {
        id: 3,
        adminName: 'Mike Johnson',
        adminEmail: 'mike.johnson@company.com',
        plan: 'Premium',
        amount: 99.99,
        startDate: '2024-01-01',
        endDate: '2024-02-01',
        status: 'cancelled',
        paymentMethod: 'Credit Card',
        lastPayment: '2024-01-01',
        nextPayment: '2024-02-01',
        autoRenew: false,
        usage: { salesCount: 67, revenue: 20100, customers: 18 }
      }
    ];
    setSubscriptions(mockSubscriptions);
    setLoading(false);
  }, []);

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = 
      subscription.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.adminEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || subscription.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalSubscriptions: subscriptions.length,
    activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
    totalRevenue: subscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + s.amount, 0)
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'expired': return 'text-orange-600 bg-orange-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPlanColor = (plan) => {
    switch (plan) {
      case 'Premium': return 'text-purple-600 bg-purple-100';
      case 'Basic': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const updateSubscriptionStatus = (subscriptionId, newStatus) => {
    setSubscriptions(subscriptions.map(sub =>
      sub.id === subscriptionId ? { ...sub, status: newStatus } : sub
    ));
    toast.success('Subscription status updated');
  };

  const viewSubscriptionDetails = (subscription) => {
    setSelectedSubscription(subscription);
    setShowDetailsModal(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading subscription data...</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Management</h1>
              <p className="text-gray-600">Manage admin subscriptions and billing</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => toast.success('Subscriptions exported!')}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              <button
                onClick={() => toast.info('Add subscription functionality coming soon')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Subscription
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Subscriptions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSubscriptions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search subscriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Subscriptions Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
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
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanColor(subscription.plan)}`}>
                        {subscription.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(subscription.status)}`}>
                        {subscription.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(subscription.amount)}</div>
                      <div className="text-xs text-gray-500">{subscription.paymentMethod}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(subscription.endDate)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => viewSubscriptionDetails(subscription)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => updateSubscriptionStatus(subscription.id, subscription.status === 'active' ? 'cancelled' : 'active')}
                          className={`${subscription.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                          title={subscription.status === 'active' ? 'Cancel' : 'Activate'}
                        >
                          {subscription.status === 'active' ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Subscription Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        size="lg"
      >
        {selectedSubscription && (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Subscription Details</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Admin Information</h3>
                <p><span className="font-medium">Name:</span> {selectedSubscription.adminName}</p>
                <p><span className="font-medium">Email:</span> {selectedSubscription.adminEmail}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Subscription Details</h3>
                <p><span className="font-medium">Plan:</span> {selectedSubscription.plan}</p>
                <p><span className="font-medium">Amount:</span> {formatCurrency(selectedSubscription.amount)}</p>
                <p><span className="font-medium">Status:</span> {selectedSubscription.status}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Usage Statistics</h3>
                <p><span className="font-medium">Sales Count:</span> {selectedSubscription.usage.salesCount}</p>
                <p><span className="font-medium">Revenue:</span> {formatCurrency(selectedSubscription.usage.revenue)}</p>
                <p><span className="font-medium">Customers:</span> {selectedSubscription.usage.customers}</p>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SubscriptionManager;

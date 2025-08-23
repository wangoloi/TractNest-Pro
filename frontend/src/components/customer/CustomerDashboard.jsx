import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Package, 
  FileText, 
  Bell, 
  User, 
  Calendar,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

const CustomerDashboard = () => {
  const [customerData, setCustomerData] = useState({
    orders: [],
    invoices: [],
    notifications: [],
    profile: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      // In a real app, you'd fetch customer-specific data
      // For now, we'll simulate customer data
      const mockData = {
        orders: [
          { id: 1, status: 'completed', total: 1250.00, date: '2024-01-15', items: 3 },
          { id: 2, status: 'pending', total: 890.00, date: '2024-01-20', items: 2 },
          { id: 3, status: 'processing', total: 2100.00, date: '2024-01-25', items: 5 }
        ],
        invoices: [
          { id: 1, amount: 1250.00, status: 'paid', dueDate: '2024-01-30' },
          { id: 2, amount: 890.00, status: 'pending', dueDate: '2024-02-05' },
          { id: 3, amount: 2100.00, status: 'pending', dueDate: '2024-02-10' }
        ],
        notifications: [
          { id: 1, type: 'order', message: 'Your order #1234 has been shipped', date: '2024-01-26' },
          { id: 2, type: 'invoice', message: 'Invoice #5678 is due in 5 days', date: '2024-01-25' },
          { id: 3, type: 'promotion', message: 'Special discount on electronics this week', date: '2024-01-24' }
        ],
        profile: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          memberSince: '2023-06-15'
        }
      };
      
      setCustomerData(mockData);
    } catch (error) {
      console.error('Error fetching customer data:', error);
      toast.error('Failed to load customer data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'paid': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return <CheckCircle size={16} />;
      case 'pending':
        return <Clock size={16} />;
      case 'processing':
        return <AlertCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {customerData.profile?.name}!</h1>
            <p className="text-green-100">Customer Dashboard - Track your orders and invoices</p>
          </div>
          <div className="bg-white/20 rounded-full p-4">
            <User size={32} />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{customerData.orders.length}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <ShoppingCart className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Invoices</p>
              <p className="text-2xl font-bold text-gray-900">
                {customerData.invoices.filter(inv => inv.status === 'pending').length}
              </p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <FileText className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">
                ${customerData.orders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Notifications</p>
              <p className="text-2xl font-bold text-gray-900">{customerData.notifications.length}</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <Bell className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingBag size={24} />
            Recent Orders
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {customerData.orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="bg-white rounded-full p-2">
                    <Package size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Order #{order.id}</p>
                    <p className="text-sm text-gray-600">{order.items} items • ${order.total.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{order.date}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {order.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <FileText size={24} />
            Recent Invoices
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {customerData.invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="bg-white rounded-full p-2">
                    <FileText size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Invoice #{invoice.id}</p>
                    <p className="text-sm text-gray-600">${invoice.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Due: {invoice.dueDate}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                  {getStatusIcon(invoice.status)}
                  {invoice.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Bell size={24} />
            Recent Notifications
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {customerData.notifications.map((notification) => (
              <div key={notification.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="bg-white rounded-full p-2 mt-1">
                  <Bell size={16} className="text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{notification.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Profile Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <User size={24} />
            Profile Information
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Name</p>
              <p className="text-lg text-gray-900">{customerData.profile?.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Email</p>
              <p className="text-lg text-gray-900">{customerData.profile?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Phone</p>
              <p className="text-lg text-gray-900">{customerData.profile?.phone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Member Since</p>
              <p className="text-lg text-gray-900">{customerData.profile?.memberSince}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;

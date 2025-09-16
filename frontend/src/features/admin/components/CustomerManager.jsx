import React, { useState, useEffect } from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Search,
  Filter,
  Eye,
  Phone,
  Mail,
  MapPin,
  Star,
  Crown,
  UserCheck,
  UserX,
  MoreHorizontal,
  BarChart3,
  ShoppingBag,
  Clock,
  Award
} from 'lucide-react';
import DataTable from '../../../components/ui/tables/DataTable';
import Modal from '../../../components/ui/modals/Modal';
import Dropdown from '../../../components/ui/forms/Dropdown';
import { formatAppCurrency } from '../../../lib/utils/formatNumber';
import { useTheme } from '../../../app/providers/ThemeContext';

const CustomerManager = () => {
  const { isDarkMode } = useTheme();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('totalSpent');
  const [sortOrder, setSortOrder] = useState('desc');

  // Customer statistics
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    highValueCustomers: 0,
    recentCustomers: 0
  });

  useEffect(() => {
    loadCustomerData();
  }, []);

  const loadCustomerData = () => {
    setLoading(true);
    try {
      // Get sales data from localStorage
      const salesData = JSON.parse(localStorage.getItem('sales') || '[]');
      
      // Process sales data to extract customer information
      const customerMap = new Map();
      
      salesData.forEach(sale => {
        const customerName = sale.customerName || 'Anonymous Customer';
        const customerPhone = sale.customerPhone || 'N/A';
        const customerEmail = sale.customerEmail || 'N/A';
        const customerAddress = sale.customerAddress || 'N/A';
        
        if (!customerMap.has(customerName)) {
          customerMap.set(customerName, {
            id: Date.now() + Math.random(),
            name: customerName,
            phone: customerPhone,
            email: customerEmail,
            address: customerAddress,
            transactions: [],
            totalSpent: 0,
            totalTransactions: 0,
            averageOrderValue: 0,
            lastPurchase: null,
            firstPurchase: null,
            status: 'active',
            customerValue: 'regular'
          });
        }
        
        const customer = customerMap.get(customerName);
        customer.transactions.push({
          id: sale.id,
          date: sale.date,
          receiptNumber: sale.receiptNumber,
          total: sale.total,
          items: sale.items,
          status: sale.status
        });
        
        customer.totalSpent += sale.total;
        customer.totalTransactions += 1;
        customer.averageOrderValue = customer.totalSpent / customer.totalTransactions;
        
        const saleDate = new Date(sale.date);
        if (!customer.lastPurchase || saleDate > new Date(customer.lastPurchase)) {
          customer.lastPurchase = sale.date;
        }
        if (!customer.firstPurchase || saleDate < new Date(customer.firstPurchase)) {
          customer.firstPurchase = sale.date;
        }
      });
      
      // Convert to array and calculate customer value tiers
      const customersArray = Array.from(customerMap.values()).map(customer => {
        let customerValue = 'regular';
        if (customer.totalSpent >= 1000000) {
          customerValue = 'premium';
        } else if (customer.totalSpent >= 500000) {
          customerValue = 'high';
        } else if (customer.totalSpent >= 100000) {
          customerValue = 'medium';
        }
        
        return {
          ...customer,
          customerValue
        };
      });
      
      setCustomers(customersArray);
      
      // Calculate statistics
      const totalCustomers = customersArray.length;
      const activeCustomers = customersArray.filter(c => {
        const lastPurchase = new Date(c.lastPurchase);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return lastPurchase >= thirtyDaysAgo;
      }).length;
      const highValueCustomers = customersArray.filter(c => c.customerValue === 'premium' || c.customerValue === 'high').length;
      const recentCustomers = customersArray.filter(c => {
        const firstPurchase = new Date(c.firstPurchase);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return firstPurchase >= thirtyDaysAgo;
      }).length;
      
      setStats({
        totalCustomers,
        activeCustomers,
        highValueCustomers,
        recentCustomers
      });
      
    } catch (error) {
      console.error('Error loading customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatCardClick = (filterType) => {
    if (activeFilter === filterType) {
      setActiveFilter('all');
    } else {
      setActiveFilter(filterType);
    }
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(true);
  };

  const getCustomerValueIcon = (value) => {
    switch (value) {
      case 'premium':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'high':
        return <Star className="h-4 w-4 text-blue-500" />;
      case 'medium':
        return <Award className="h-4 w-4 text-green-500" />;
      default:
        return <UserCheck className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCustomerValueColor = (value) => {
    switch (value) {
      case 'premium':
        return 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 dark:from-yellow-900/20 dark:to-orange-900/20 dark:text-yellow-300';
      case 'high':
        return 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 dark:from-blue-900/20 dark:to-indigo-900/20 dark:text-blue-300';
      case 'medium':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/20 dark:to-emerald-900/20 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getCustomerValueLabel = (value) => {
    switch (value) {
      case 'premium':
        return 'Premium';
      case 'high':
        return 'High Value';
      case 'medium':
        return 'Medium Value';
      default:
        return 'Regular';
    }
  };

  // Filter customers based on active filter
  const filteredCustomers = customers.filter(customer => {
    if (activeFilter === 'active') {
      const lastPurchase = new Date(customer.lastPurchase);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return lastPurchase >= thirtyDaysAgo;
    } else if (activeFilter === 'high-value') {
      return customer.customerValue === 'premium' || customer.customerValue === 'high';
    } else if (activeFilter === 'recent') {
      const firstPurchase = new Date(customer.firstPurchase);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return firstPurchase >= thirtyDaysAgo;
    }
    return true;
  }).filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort customers
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'totalSpent':
        aValue = a.totalSpent;
        bValue = b.totalSpent;
        break;
      case 'totalTransactions':
        aValue = a.totalTransactions;
        bValue = b.totalTransactions;
        break;
      case 'averageOrderValue':
        aValue = a.averageOrderValue;
        bValue = b.averageOrderValue;
        break;
      case 'lastPurchase':
        aValue = new Date(a.lastPurchase);
        bValue = new Date(b.lastPurchase);
        break;
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      default:
        aValue = a.totalSpent;
        bValue = b.totalSpent;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const customerColumns = [
    {
      key: 'name',
      header: 'Customer Name',
      accessor: (customer) => customer.name,
      render: (customer) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{customer.name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{customer.phone}</div>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'customerValue',
      header: 'Value Tier',
      accessor: (customer) => customer.customerValue,
      render: (customer) => (
        <div className="flex items-center space-x-2">
          {getCustomerValueIcon(customer.customerValue)}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCustomerValueColor(customer.customerValue)}`}>
            {getCustomerValueLabel(customer.customerValue)}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'totalSpent',
      header: 'Total Spent',
      accessor: (customer) => customer.totalSpent,
      render: (customer) => (
        <div className="font-semibold text-gray-900 dark:text-white">
          {formatAppCurrency(customer.totalSpent)}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'totalTransactions',
      header: 'Transactions',
      accessor: (customer) => customer.totalTransactions,
      render: (customer) => (
        <div className="flex items-center space-x-2">
          <ShoppingBag className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-gray-900 dark:text-white">{customer.totalTransactions}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'averageOrderValue',
      header: 'Avg. Order',
      accessor: (customer) => customer.averageOrderValue,
      render: (customer) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {formatAppCurrency(customer.averageOrderValue)}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'lastPurchase',
      header: 'Last Purchase',
      accessor: (customer) => customer.lastPurchase,
      render: (customer) => (
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {new Date(customer.lastPurchase).toLocaleDateString()}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (customer) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewCustomer(customer)}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="More Options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      ),
      sortable: false,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customer Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track customer transactions and identify your most valuable customers
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          className={`p-6 rounded-xl border transition-all duration-200 cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700'
              : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
          onClick={() => handleStatCardClick('all')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCustomers}</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div
          className={`p-6 rounded-xl border transition-all duration-200 cursor-pointer ${
            activeFilter === 'active'
              ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700'
              : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
          onClick={() => handleStatCardClick('active')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Customers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeCustomers}</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div
          className={`p-6 rounded-xl border transition-all duration-200 cursor-pointer ${
            activeFilter === 'high-value'
              ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700'
              : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
          onClick={() => handleStatCardClick('high-value')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">High Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.highValueCustomers}</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Crown className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div
          className={`p-6 rounded-xl border transition-all duration-200 cursor-pointer ${
            activeFilter === 'recent'
              ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-700'
              : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
          onClick={() => handleStatCardClick('recent')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Customers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.recentCustomers}</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Dropdown
              value={sortBy}
              onChange={setSortBy}
              options={[
                { value: 'totalSpent', label: 'Total Spent' },
                { value: 'totalTransactions', label: 'Transactions' },
                { value: 'averageOrderValue', label: 'Avg. Order Value' },
                { value: 'lastPurchase', label: 'Last Purchase' },
                { value: 'name', label: 'Name' }
              ]}
              placeholder="Sort by..."
              className="w-40"
            />
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <DataTable
          data={sortedCustomers}
          columns={customerColumns}
          loading={loading}
          emptyMessage="No customers found"
          className="dark:bg-gray-800"
        />
      </div>

      {/* Customer Details Modal */}
      {showCustomerModal && selectedCustomer && (
        <Modal
          isOpen={showCustomerModal}
          onClose={() => setShowCustomerModal(false)}
          title="Customer Details"
          size="lg"
        >
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xl">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedCustomer.name}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center space-x-1">
                      <Phone className="h-4 w-4" />
                      <span>{selectedCustomer.phone}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Mail className="h-4 w-4" />
                      <span>{selectedCustomer.email}</span>
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatAppCurrency(selectedCustomer.totalSpent)}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCustomer.totalTransactions}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Transactions</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatAppCurrency(selectedCustomer.averageOrderValue)}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Order</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    {getCustomerValueIcon(selectedCustomer.customerValue)}
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {getCustomerValueLabel(selectedCustomer.customerValue)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Value Tier</p>
                </div>
              </div>
            </div>

            {/* Transaction History */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Transaction History</h4>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {selectedCustomer.transactions.map((transaction) => (
                  <div key={transaction.id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <ShoppingBag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Receipt #{transaction.receiptNumber}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">{formatAppCurrency(transaction.total)}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                            : transaction.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                        }`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {transaction.items.length} item{transaction.items.length !== 1 ? 's' : ''} purchased
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CustomerManager;








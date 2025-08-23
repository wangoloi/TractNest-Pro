import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal,
  FileText,
  DollarSign,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import api from '@utils/api';
import { DataTable, Button, Dropdown } from '../shared';
import { formatNumber } from '../../utils/formatNumber';

const Receipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipts, setSelectedReceipts] = useState([]);
  const [stats, setStats] = useState({
    totalReceipts: 0,
    totalAmount: 0,
    pendingReceipts: 0,
    thisMonth: 0
  });

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/receipts');
      const data = response.data;
      
      setReceipts(data);
      
      // Calculate stats
      const totalReceipts = data.length;
      const totalAmount = data.reduce((sum, receipt) => sum + receipt.total_amount, 0);
      const pendingReceipts = data.filter(receipt => receipt.status === 'pending').length;
      const thisMonth = data.filter(receipt => {
        const receiptDate = new Date(receipt.created_at);
        const now = new Date();
        return receiptDate.getMonth() === now.getMonth() && 
               receiptDate.getFullYear() === now.getFullYear();
      }).length;
      
      setStats({
        totalReceipts,
        totalAmount,
        pendingReceipts,
        thisMonth
      });
    } catch (error) {
      console.error('Error fetching receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectionChange = (selectedIds) => {
    setSelectedReceipts(selectedIds);
  };

  const handleRowClick = (receipt) => {
    // Handle row click - could open receipt details modal
    console.log('Clicked receipt:', receipt);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center">
            <CheckCircle size={12} className="mr-1" />
            Completed
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center">
            <Clock size={12} className="mr-1" />
            Pending
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center">
            <AlertCircle size={12} className="mr-1" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const columns = [
    { 
      key: 'receipt_no', 
      header: 'Receipt No.',
      render: (row) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
            <FileText size={16} className="text-green-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{row.receipt_no}</p>
            <p className="text-sm text-gray-500">{formatDate(row.created_at)}</p>
          </div>
        </div>
      )
    },
    { 
      key: 'supplier_name', 
      header: 'Supplier',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.supplier_name}</p>
          <p className="text-sm text-gray-500">{row.supplier_email}</p>
        </div>
      )
    },
    { 
      key: 'total_amount', 
      header: 'Total Amount',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">${formatNumber(row.total_amount)}</p>
          {row.tax_amount > 0 && (
            <p className="text-sm text-gray-500">Tax: ${formatNumber(row.tax_amount)}</p>
          )}
        </div>
      )
    },
    { 
      key: 'discount_amount', 
      header: 'Discount',
      render: (row) => (
        <span className="text-gray-900">
          {row.discount_amount > 0 ? `-$${formatNumber(row.discount_amount)}` : 'No discount'}
        </span>
      )
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (row) => getStatusBadge(row.status)
    },
    { 
      key: 'created_by', 
      header: 'Created By',
      render: (row) => row.created_by || 'System'
    },
    { 
      key: 'actions', 
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline">View</Button>
          <Button size="sm" variant="ghost">
            <MoreHorizontal size={16} />
          </Button>
        </div>
      )
    }
  ];

  const StatCard = ({ title, value, icon: Icon, color = 'blue', trend }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-1">{trend}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon size={24} className={`text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Receipts Management</h1>
          <p className="text-gray-600">Track and manage your purchase receipts</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" icon={Download}>
            Export
          </Button>
          <Button icon={Plus}>
            New Receipt
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Receipts"
          value={stats.totalReceipts}
          icon={FileText}
          color="blue"
          trend="+8% from last month"
        />
        <StatCard
          title="Total Amount"
          value={`$${formatNumber(stats.totalAmount)}`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Pending Receipts"
          value={stats.pendingReceipts}
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="This Month"
          value={stats.thisMonth}
          icon={Calendar}
          color="purple"
        />
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search receipts..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <Dropdown
              placeholder="Status"
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'completed', label: 'Completed' },
                { value: 'pending', label: 'Pending' },
                { value: 'cancelled', label: 'Cancelled' }
              ]}
              value="all"
              onChange={() => {}}
            />
            <Dropdown
              placeholder="Date Range"
              options={[
                { value: 'all', label: 'All Time' },
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' },
                { value: 'quarter', label: 'This Quarter' }
              ]}
              value="all"
              onChange={() => {}}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            {selectedReceipts.length > 0 && (
              <span className="text-sm text-gray-600">
                {selectedReceipts.length} receipts selected
              </span>
            )}
            <Button variant="outline" size="sm">
              <Filter size={16} className="mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          data={receipts}
          columns={columns}
          loading={loading}
          showSelection={true}
          onSelectionChange={handleSelectionChange}
          onRowClick={handleRowClick}
          pageSize={10}
          className="border-0"
        />
      </div>

      {/* Quick Actions */}
      {selectedReceipts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-900">
                {selectedReceipts.length} receipts selected
              </span>
              <Button size="sm" variant="outline">
                Mark as Completed
              </Button>
              <Button size="sm" variant="outline">
                Export Selected
              </Button>
              <Button size="sm" variant="outline">
                Print Receipts
              </Button>
            </div>
            <Button size="sm" variant="ghost">
              Clear Selection
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Receipts;

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import api from '@utils/api';
import { DataTable, Button, Dropdown } from '../shared';
import { formatNumber } from '../../utils/formatNumber';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockItems: 0,
    totalValue: 0,
    categories: 0
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/inventory');
      const data = response.data;
      
      setInventory(data);
      
      // Calculate stats
      const totalItems = data.length;
      const lowStockItems = data.filter(item => item.quantity <= (item.reorder_level || 10)).length;
      const totalValue = data.reduce((sum, item) => sum + (item.quantity * item.cost_price), 0);
      const categories = new Set(data.map(item => item.category).filter(Boolean)).size;
      
      setStats({
        totalItems,
        lowStockItems,
        totalValue,
        categories
      });
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectionChange = (selectedIds) => {
    setSelectedItems(selectedIds);
  };

  const handleRowClick = (item) => {
    // Handle row click - could open edit modal
    console.log('Clicked item:', item);
  };

  const getStatusBadge = (item) => {
    if (item.quantity <= 0) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Out of Stock</span>;
    } else if (item.quantity <= (item.reorder_level || 10)) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Low Stock</span>;
    } else {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">In Stock</span>;
    }
  };

  const getStockTrend = (item) => {
    // Mock trend data - in real app this would come from historical data
    const trend = Math.random() > 0.5 ? 'up' : 'down';
    const percentage = Math.floor(Math.random() * 20) + 1;
    
    return (
      <div className="flex items-center">
        {trend === 'up' ? (
          <TrendingUp size={12} className="text-green-500 mr-1" />
        ) : (
          <TrendingDown size={12} className="text-red-500 mr-1" />
        )}
        <span className={`text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {percentage}%
        </span>
      </div>
    );
  };

  const columns = [
    { 
      key: 'name', 
      header: 'Product Name',
      render: (row) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <Package size={16} className="text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{row.name}</p>
            <p className="text-sm text-gray-500">{row.sku}</p>
          </div>
        </div>
      )
    },
    { 
      key: 'category', 
      header: 'Category',
      render: (row) => (
        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
          {row.category || 'Uncategorized'}
        </span>
      )
    },
    { 
      key: 'quantity', 
      header: 'Stock Level',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.quantity} {row.unit}</p>
          {getStockTrend(row)}
        </div>
      )
    },
    { 
      key: 'cost_price', 
      header: 'Cost Price',
      render: (row) => `$${formatNumber(row.cost_price)}`
    },
    { 
      key: 'selling_price', 
      header: 'Selling Price',
      render: (row) => `$${formatNumber(row.selling_price)}`
    },
    { 
      key: 'total_value', 
      header: 'Total Value',
      render: (row) => `$${formatNumber(row.quantity * row.cost_price)}`
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (row) => getStatusBadge(row)
    },
    { 
      key: 'supplier', 
      header: 'Supplier',
      render: (row) => row.supplier || 'N/A'
    },
    { 
      key: 'actions', 
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline">Edit</Button>
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
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Manage your product inventory and stock levels</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" icon={Download}>
            Export
          </Button>
          <Button icon={Plus}>
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={stats.totalItems}
          icon={Package}
          color="blue"
          trend="+12% from last month"
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockItems}
          icon={AlertTriangle}
          color="orange"
        />
        <StatCard
          title="Total Value"
          value={`$${formatNumber(stats.totalValue)}`}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Categories"
          value={stats.categories}
          icon={Package}
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
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <Dropdown
              placeholder="Category"
              options={[
                { value: 'all', label: 'All Categories' },
                { value: 'electronics', label: 'Electronics' },
                { value: 'accessories', label: 'Accessories' },
                { value: 'furniture', label: 'Furniture' }
              ]}
              value="all"
              onChange={() => {}}
            />
            <Dropdown
              placeholder="Status"
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'in-stock', label: 'In Stock' },
                { value: 'low-stock', label: 'Low Stock' },
                { value: 'out-of-stock', label: 'Out of Stock' }
              ]}
              value="all"
              onChange={() => {}}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            {selectedItems.length > 0 && (
              <span className="text-sm text-gray-600">
                {selectedItems.length} items selected
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
          data={inventory}
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
      {selectedItems.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-900">
                {selectedItems.length} items selected
              </span>
              <Button size="sm" variant="outline">
                Update Stock
              </Button>
              <Button size="sm" variant="outline">
                Change Status
              </Button>
              <Button size="sm" variant="outline">
                Export Selected
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

export default Inventory;

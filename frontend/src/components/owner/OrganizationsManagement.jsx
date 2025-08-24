import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
// Removed API import - using mock data
import { SkeletonList } from '../common/Skeleton';
import DataTable from '../shared/DataTable';
import Dropdown from '../shared/Dropdown';

const OrganizationsManagement = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      console.log('🔄 Organizations Management: Fetching organizations...');
      
      // Mock data for organizations
      const orgs = [
        { id: 1, name: 'Demo Organization', slug: 'demo', domain: 'demo.tracknest.com', status: 'active', created_at: new Date().toISOString() },
        { id: 2, name: 'Tech Solutions Inc', slug: 'techsolutions', domain: 'tech.tracknest.com', status: 'active', created_at: new Date().toISOString() },
        { id: 3, name: 'Global Enterprises', slug: 'globalenterprises', domain: 'global.tracknest.com', status: 'pending', created_at: new Date().toISOString() },
        { id: 4, name: 'Startup Hub', slug: 'startuphub', domain: 'startup.tracknest.com', status: 'active', created_at: new Date().toISOString() },
        { id: 5, name: 'Innovation Labs', slug: 'innovationlabs', domain: 'innovation.tracknest.com', status: 'suspended', created_at: new Date().toISOString() }
      ];
      
      setOrganizations(orgs);
      console.log('✅ Organizations loaded:', orgs.length, 'organizations');
    } catch (error) {
      console.error('❌ Error fetching organizations:', error);
      setOrganizations([]);
    } finally {
      console.log('🔄 Organizations Management loading complete');
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Organization',
      accessor: (org) => org.name,
      render: (org) => (
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 rounded-full p-2">
            <Building2 className="text-blue-600" size={16} />
          </div>
          <div>
            <div className="font-medium text-gray-900">{org.name}</div>
            <div className="text-sm text-gray-500">{org.slug}</div>
            <div className="text-xs text-gray-400">{org.domain}</div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (org) => org.status,
      render: (org) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          org.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : org.status === 'pending'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {org.status}
        </span>
      )
    },
    {
      key: 'created_at',
      header: 'Created',
      accessor: (org) => org.created_at,
      render: (org) => new Date(org.created_at).toLocaleDateString()
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (org) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleView(org)}
            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => handleEdit(org)}
            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(org)}
            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  const handleView = (org) => {
    console.log('View organization:', org);
    // Implement view functionality
  };

  const handleEdit = (org) => {
    console.log('Edit organization:', org);
    // Implement edit functionality
  };

  const handleDelete = (org) => {
    if (window.confirm(`Are you sure you want to delete ${org.name}?`)) {
      setOrganizations(organizations.filter(o => o.id !== org.id));
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'suspended', label: 'Suspended' }
  ];

  if (loading) {
    return <SkeletonList count={5} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organizations Management</h1>
          <p className="text-gray-600">Manage your multi-tenant organizations</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus size={20} />
          Add Organization
        </button>
      </div>

      {/* Data Table */}
      <DataTable
        data={organizations}
        columns={columns}
        loading={loading}
        showSearch={true}
        showFilters={true}
        showExport={true}
        pageSize={10}
        pageSizeOptions={[5, 10, 25, 50]}
      />
    </div>
  );
};

export default OrganizationsManagement;

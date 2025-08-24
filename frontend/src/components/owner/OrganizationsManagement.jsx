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
import api from '@utils/api';
import { SkeletonList } from '../common/Skeleton';

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
      const response = await api.get('/api/admin/organizations');
      const orgs = response.data || [];
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

  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || org.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
        <button
          onClick={fetchOrganizations}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {/* Organizations List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Organizations ({filteredOrganizations.length})
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {filteredOrganizations.map((org) => (
              <div key={org.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="bg-blue-100 rounded-full p-3">
                  <Building2 className="text-blue-600" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{org.name}</h3>
                  <p className="text-sm text-gray-600">{org.slug}</p>
                  <p className="text-xs text-gray-500">{org.domain}</p>
                  <p className="text-xs text-gray-500">
                    Created: {new Date(org.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    org.status === 'active' ? 'bg-green-100 text-green-800' :
                    org.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {org.status}
                  </span>
                  <button className="p-2 text-gray-400 hover:text-blue-600">
                    <Eye size={16} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-green-600">
                    <Edit size={16} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {filteredOrganizations.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Building2 className="mx-auto mb-4" size={48} />
                <p className="text-lg font-medium">No organizations found</p>
                <p className="text-sm">Create your first organization to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationsManagement;

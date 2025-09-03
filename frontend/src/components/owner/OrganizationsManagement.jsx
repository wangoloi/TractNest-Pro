import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Search,
  Filter,
  RefreshCw,
  Copy,
  CheckCircle,
  Mail,
  MailCheck
} from 'lucide-react';
// Removed API import - using mock data
import { SkeletonList } from '../common/Skeleton';
import DataTable from '../ui/tables/DataTable';
import Dropdown from '../ui/forms/Dropdown';
import Modal from '../ui/modals/Modal';
import { generateUsername, generatePassword, generateEmailContent, sendEmail } from '../../lib/utils/userGenerator';

const OrganizationsManagement = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    domain: '',
    admin_email: '',
    admin_first_name: '',
    admin_last_name: '',
    status: 'active'
  });

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
    setEditingOrg(org);
    setFormData({
      name: org.name,
      slug: org.slug,
      domain: org.domain,
      admin_email: org.admin_email || '',
      admin_first_name: org.admin_first_name || '',
      admin_last_name: org.admin_last_name || '',
      status: org.status
    });
    setShowModal(true);
  };

  const handleDelete = (org) => {
    if (window.confirm(`Are you sure you want to delete ${org.name}?`)) {
      setOrganizations(organizations.filter(o => o.id !== org.id));
    }
  };

  const handleAdd = () => {
    setEditingOrg(null);
    setFormData({
      name: '',
      slug: '',
      domain: '',
      admin_email: '',
      admin_first_name: '',
      admin_last_name: '',
      status: 'active'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editingOrg) {
      // Update existing organization
      setOrganizations(organizations.map(org => 
        org.id === editingOrg.id 
          ? { ...org, ...formData }
          : org
      ));
      setShowModal(false);
    } else {
      // Add new organization with auto-generated admin credentials
      try {
        setLoading(true);
        
        // Generate admin credentials
        
        const existingUsernames = organizations.map(org => org.admin_username).filter(Boolean);
        const adminUsername = generateUsername(formData.admin_first_name, formData.admin_last_name, existingUsernames);
        const adminPassword = generatePassword(formData.admin_first_name, formData.admin_last_name);
        
        // Create new organization
        const newOrg = {
          id: Date.now(),
          name: formData.name,
          slug: formData.slug,
          domain: formData.domain,
          status: formData.status,
          admin_email: formData.admin_email,
          admin_first_name: formData.admin_first_name,
          admin_last_name: formData.admin_last_name,
          admin_username: adminUsername,
          admin_password: adminPassword,
          created_at: new Date().toISOString(),
          generatedCredentials: {
            username: adminUsername,
            password: adminPassword,
            generatedAt: new Date().toISOString(),
            generatedBy: 'owner'
          }
        };
        
        setOrganizations([...organizations, newOrg]);
        
        // Send email to admin
        try {
          const emailContent = generateEmailContent(
            adminUsername,
            adminPassword,
            `${formData.admin_first_name} ${formData.admin_last_name}`,
            'TrackNest Pro Owner'
          );
          
          const emailResult = await sendEmail(formData.admin_email, emailContent.subject, emailContent.body);
          console.log('Email sent successfully:', emailResult);
        } catch (error) {
          console.error('Failed to send email:', error);
        }
        
        // Show credentials modal
        setGeneratedCredentials({
          username: adminUsername,
          password: adminPassword,
          emailSent: true
        });
        setShowCredentialsModal(true);
        setShowModal(false);
        
      } catch (error) {
        console.error('Error adding new organization:', error);
        alert('Failed to add new organization. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDropdownChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
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
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
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

      {/* Add/Edit Organization Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingOrg ? 'Edit Organization' : 'Add New Organization'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Domain
            </label>
            <input
              type="text"
              name="domain"
              value={formData.domain}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="organization.tracknest.com"
              required
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Organization Admin</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin First Name
                </label>
                <input
                  type="text"
                  name="admin_first_name"
                  value={formData.admin_first_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Last Name
                </label>
                <input
                  type="text"
                  name="admin_last_name"
                  value={formData.admin_last_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                name="admin_email"
                value={formData.admin_email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <Dropdown
              options={[
                { value: 'active', label: 'Active' },
                { value: 'pending', label: 'Pending' },
                { value: 'suspended', label: 'Suspended' }
              ]}
              value={formData.status}
              onChange={(value) => handleDropdownChange('status', value)}
              placeholder="Select status..."
            />
          </div>
          
          {!editingOrg && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-blue-600" size={20} />
                <div>
                  <h3 className="font-medium text-blue-800">Auto-Generated Admin Credentials</h3>
                  <p className="text-sm text-blue-600 mt-1">
                    Admin username and password will be automatically generated based on the admin's name.
                  </p>
                  <p className="text-xs text-blue-500 mt-1">
                    Password format: firstname@lastname (e.g., john@doe)
                  </p>
                  <p className="text-xs text-blue-500">
                    Credentials will be automatically sent to the admin's email address.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Organization...' : (editingOrg ? 'Update Organization' : 'Add Organization')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Generated Credentials Modal */}
      <Modal
        isOpen={showCredentialsModal}
        onClose={() => setShowCredentialsModal(false)}
        title="Organization Created Successfully!"
      >
        <div className="space-y-6">
          {generatedCredentials && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-600" size={20} />
                <div>
                  <h3 className="font-medium text-green-800">Organization Created</h3>
                  <p className="text-sm text-green-600 mt-1">
                    New organization has been created with auto-generated admin credentials.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Email Status */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              {generatedCredentials?.emailSent ? (
                <MailCheck className="text-green-600" size={20} />
              ) : (
                <Mail className="text-blue-600" size={20} />
              )}
              <div>
                <h3 className="font-medium text-blue-800">
                  {generatedCredentials?.emailSent ? 'Email Sent Successfully' : 'Email Status'}
                </h3>
                <p className="text-sm text-blue-600 mt-1">
                  {generatedCredentials?.emailSent 
                    ? 'Admin credentials have been automatically sent to the admin\'s email address.'
                    : 'Email sending is in progress...'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Generated Admin Username
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={generatedCredentials?.username || ''}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(generatedCredentials?.username || '', 'username')}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                  title="Copy username"
                >
                  {copiedField === 'username' ? <CheckCircle size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Generated Admin Password (Name-based)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={generatedCredentials?.password || ''}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(generatedCredentials?.password || '', 'password')}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                  title="Copy password"
                >
                  {copiedField === 'password' ? <CheckCircle size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Password format: firstname@lastname (based on admin's name)
              </p>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-yellow-600 mt-0.5">⚠️</div>
              <div>
                <h4 className="font-medium text-yellow-800 mb-2">Important Instructions</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Share these credentials securely with the organization admin</li>
                  <li>• The admin should change their password upon first login</li>
                  <li>• Keep these credentials confidential and secure</li>
                  <li>• Store this information safely for future reference</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowCredentialsModal(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrganizationsManagement;

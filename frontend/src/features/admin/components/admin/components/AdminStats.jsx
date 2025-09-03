import React from 'react';
import { Users, CheckCircle, DollarSign, Activity } from 'lucide-react';

const AdminStats = ({ stats, activeFilter, onFilterChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <button
        onClick={() => onFilterChange('all')}
        className={`bg-white rounded-lg shadow p-6 transition-all duration-200 hover:shadow-md ${
          activeFilter === 'all' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${
            activeFilter === 'all' ? 'bg-blue-200' : 'bg-blue-100'
          }`}>
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Admins</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalAdmins}</p>
          </div>
        </div>
      </button>

      <button
        onClick={() => onFilterChange('active')}
        className={`bg-white rounded-lg shadow p-6 transition-all duration-200 hover:shadow-md ${
          activeFilter === 'active' ? 'ring-2 ring-green-500 bg-green-50' : 'hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${
            activeFilter === 'active' ? 'bg-green-200' : 'bg-green-100'
          }`}>
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Active Admins</p>
            <p className="text-2xl font-bold text-green-600">{stats.activeAdmins}</p>
          </div>
        </div>
      </button>

      <button
        onClick={() => onFilterChange('subscribed')}
        className={`bg-white rounded-lg shadow p-6 transition-all duration-200 hover:shadow-md ${
          activeFilter === 'subscribed' ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${
            activeFilter === 'subscribed' ? 'bg-purple-200' : 'bg-purple-100'
          }`}>
            <DollarSign className="h-6 w-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Subscribed</p>
            <p className="text-2xl font-bold text-purple-600">{stats.subscribedAdmins}</p>
          </div>
        </div>
      </button>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Activity className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;

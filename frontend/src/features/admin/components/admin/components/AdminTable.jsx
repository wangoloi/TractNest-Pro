import React from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';

const AdminTable = ({ 
  filteredAdmins, 
  onViewAdmin, 
  onEditAdmin, 
  onDeleteAdmin,
  getStatusColor,
  getSubscriptionColor
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Admin
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Business
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Subscription
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sub-Users
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Access Control
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredAdmins.map((admin) => (
            <tr key={admin.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {admin.firstName[0]}{admin.lastName[0]}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {admin.firstName} {admin.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{admin.email}</div>
                    <div className="text-xs text-gray-400">@{admin.username}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">{admin.businessName}</div>
                  <div className="text-xs text-gray-500 capitalize">{admin.businessType}</div>
                  <div className="text-xs text-gray-400">{admin.businessAddress}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(admin.status)}`}>
                  {admin.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSubscriptionColor(admin.subscription.status)}`}>
                    {admin.subscription.status}
                  </span>
                  <div className="text-xs text-gray-500 mt-1">
                    {admin.subscription.plan} - ${admin.subscription.amount}
                  </div>
                  <div className="text-xs text-gray-400">
                    Expires: {new Date(admin.subscription.expiresAt).toLocaleDateString()}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  <div className="font-medium">{admin.subUsers.length} Sub-Users</div>
                  <div className="text-xs text-gray-500">
                    {admin.subUsers.length > 0 ? 'Active' : 'None added'}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm">
                  <div className="font-medium text-gray-900">Business Owner</div>
                  <div className="text-xs text-gray-500">
                    {Object.keys(admin.permissions).filter(key => admin.permissions[key]).length} permissions
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onViewAdmin(admin)}
                    className="text-blue-600 hover:text-blue-900"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEditAdmin(admin)}
                    className="text-orange-600 hover:text-orange-900"
                    title="Edit Admin"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDeleteAdmin(admin)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete Admin"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTable;

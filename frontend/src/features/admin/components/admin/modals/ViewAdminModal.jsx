import React from 'react';
import { X, Printer } from 'lucide-react';
import Modal from '../../../../../components/ui/modals/Modal';

const ViewAdminModal = ({ 
  isOpen, 
  onClose, 
  selectedAdmin, 
  onPrintDetails,
  getStatusColor,
  getSubscriptionColor
}) => {
  if (!selectedAdmin) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Admin Details</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Admin Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Admin Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Full Name:</span>
                <span className="ml-2 text-sm text-gray-900">{selectedAdmin.firstName} {selectedAdmin.lastName}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Email:</span>
                <span className="ml-2 text-sm text-gray-900">{selectedAdmin.email}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Phone:</span>
                <span className="ml-2 text-sm text-gray-900">{selectedAdmin.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Username:</span>
                <span className="ml-2 text-sm text-gray-900">{selectedAdmin.username}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Status:</span>
                <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedAdmin.status)}`}>
                  {selectedAdmin.status}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Business ID:</span>
                <span className="ml-2 text-sm text-gray-900 font-mono">{selectedAdmin.businessId}</span>
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Business Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Business Name:</span>
                <span className="ml-2 text-sm text-gray-900">{selectedAdmin.businessName}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Business Type:</span>
                <span className="ml-2 text-sm text-gray-900 capitalize">{selectedAdmin.businessType}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Business Address:</span>
                <span className="ml-2 text-sm text-gray-900">{selectedAdmin.businessAddress || 'N/A'}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Business Phone:</span>
                <span className="ml-2 text-sm text-gray-900">{selectedAdmin.businessPhone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Business Email:</span>
                <span className="ml-2 text-sm text-gray-900">{selectedAdmin.businessEmail || 'N/A'}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Sub-Users:</span>
                <span className="ml-2 text-sm text-gray-900">{selectedAdmin.subUsers.length} users</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Subscription Information</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-600">Plan:</span>
                <span className="ml-2 text-sm text-gray-900">{selectedAdmin.subscription.plan}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Status:</span>
                <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSubscriptionColor(selectedAdmin.subscription.status)}`}>
                  {selectedAdmin.subscription.status}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Amount:</span>
                <span className="ml-2 text-sm text-gray-900">${selectedAdmin.subscription.amount}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Expires:</span>
                <span className="ml-2 text-sm text-gray-900">{new Date(selectedAdmin.subscription.expiresAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600">Sales Count</div>
              <div className="text-2xl font-bold text-gray-900">{selectedAdmin.performance.salesCount}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600">Revenue</div>
              <div className="text-2xl font-bold text-gray-900">${selectedAdmin.performance.revenue.toLocaleString()}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600">Customers</div>
              <div className="text-2xl font-bold text-gray-900">{selectedAdmin.performance.customers}</div>
            </div>
          </div>
        </div>
        
        {selectedAdmin.generatedCredentials && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Generated Credentials</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-600">Username:</span>
                  <span className="ml-2 text-sm text-gray-900 font-mono">{selectedAdmin.generatedCredentials.username}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Generated By:</span>
                  <span className="ml-2 text-sm text-gray-900">{selectedAdmin.generatedCredentials.generatedBy}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Generated At:</span>
                  <span className="ml-2 text-sm text-gray-900">{new Date(selectedAdmin.generatedCredentials.generatedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => onPrintDetails(selectedAdmin)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Details
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewAdminModal;

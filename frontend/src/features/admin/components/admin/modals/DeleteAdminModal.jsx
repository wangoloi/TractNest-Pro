import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import Modal from '../../../../../components/ui/modals/Modal';

const DeleteAdminModal = ({ 
  isOpen, 
  onClose, 
  deletingAdmin, 
  onConfirmDelete,
  loading
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-red-600">Delete Admin</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
            <h3 className="text-lg font-semibold">Confirm Deletion</h3>
          </div>
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{deletingAdmin?.firstName} {deletingAdmin?.lastName}</strong>? 
            This action cannot be undone and will permanently remove the admin from the system.
          </p>
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> This will also delete their subscription data and performance metrics.
            </p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirmDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete Admin'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteAdminModal;

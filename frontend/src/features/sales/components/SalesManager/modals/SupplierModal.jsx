import React from "react";
import Modal from "../../../../../components/ui/modals/Modal";

const SupplierModal = ({ showSupplierModal, setShowSupplierModal, selectedStockItem, setSelectedStockItem, handleNewStock }) => {
  if (!showSupplierModal || !selectedStockItem) return null;

  return (
    <Modal
      isOpen={showSupplierModal}
      onClose={() => setShowSupplierModal(false)}
      size="md"
      title="Update Supplier Information"
    >
      <div className="p-6">
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Current Item</h3>
            <p className="text-blue-700">{selectedStockItem.name}</p>
            <p className="text-blue-600 text-sm">Current Supplier: {selectedStockItem.supplier || 'Not specified'}</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier Name
              </label>
              <input
                type="text"
                defaultValue={selectedStockItem.supplier || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => {
                  const updatedItem = {
                    ...selectedStockItem,
                    supplier: e.target.value
                  };
                  handleNewStock(updatedItem);
                  setShowSupplierModal(false);
                  setSelectedStockItem(null);
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier Phone
              </label>
              <input
                type="text"
                defaultValue={selectedStockItem.supplierPhone || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => {
                  const updatedItem = {
                    ...selectedStockItem,
                    supplierPhone: e.target.value
                  };
                  handleNewStock(updatedItem);
                  setShowSupplierModal(false);
                  setSelectedStockItem(null);
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier Email
              </label>
              <input
                type="email"
                defaultValue={selectedStockItem.supplierEmail || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => {
                  const updatedItem = {
                    ...selectedStockItem,
                    supplierEmail: e.target.value
                  };
                  handleNewStock(updatedItem);
                  setShowSupplierModal(false);
                  setSelectedStockItem(null);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SupplierModal;



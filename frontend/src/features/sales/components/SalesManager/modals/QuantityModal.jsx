import React from "react";
import Modal from "../../../../../components/ui/modals/Modal";

const QuantityModal = ({ showQuantityModal, setShowQuantityModal, selectedStockItem, setSelectedStockItem, handleNewStock }) => {
  if (!showQuantityModal || !selectedStockItem) return null;

  return (
    <Modal
      isOpen={showQuantityModal}
      onClose={() => setShowQuantityModal(false)}
      size="md"
      title="Update Stock Quantity"
    >
      <div className="p-6">
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Current Item</h3>
            <p className="text-blue-700">{selectedStockItem.name}</p>
            <p className="text-blue-600 text-sm">Current Quantity: {selectedStockItem.quantity}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Quantity
            </label>
            <input
              type="number"
              min="0"
              defaultValue={selectedStockItem.quantity}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => {
                const newQuantity = parseInt(e.target.value) || 0;
                const updatedItem = {
                  ...selectedStockItem,
                  quantity: newQuantity,
                  status: newQuantity > 10 ? "in-stock" : newQuantity > 0 ? "low-stock" : "out-of-stock"
                };
                handleNewStock(updatedItem);
                setShowQuantityModal(false);
                setSelectedStockItem(null);
              }}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default QuantityModal;


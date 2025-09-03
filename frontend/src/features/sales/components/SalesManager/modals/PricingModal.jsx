import React from "react";
import Modal from "../../../../../components/ui/modals/Modal";

const PricingModal = ({ showPricingModal, setShowPricingModal, selectedStockItem, setSelectedStockItem, handleNewStock }) => {
  if (!showPricingModal || !selectedStockItem) return null;

  return (
    <Modal
      isOpen={showPricingModal}
      onClose={() => setShowPricingModal(false)}
      size="md"
      title="Update Item Pricing"
    >
      <div className="p-6">
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Current Item</h3>
            <p className="text-blue-700">{selectedStockItem.name}</p>
            <p className="text-blue-600 text-sm">Current Price: UGX {selectedStockItem.price.toLocaleString()}</p>
            <p className="text-blue-600 text-sm">Current Cost: UGX {selectedStockItem.cost.toLocaleString()}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Selling Price (UGX)
              </label>
              <input
                type="number"
                min="0"
                defaultValue={selectedStockItem.price}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => {
                  const newPrice = parseInt(e.target.value) || 0;
                  const updatedItem = {
                    ...selectedStockItem,
                    price: newPrice
                  };
                  handleNewStock(updatedItem);
                  setShowPricingModal(false);
                  setSelectedStockItem(null);
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Cost Price (UGX)
              </label>
              <input
                type="number"
                min="0"
                defaultValue={selectedStockItem.cost}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => {
                  const newCost = parseInt(e.target.value) || 0;
                  const updatedItem = {
                    ...selectedStockItem,
                    cost: newCost
                  };
                  handleNewStock(updatedItem);
                  setShowPricingModal(false);
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

export default PricingModal;


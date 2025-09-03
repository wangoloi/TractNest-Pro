import React from "react";
import Modal from "../../../../../components/ui/modals/Modal";

const ViewDetailsModal = ({ showViewDetailsModal, setShowViewDetailsModal, selectedStockItem }) => {
  if (!showViewDetailsModal || !selectedStockItem) return null;

  return (
    <Modal
      isOpen={showViewDetailsModal}
      onClose={() => setShowViewDetailsModal(false)}
      size="lg"
      title="Item Details"
    >
      <div className="p-6">
        <div className="space-y-6">
          {/* Item Header */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              {selectedStockItem.name}
            </h3>
            <p className="text-blue-600 text-sm">
              Category: {selectedStockItem.category}
            </p>
          </div>

          {/* Item Information Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Stock Information</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity:</span>
                  <span className={`font-medium ${
                    selectedStockItem.quantity > 10
                      ? "text-green-600"
                      : selectedStockItem.quantity > 0
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}>
                    {selectedStockItem.quantity}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedStockItem.status === "in-stock"
                      ? "bg-green-100 text-green-800"
                      : selectedStockItem.status === "low-stock"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {selectedStockItem.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date Added:</span>
                  <span className="font-medium">
                    {new Date(selectedStockItem.dateAdded).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Pricing Information</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Selling Price:</span>
                  <span className="font-medium text-green-600">
                    UGX {selectedStockItem.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cost Price:</span>
                  <span className="font-medium text-blue-600">
                    UGX {selectedStockItem.cost.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Profit/Unit:</span>
                  <span className={`font-medium ${
                    selectedStockItem.price - selectedStockItem.cost >= 0 
                      ? "text-green-600" 
                      : "text-red-600"
                  }`}>
                    UGX {(selectedStockItem.price - selectedStockItem.cost).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Supplier Information */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Supplier Information</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Supplier Name:</span>
                  <span className="font-medium">
                    {selectedStockItem.supplier || "Not specified"}
                  </span>
                </div>
                {selectedStockItem.supplierPhone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">
                      {selectedStockItem.supplierPhone}
                    </span>
                  </div>
                )}
                {selectedStockItem.supplierEmail && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">
                      {selectedStockItem.supplierEmail}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Details */}
          {selectedStockItem.description && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Description</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{selectedStockItem.description}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setShowViewDetailsModal(false)}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewDetailsModal;


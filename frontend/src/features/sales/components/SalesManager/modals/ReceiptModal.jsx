import React from "react";
import Modal from "../../../../../components/ui/modals/Modal";

const ReceiptModal = ({ showReceiptModal, setShowReceiptModal, selectedSale, handlePrintReceipt }) => {
  if (!showReceiptModal || !selectedSale) return null;

  return (
    <Modal
      isOpen={showReceiptModal}
      onClose={() => setShowReceiptModal(false)}
      size="xl"
      title={`Receipt - ${selectedSale.receiptNumber}`}
    >
      <div className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Customer</p>
              <p className="font-medium">{selectedSale.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-medium">
                {new Date(selectedSale.date).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Items</p>
            <div className="space-y-2">
              {selectedSale.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>UGX {item.total.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>UGX {selectedSale.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setShowReceiptModal(false)}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Close
          </button>
          <button
            onClick={() => handlePrintReceipt(selectedSale)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Print Receipt
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ReceiptModal;


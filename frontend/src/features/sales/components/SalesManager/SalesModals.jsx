import React from "react";
import Modal from "../../../../components/ui/modals/Modal";
import SaleForm from "../../../../components/ui/forms/SaleForm";
import StockForm from "../../../../components/ui/forms/StockForm";
import ReceiptModal from "./modals/ReceiptModal";
import QuantityModal from "./modals/QuantityModal";
import PricingModal from "./modals/PricingModal";
import SupplierModal from "./modals/SupplierModal";
import ViewDetailsModal from "./modals/ViewDetailsModal";

const SalesModals = ({
  showNewSaleModal,
  setShowNewSaleModal,
  showEditSaleModal,
  setShowEditSaleModal,
  showAddStockModal,
  setShowAddStockModal,
  showEditStockModal,
  setShowEditStockModal,
  showQuantityModal,
  setShowQuantityModal,
  showPricingModal,
  setShowPricingModal,
  showSupplierModal,
  setShowSupplierModal,
  showReceiptModal,
  setShowReceiptModal,
  showViewDetailsModal,
  setShowViewDetailsModal,
  selectedSale,
  setSelectedSale,
  selectedStockItem,
  setSelectedStockItem,
  handleNewSale,
  handleNewStock,
  handlePrintReceipt,
  inventory
}) => {
  return (
    <>
      {/* New Sale Modal */}
      {showNewSaleModal && (
        <Modal
          isOpen={showNewSaleModal}
          onClose={() => setShowNewSaleModal(false)}
          size="2xl"
          title="New Sale Transaction"
        >
          <div className="p-6">
            <SaleForm
              onSave={(saleData) => {
                handleNewSale(saleData);
                setShowNewSaleModal(false);
              }}
              onCancel={() => setShowNewSaleModal(false)}
              inventory={inventory}
            />
          </div>
        </Modal>
      )}

      {/* Edit Sale Modal */}
      {showEditSaleModal && selectedSale && (
        <Modal
          isOpen={showEditSaleModal}
          onClose={() => setShowEditSaleModal(false)}
          size="2xl"
          title="Edit Sale Transaction"
        >
          <div className="p-6">
            <SaleForm
              existingSale={selectedSale}
              onSave={(saleData) => {
                handleNewSale(saleData);
                setShowEditSaleModal(false);
                setSelectedSale(null);
              }}
              onCancel={() => {
                setShowEditSaleModal(false);
                setSelectedSale(null);
              }}
              inventory={inventory}
            />
          </div>
        </Modal>
      )}

      {/* Add Stock Modal */}
      {showAddStockModal && (
        <Modal
          isOpen={showAddStockModal}
          onClose={() => setShowAddStockModal(false)}
          size="xl"
          title="Add Stock Items (Same Receipt/Supplier)"
        >
          <div className="p-6">
            <StockForm
              multiItemMode={true}
              onSave={(stockData) => {
                // Pass the entire array to handleNewStock for proper grouping
                handleNewStock(stockData);
                setShowAddStockModal(false);
              }}
              onCancel={() => setShowAddStockModal(false)}
            />
          </div>
        </Modal>
      )}

      {/* Edit Stock Modal */}
      {showEditStockModal && selectedStockItem && (
        <Modal
          isOpen={showEditStockModal}
          onClose={() => setShowEditStockModal(false)}
          size="xl"
          title="Edit Stock Item"
        >
          <div className="p-6">
            <StockForm
              existingItem={selectedStockItem}
              onSave={(stockData) => {
                handleNewStock(stockData);
                setShowEditStockModal(false);
                setSelectedStockItem(null);
              }}
              onCancel={() => {
                setShowEditStockModal(false);
                setSelectedStockItem(null);
              }}
            />
          </div>
        </Modal>
      )}

      {/* Receipt View Modal */}
      <ReceiptModal
        showReceiptModal={showReceiptModal}
        setShowReceiptModal={setShowReceiptModal}
        selectedSale={selectedSale}
        handlePrintReceipt={handlePrintReceipt}
      />

      {/* Update Quantity Modal */}
      <QuantityModal
        showQuantityModal={showQuantityModal}
        setShowQuantityModal={setShowQuantityModal}
        selectedStockItem={selectedStockItem}
        setSelectedStockItem={setSelectedStockItem}
        handleNewStock={handleNewStock}
      />

      {/* Update Pricing Modal */}
      <PricingModal
        showPricingModal={showPricingModal}
        setShowPricingModal={setShowPricingModal}
        selectedStockItem={selectedStockItem}
        setSelectedStockItem={setSelectedStockItem}
        handleNewStock={handleNewStock}
      />

      {/* Update Supplier Modal */}
      <SupplierModal
        showSupplierModal={showSupplierModal}
        setShowSupplierModal={setShowSupplierModal}
        selectedStockItem={selectedStockItem}
        setSelectedStockItem={setSelectedStockItem}
        handleNewStock={handleNewStock}
      />

      {/* View Details Modal */}
      <ViewDetailsModal
        showViewDetailsModal={showViewDetailsModal}
        setShowViewDetailsModal={setShowViewDetailsModal}
        selectedStockItem={selectedStockItem}
      />
    </>
  );
};

export default SalesModals;


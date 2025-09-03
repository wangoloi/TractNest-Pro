import React from "react";
import DataTable from "../../../../components/ui/tables/DataTable";
import { createSalesColumns } from "./tableColumns/salesColumns.jsx";
import { createInventoryColumns } from "./tableColumns/inventoryColumns.jsx";

const SalesDataTable = ({
  view,
  filteredData,
  isAdmin,
  handleNewSale,
  handleNewStock,
  handleDeleteSale,
  handleDeleteStock,
  printReceipt,
  setSelectedSale,
  setSelectedStockItem,
  setShowEditSaleModal,
  setShowEditStockModal,
  setShowQuantityModal,
  setShowPricingModal,
  setShowSupplierModal,
  setShowReceiptModal,
  setShowViewDetailsModal
}) => {
  // Handler functions
  const handleViewReceipt = (sale) => {
    console.log("View Receipt clicked:", sale);
    setSelectedSale(sale);
    setShowReceiptModal(true);
  };

  const handlePrintReceipt = (sale) => {
    printReceipt(sale);
  };

  const handleEditSale = (sale) => {
    setSelectedSale(sale);
    setShowEditSaleModal(true);
  };

  const handleDeleteSaleClick = (sale) => {
    handleDeleteSale(sale);
  };

  const handleEditStock = (item) => {
    setSelectedStockItem(item);
    setShowEditStockModal(true);
  };

  const handleDeleteStockClick = (item) => {
    handleDeleteStock(item);
  };

  const handleCopyReceiptNumber = (receiptNumber) => {
    navigator.clipboard.writeText(receiptNumber);
    // You could add a toast notification here
  };

  const handleUpdateQuantity = (item) => {
    setSelectedStockItem(item);
    setShowQuantityModal(true);
  };

  const handleUpdatePricing = (item) => {
    setSelectedStockItem(item);
    setShowPricingModal(true);
  };

  const handleUpdateSupplier = (item) => {
    setSelectedStockItem(item);
    setShowSupplierModal(true);
  };

  const handleDuplicateItem = (item) => {
    const duplicatedItem = {
      ...item,
      id: Date.now(),
      name: `${item.name} (Copy)`,
      quantity: 0,
      dateAdded: new Date().toISOString(),
    };
    handleNewStock(duplicatedItem);
  };

  const handleViewDetails = (item) => {
    console.log("View Details clicked:", item);
    setSelectedStockItem(item);
    setShowViewDetailsModal(true);
  };

  // Create columns based on view
  const salesHandlers = {
    handleViewReceipt,
    handlePrintReceipt,
    handleCopyReceiptNumber,
    handleEditSale,
    handleDeleteSaleClick
  };

  const inventoryHandlers = {
    handleViewDetails,
    handleEditStock,
    handleUpdateQuantity,
    handleUpdatePricing,
    handleUpdateSupplier,
    handleDuplicateItem,
    handleDeleteStockClick
  };

  const columns = view === "sales" 
    ? createSalesColumns(isAdmin, salesHandlers)
    : createInventoryColumns(isAdmin, inventoryHandlers);

  return (
    <DataTable
      data={filteredData}
      columns={columns}
      pageSize={10}
      showSearch={true}
      showFilters={false} // We're using custom filters above
      showExport={true}
      loading={false}
      onRowClick={
        view === "sales"
          ? (row, event) => {
              // Don't trigger row click if clicking on button dropdown
              if (event.target.closest("[data-button-dropdown]")) {
                return;
              }
              handleViewReceipt(row);
            }
          : undefined
      }
    />
  );
};

export default SalesDataTable;

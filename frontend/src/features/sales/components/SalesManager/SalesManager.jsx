import React, { useState } from "react";
import { useAuth } from "../../../../app/providers/AuthContext";
import { useSalesManager } from "../../hooks/useSalesManager";
import SalesHeader from "./SalesHeader";
import SalesStats from "./SalesStats";
import SalesFilters from "./SalesFilters";
import SalesDataTable from "./SalesDataTable";
import SalesModals from "./SalesModals";
import LowStockAlert from "./LowStockAlert";

const SalesManager = () => {
  const { currentUser } = useAuth();
  const {
    sales,
    inventory,
    loading,
    view,
    setView,
    stats,
    handleNewSale,
    handleNewStock,
    handleDeleteSale,
    handleDeleteStock,
    printReceipt,
  } = useSalesManager();

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'admin';
  console.log('Current user:', currentUser);
  console.log('Is admin:', isAdmin);

  // Modal states
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [showEditSaleModal, setShowEditSaleModal] = useState(false);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showEditStockModal, setShowEditStockModal] = useState(false);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showViewDetailsModal, setShowViewDetailsModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [selectedStockItem, setSelectedStockItem] = useState(null);
  const [showLowStockAlert, setShowLowStockAlert] = useState(true);

  // Filter states
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  // Get low stock items (quantity <= 5)
  const lowStockItems = inventory.filter((item) => item.quantity <= 5);

  // Filter data based on selected filters
  const getFilteredData = () => {
    let filteredData = view === "sales" ? sales : inventory;

    if (view === "sales" && statusFilter) {
      filteredData = filteredData.filter(
        (sale) => sale.status === statusFilter
      );
    }

    if (view === "inventory") {
      if (categoryFilter) {
        filteredData = filteredData.filter(
          (item) => item.category === categoryFilter
        );
      }
      if (inventoryStatusFilter) {
        filteredData = filteredData.filter(
          (item) => item.status === inventoryStatusFilter
        );
      }
    }

    // Apply stat card filters
    if (activeFilter === "total-items" && view === "inventory") {
      filteredData = inventory; // Show all items
    } else if (activeFilter === "low-stock" && view === "inventory") {
      filteredData = lowStockItems; // Show only low stock items
    }

    return filteredData;
  };

  const filteredData = getFilteredData();

  // Clear all filters
  const clearFilters = () => {
    setActiveFilter("");
    setStatusFilter("");
    setCategoryFilter("");
    setInventoryStatusFilter("");
  };

  // Handle stat card filter clicks
  const handleStatCardClick = (filterType) => {
    if (activeFilter === filterType) {
      setActiveFilter(""); // Clear filter if already active
    } else {
      setActiveFilter(filterType);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <SalesHeader 
        isAdmin={isAdmin}
        setShowNewSaleModal={setShowNewSaleModal}
        setShowAddStockModal={setShowAddStockModal}
      />

      {/* Statistics Cards */}
      <SalesStats 
        stats={stats}
        lowStockItems={lowStockItems}
        activeFilter={activeFilter}
        handleStatCardClick={handleStatCardClick}
      />

      {/* Low Stock Alert */}
      <LowStockAlert 
        showLowStockAlert={showLowStockAlert}
        lowStockItems={lowStockItems}
        setView={setView}
        setShowLowStockAlert={setShowLowStockAlert}
      />

      {/* View Toggle */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setView("sales");
              setActiveFilter(""); // Clear stat card filters when switching to sales
            }}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              view === "sales"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
            Sales History
          </button>
          <button
            onClick={() => {
              setView("inventory");
              setActiveFilter(""); // Clear stat card filters when switching to inventory
            }}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              view === "inventory"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Inventory
          </button>
        </div>
      </div>

      {/* Filters */}
      <SalesFilters 
        view={view}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        inventoryStatusFilter={inventoryStatusFilter}
        setInventoryStatusFilter={setInventoryStatusFilter}
        activeFilter={activeFilter}
        clearFilters={clearFilters}
        inventory={inventory}
      />

      {/* Data Table */}
      <SalesDataTable 
        view={view}
        filteredData={filteredData}
        isAdmin={isAdmin}
        handleNewSale={handleNewSale}
        handleNewStock={handleNewStock}
        handleDeleteSale={handleDeleteSale}
        handleDeleteStock={handleDeleteStock}
        printReceipt={printReceipt}
        setSelectedSale={setSelectedSale}
        setSelectedStockItem={setSelectedStockItem}
        setShowEditSaleModal={setShowEditSaleModal}
        setShowEditStockModal={setShowEditStockModal}
        setShowQuantityModal={setShowQuantityModal}
        setShowPricingModal={setShowPricingModal}
        setShowSupplierModal={setShowSupplierModal}
        setShowReceiptModal={setShowReceiptModal}
        setShowViewDetailsModal={setShowViewDetailsModal}
      />

      {/* Modals */}
      <SalesModals 
        showNewSaleModal={showNewSaleModal}
        setShowNewSaleModal={setShowNewSaleModal}
        showEditSaleModal={showEditSaleModal}
        setShowEditSaleModal={setShowEditSaleModal}
        showAddStockModal={showAddStockModal}
        setShowAddStockModal={setShowAddStockModal}
        showEditStockModal={showEditStockModal}
        setShowEditStockModal={setShowEditStockModal}
        showQuantityModal={showQuantityModal}
        setShowQuantityModal={setShowQuantityModal}
        showPricingModal={showPricingModal}
        setShowPricingModal={setShowPricingModal}
        showSupplierModal={showSupplierModal}
        setShowSupplierModal={setShowSupplierModal}
        showReceiptModal={showReceiptModal}
        setShowReceiptModal={setShowReceiptModal}
        showViewDetailsModal={showViewDetailsModal}
        setShowViewDetailsModal={setShowViewDetailsModal}
        selectedSale={selectedSale}
        setSelectedSale={setSelectedSale}
        selectedStockItem={selectedStockItem}
        setSelectedStockItem={setSelectedStockItem}
        handleNewSale={handleNewSale}
        handleNewStock={handleNewStock}
        handlePrintReceipt={printReceipt}
        inventory={inventory}
      />
    </div>
  );
};

export default SalesManager;







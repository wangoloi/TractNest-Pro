import React, { useState } from "react";
import {
  ShoppingCart,
  Package,
  Plus,
  Eye,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  MoreHorizontal,
} from "lucide-react";
import Modal from "../../../components/ui/modals/Modal";
import DataTable from "../../../components/ui/tables/DataTable";
import Dropdown from "../../../components/ui/forms/Dropdown";
import ButtonDropdown from "../../../components/ui/forms/ButtonDropdown";
import { useUserSalesManager } from "../hooks/business/useUserSalesManager";

const UserSalesManager = () => {
  const { sales, inventory, loading, stats, printReceipt } =
    useUserSalesManager();

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState("");

  const handleViewReceipt = (sale) => {
    setSelectedSale(sale);
    setShowReceiptModal(true);
  };

  const handlePrintReceipt = (sale) => {
    printReceipt(sale);
  };

  const handleCopyReceiptNumber = (receiptNumber) => {
    navigator.clipboard.writeText(receiptNumber);
    // You could add a toast notification here
  };

  // Get low stock items (quantity <= 5)
  const lowStockItems = inventory.filter((item) => item.quantity <= 5);

  // Filter data based on selected filters
  const getFilteredData = () => {
    let filteredData = sales;

    if (statusFilter) {
      filteredData = filteredData.filter(
        (sale) => sale.status === statusFilter
      );
    }

    return filteredData;
  };

  const filteredData = getFilteredData();

  // Filter options
  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "completed", label: "Completed" },
    { value: "pending", label: "Pending" },
    { value: "cancelled", label: "Cancelled" },
  ];

  // Helper function to format items for display
  const formatItemsForDisplay = (items) => {
    if (!items || items.length === 0) return "No items";

    if (items.length === 1) {
      return `${items[0].name} (${items[0].quantity})`;
    }

    if (items.length === 2) {
      return `${items[0].name} (${items[0].quantity}), ${items[1].name} (${items[1].quantity})`;
    }

    return `${items[0].name} (${items[0].quantity}), ${items[1].name} (${
      items[1].quantity
    }) +${items.length - 2} more`;
  };

  // Sales table columns configuration
  const salesColumns = [
    {
      key: "date",
      header: "Date",
      accessor: (sale) => new Date(sale.date).toLocaleDateString(),
      sortable: true,
    },
    {
      key: "receiptNumber",
      header: "Receipt #",
      accessor: (sale) => sale.receiptNumber,
      sortable: true,
    },
    {
      key: "customerName",
      header: "Customer",
      accessor: (sale) => sale.customerName,
      sortable: true,
    },
    {
      key: "items",
      header: "Items",
      accessor: (sale) => formatItemsForDisplay(sale.items),
      render: (sale) => (
        <div className="max-w-xs">
          <div className="text-sm text-gray-900">
            {formatItemsForDisplay(sale.items)}
          </div>
          {sale.items.length > 2 && (
            <div className="text-xs text-gray-500 mt-1">
              Click to view all {sale.items.length} items
            </div>
          )}
        </div>
      ),
      sortable: false,
    },
    {
      key: "total",
      header: "Total",
      accessor: (sale) => `UGX ${sale.total.toLocaleString()}`,
      sortable: true,
    },
    {
      key: "profit",
      header: "Profit",
      accessor: (sale) => `UGX ${sale.profit.toLocaleString()}`,
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      accessor: (sale) => sale.status,
      render: (sale) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            sale.status === "completed"
              ? "bg-green-100 text-green-800"
              : sale.status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {sale.status}
        </span>
      ),
      sortable: true,
    },
    {
      key: "actions",
      header: "Actions",
      render: (sale) => {
        const options = [
          {
            label: "View Receipt",
            icon: Eye,
            onClick: () => handleViewReceipt(sale),
          },
          {
            label: "Print Receipt",
            icon: TrendingUp,
            onClick: () => handlePrintReceipt(sale),
          },
          {
            label: "Copy Receipt Number",
            icon: Package,
            onClick: () => handleCopyReceiptNumber(sale.receiptNumber),
          },
        ];

        return (
          <ButtonDropdown
            buttonContent={<MoreHorizontal size={16} />}
            options={options}
            buttonClassName="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          />
        );
      },
      sortable: false,
    },
  ];

  // Inventory table columns configuration
  const inventoryColumns = [
    {
      key: "name",
      header: "Item Name",
      accessor: (item) => item.name,
      sortable: true,
    },
    {
      key: "category",
      header: "Category",
      accessor: (item) => item.category,
      sortable: true,
    },
    {
      key: "quantity",
      header: "Quantity",
      accessor: (item) => item.quantity,
      render: (item) => (
        <span
          className={`font-medium ${
            item.quantity > 10
              ? "text-green-600"
              : item.quantity > 0
              ? "text-yellow-600"
              : "text-red-600"
          }`}
        >
          {item.quantity}
        </span>
      ),
      sortable: true,
    },
    {
      key: "price",
      header: "Selling Price",
      accessor: (item) => `UGX ${item.price.toLocaleString()}`,
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      accessor: (item) => item.status,
      render: (item) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.status === "in-stock"
              ? "bg-green-100 text-green-800"
              : item.status === "low-stock"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {item.status}
        </span>
      ),
      sortable: true,
    },
    {
      key: "supplier",
      header: "Supplier",
      accessor: (item) => item.supplier,
      sortable: true,
    },
  ];

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Sales & Inventory Overview
          </h1>
          <p className="text-gray-600">
            View your sales history and inventory status
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Sales</p>
              <p className="text-2xl font-bold text-gray-900">
                UGX {stats.todaySales.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Available Items
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.availableItems}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Package size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Low Stock Items
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {lowStockItems.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <AlertTriangle size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-yellow-600" size={20} />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Low Stock Alert
              </h3>
              <p className="text-sm text-yellow-700">
                {lowStockItems.length} items are running low on stock
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <Dropdown
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Select status"
              searchable={false}
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredData}
        columns={salesColumns}
        pageSize={10}
        showSearch={true}
        showFilters={false} // We're using custom filters above
        showExport={true}
        loading={loading}
        onRowClick={(row, event) => {
          // Don't trigger row click if clicking on button dropdown
          if (event.target.closest("[data-button-dropdown]")) {
            return;
          }
          handleViewReceipt(row);
        }}
      />

      {/* Receipt View Modal */}
      {showReceiptModal && selectedSale && (
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
      )}
    </div>
  );
};

export default UserSalesManager;

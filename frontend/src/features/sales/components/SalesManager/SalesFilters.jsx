import React from "react";
import Dropdown from "../../../../components/ui/forms/Dropdown";

const SalesFilters = ({
  view,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  inventoryStatusFilter,
  setInventoryStatusFilter,
  activeFilter,
  clearFilters,
  inventory
}) => {
  // Filter options
  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "completed", label: "Completed" },
    { value: "pending", label: "Pending" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const categoryOptions = [
    { value: "", label: "All Categories" },
    ...Array.from(new Set(inventory.map((item) => item.category))).map(
      (category) => ({
        value: category,
        label: category,
      })
    ),
  ];

  const inventoryStatusOptions = [
    { value: "", label: "All Statuses" },
    { value: "in-stock", label: "In Stock" },
    { value: "low-stock", label: "Low Stock" },
    { value: "out-of-stock", label: "Out of Stock" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {(activeFilter || statusFilter || categoryFilter || inventoryStatusFilter) && (
          <div className="flex items-center gap-2">
            {(activeFilter || statusFilter || categoryFilter || inventoryStatusFilter) && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Filter Active
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-2 py-1 rounded"
            >
              Clear All
            </button>
          </div>
        )}
      </div>
      <div className="flex gap-4">
        {view === "sales" && (
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
        )}
        {view === "inventory" && (
          <>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Category
              </label>
              <Dropdown
                options={categoryOptions}
                value={categoryFilter}
                onChange={setCategoryFilter}
                placeholder="Select category"
                searchable={true}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <Dropdown
                options={inventoryStatusOptions}
                value={inventoryStatusFilter}
                onChange={setInventoryStatusFilter}
                placeholder="Select status"
                searchable={false}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SalesFilters;



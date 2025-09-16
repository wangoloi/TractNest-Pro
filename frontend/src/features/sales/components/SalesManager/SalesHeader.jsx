import React from "react";
import { Plus, Package } from "lucide-react";

const SalesHeader = ({ isAdmin, setShowNewSaleModal, setShowAddStockModal }) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Sales & Inventory Management
        </h1>
        <p className="text-gray-600">Complete business management system</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => setShowNewSaleModal(true)}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          New Sale
        </button>
        {/* Debug: Always show Add Stock button for now */}
        <button
          onClick={() => setShowAddStockModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Package size={16} />
          Add Stock (Debug)
        </button>
        {isAdmin && (
          <button
            onClick={() => setShowAddStockModal(true)}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
          >
            <Package size={16} />
            Add Stock (Admin)
          </button>
        )}
      </div>
    </div>
  );
};

export default SalesHeader;









import React from "react";
import { AlertTriangle } from "lucide-react";

const LowStockAlert = ({ showLowStockAlert, lowStockItems, setView, setShowLowStockAlert }) => {
  if (!showLowStockAlert || lowStockItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
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
        <div className="flex gap-2">
          <button
            onClick={() => setView("inventory")}
            className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200"
          >
            View Inventory
          </button>
          <button
            onClick={() => setShowLowStockAlert(false)}
            className="px-3 py-1 text-sm text-yellow-600 hover:bg-yellow-100 rounded-md"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default LowStockAlert;



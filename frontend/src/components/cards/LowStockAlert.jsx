import React from 'react';
import { AlertTriangle, Package, X } from 'lucide-react';

const LowStockAlert = ({ lowStockItems, onDismiss, onViewInventory }) => {
  if (!lowStockItems || lowStockItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg shadow-sm">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-6 w-6 text-yellow-400" />
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-yellow-800">
              Low Stock Alert ({lowStockItems.length} items)
            </h3>
            <button
              onClick={onDismiss}
              className="text-yellow-400 hover:text-yellow-600"
            >
              <X size={16} />
            </button>
          </div>
          <div className="mt-2 text-sm text-yellow-700">
            <p>The following items are running low on stock:</p>
            <div className="mt-2 space-y-1">
              {lowStockItems.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <Package size={14} className="text-yellow-500" />
                  <span className="font-medium">{item.name}</span>
                  <span className="text-yellow-600">- {item.quantity} remaining</span>
                </div>
              ))}
              {lowStockItems.length > 3 && (
                <p className="text-yellow-600 font-medium">
                  +{lowStockItems.length - 3} more items...
                </p>
              )}
            </div>
          </div>
          <div className="mt-3">
            <button
              onClick={onViewInventory}
              className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md text-sm font-medium hover:bg-yellow-200 transition-colors"
            >
              View Inventory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LowStockAlert;

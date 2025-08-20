import React from 'react';

const RemainingStockSummary = ({ stockItems, onItemSelect }) => {
  // Helper function to normalize item names
  const normalizeName = (name) => {
    const lowerName = name.toLowerCase().trim();
    if (lowerName.endsWith('es')) {
      // Remove 'es' for words like 'boxes', 'buses'
      return lowerName.slice(0, -2);
    } else if (lowerName.endsWith('s')) {
      // Remove 's' for words like 'apples', 'bananas'
      return lowerName.slice(0, -1);
    }
    return lowerName;
  };

  // Merge items by name, ignoring case and plural/singular variations
  const mergedItems = () => {
    const itemMap = {};
    const nameMap = {};

    if (stockItems && stockItems.length > 0) {
      stockItems.forEach((item) => {
        // Only include items with quantity > 0
        if (item.qty > 0) {
          const normalized = normalizeName(item.name);
          if (itemMap[normalized]) {
            itemMap[normalized].qty += item.qty;
            itemMap[normalized].totalAmount += item.amount;
            if (!nameMap[normalized]) {
              nameMap[normalized] = item.name;
            }
          } else {
            itemMap[normalized] = {
              name: item.name,
              qty: item.qty,
              totalAmount: item.amount,
            };
            nameMap[normalized] = item.name;
          }
        }
      });
    }

    return Object.keys(itemMap).map((key) => ({
      name: nameMap[key],
      qty: itemMap[key].qty,
      totalAmount: itemMap[key].totalAmount,
    }));
  };

  const remainingItems = mergedItems();

  const handleItemSelect = (itemName) => {
    if (onItemSelect) {
      onItemSelect(itemName);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-semibold mb-4">Remaining Stock Items</h3>
      {remainingItems.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {remainingItems.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.qty}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleItemSelect(item.name)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Select
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-500">No items in stock</p>
        </div>
      )}
    </div>
  );
};

export default RemainingStockSummary;

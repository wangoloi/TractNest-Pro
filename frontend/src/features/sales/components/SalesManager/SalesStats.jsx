import React from "react";
import { TrendingUp, DollarSign, Package, AlertTriangle, X } from "lucide-react";
import { formatAppCurrency } from "../../../../lib/utils/formatNumber";

const SalesStats = ({ stats, lowStockItems, activeFilter, handleStatCardClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Sales</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatAppCurrency(stats.totalSales)}
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
            <p className="text-sm font-medium text-gray-600">Total Profit</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatAppCurrency(stats.totalProfit)}
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <DollarSign size={24} className="text-blue-600" />
          </div>
        </div>
      </div>

      <button
        onClick={() => handleStatCardClick("total-items")}
        className={`bg-white p-6 rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md cursor-pointer relative ${
          activeFilter === "total-items" 
            ? "border-purple-300 bg-purple-50" 
            : "border-gray-100"
        }`}
      >
        {activeFilter === "total-items" && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
            <X size={12} className="text-white" />
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Items</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalItems}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            activeFilter === "total-items" 
              ? "bg-purple-200" 
              : "bg-purple-100"
          }`}>
            <Package size={24} className="text-purple-600" />
          </div>
        </div>
      </button>

      <button
        onClick={() => handleStatCardClick("low-stock")}
        className={`bg-white p-6 rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md cursor-pointer relative ${
          activeFilter === "low-stock" 
            ? "border-yellow-300 bg-yellow-50" 
            : "border-gray-100"
        }`}
      >
        {activeFilter === "low-stock" && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center">
            <X size={12} className="text-white" />
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Low Stock Items
            </p>
            <p className="text-2xl font-bold text-yellow-600">
              {lowStockItems.length}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            activeFilter === "low-stock" 
              ? "bg-yellow-200" 
              : "bg-yellow-100"
          }`}>
            <AlertTriangle size={24} className="text-yellow-600" />
          </div>
        </div>
      </button>
    </div>
  );
};

export default SalesStats;









import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Package, 
  Plus,
  AlertTriangle,
  Eye,
  TrendingUp
} from 'lucide-react';
import Modal from '../../shared/Modal';
import SaleForm from '../../forms/SaleForm';
import InventoryInspector from '../inventory/InventoryInspector';
import DailyReport from '../reports/DailyReport';
import StatementGenerator from '../reports/StatementGenerator';
import LowStockAlert from '../../cards/LowStockAlert';
import { useUserSalesManager } from '../../../hooks/business/useUserSalesManager';

const UserSalesManager = () => {
  const {
    sales,
    inventory,
    loading,
    stats,
    handleNewSale,
    lowStockItems,
    todaySales
  } = useUserSalesManager();

  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showDailyReportModal, setShowDailyReportModal] = useState(false);
  const [showStatementModal, setShowStatementModal] = useState(false);

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
          <h1 className="text-3xl font-bold text-gray-900">Sales & Inventory</h1>
          <p className="text-gray-600">Make sales and check inventory status</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowNewSaleModal(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            New Sale
          </button>
          <button
            onClick={() => setShowInventoryModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Eye size={16} />
            View Inventory
          </button>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <LowStockAlert items={lowStockItems} />
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Sales</p>
              <p className="text-2xl font-bold text-gray-900">UGX {stats.todaySales.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available Items</p>
              <p className="text-2xl font-bold text-gray-900">{stats.availableItems}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Package size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-yellow-600">{lowStockItems.length}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <AlertTriangle size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Report Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Daily Report</h3>
            <TrendingUp size={20} className="text-blue-600" />
          </div>
          <p className="text-gray-600 mb-4">View today's sales summary and performance metrics</p>
          <button
            onClick={() => setShowDailyReportModal(true)}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            View Daily Report
          </button>
        </div>

        {/* Statement Generator Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Generate Statement</h3>
            <ShoppingCart size={20} className="text-green-600" />
          </div>
          <p className="text-gray-600 mb-4">Create detailed sales statements for specific dates</p>
          <button
            onClick={() => setShowStatementModal(true)}
            className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Generate Statement
          </button>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Sales</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sales.slice(0, 5).map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(sale.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {sale.customerName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {sale.items.map(item => `${item.name} (${item.quantity})`).join(', ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    UGX {sale.total.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Sale Modal */}
      {showNewSaleModal && (
        <Modal isOpen={showNewSaleModal} onClose={() => setShowNewSaleModal(false)} size="lg">
          <div className="bg-white rounded-xl shadow-lg max-w-6xl mx-auto">
            <div className="bg-blue-500 p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold text-white text-center">
                NEW SALE TRANSACTION
              </h2>
            </div>
            <SaleForm
              onSave={(saleData) => {
                handleNewSale(saleData);
                setShowNewSaleModal(false);
              }}
              onCancel={() => setShowNewSaleModal(false)}
            />
          </div>
        </Modal>
      )}

      {/* Inventory Inspector Modal */}
      {showInventoryModal && (
        <Modal isOpen={showInventoryModal} onClose={() => setShowInventoryModal(false)} size="xl">
          <InventoryInspector 
            inventory={inventory}
            onClose={() => setShowInventoryModal(false)}
          />
        </Modal>
      )}

      {/* Daily Report Modal */}
      {showDailyReportModal && (
        <Modal isOpen={showDailyReportModal} onClose={() => setShowDailyReportModal(false)} size="xl">
          <DailyReport 
            sales={todaySales}
            onClose={() => setShowDailyReportModal(false)}
          />
        </Modal>
      )}

      {/* Statement Generator Modal */}
      {showStatementModal && (
        <Modal isOpen={showStatementModal} onClose={() => setShowStatementModal(false)} size="xl">
          <StatementGenerator 
            sales={sales}
            onClose={() => setShowStatementModal(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default UserSalesManager;

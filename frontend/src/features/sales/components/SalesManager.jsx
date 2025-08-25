import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Package, 
  Plus,
  FileText,
  BarChart3,
  Eye
} from 'lucide-react';
import Modal from '../../../components/ui/modals/Modal';
import StockForm from '../../../components/ui/forms/StockForm';
import DailyReport from '../../reports/components/DailyReport';
import InventoryInspector from '../../inventory/components/InventoryInspector';
import StatementGenerator from '../../reports/components/StatementGenerator';
// import { useSalesManager } from '../hooks/useSalesManager';

const SalesManager = () => {
  const {
    sales,
    inventory,
    loading,
    view,
    setView,
    stats,
    handleNewSale,
    handleNewStock,
    printReceipt
  } = useSalesManager();

  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showLowStockAlert, setShowLowStockAlert] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'daily-report', 'inventory-inspector', 'statement-generator'

  const handleViewReceipt = (sale) => {
    setSelectedSale(sale);
    setShowReceiptModal(true);
  };

  const handlePrintReceipt = (sale) => {
    printReceipt(sale);
  };

  // Get low stock items (quantity <= 5)
  const lowStockItems = inventory.filter(item => item.quantity <= 5);

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
          <h1 className="text-3xl font-bold text-gray-900">Sales & Inventory Management</h1>
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
          <button
            onClick={() => setShowAddStockModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Package size={16} />
            Add Stock
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
              currentView === 'dashboard' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BarChart3 size={16} />
            Dashboard
          </button>
          <button
            onClick={() => setCurrentView('daily-report')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
              currentView === 'daily-report' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FileText size={16} />
            Daily Report
          </button>
          <button
            onClick={() => setCurrentView('inventory-inspector')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
              currentView === 'inventory-inspector' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Eye size={16} />
            Inventory Inspector
          </button>
          <button
            onClick={() => setCurrentView('statement-generator')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
              currentView === 'statement-generator' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FileText size={16} />
            Statement Generator
          </button>
        </div>
      </div>

      {/* Low Stock Alert */}
      {showLowStockAlert && lowStockItems.length > 0 && (
        <LowStockAlert
          lowStockItems={lowStockItems}
          onDismiss={() => setShowLowStockAlert(false)}
          onViewInventory={() => setCurrentView('inventory-inspector')}
        />
      )}

      {/* Content based on current view */}
      {currentView === 'dashboard' && (
        <>
          {/* Statistics */}
          <StatsCards stats={stats} />

          {/* View Toggle */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex gap-2">
              <button
                onClick={() => setView('sales')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  view === 'sales' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ShoppingCart size={16} />
                Sales History
              </button>
              <button
                onClick={() => setView('inventory')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  view === 'inventory' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Package size={16} />
                Inventory
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {view === 'sales' ? (
              <SalesTable 
                sales={sales}
                onViewReceipt={handleViewReceipt}
                onPrintReceipt={handlePrintReceipt}
              />
            ) : (
              <InventoryTable inventory={inventory} />
            )}
          </div>
        </>
      )}

      {currentView === 'daily-report' && (
        <DailyReport sales={sales} inventory={inventory} />
      )}

      {currentView === 'inventory-inspector' && (
        <InventoryInspector inventory={inventory} sales={sales} />
      )}

      {currentView === 'statement-generator' && (
        <StatementGenerator sales={sales} inventory={inventory} />
      )}

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

      {/* Add Stock Modal */}
      {showAddStockModal && (
        <Modal isOpen={showAddStockModal} onClose={() => setShowAddStockModal(false)} size="lg">
          <div className="bg-white rounded-xl shadow-lg max-w-6xl mx-auto">
            <div className="bg-blue-500 p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold text-white text-center">
                ADD NEW STOCK
              </h2>
            </div>
            <StockForm
              onSave={(stockData) => {
                handleNewStock(stockData);
                setShowAddStockModal(false);
              }}
              onCancel={() => setShowAddStockModal(false)}
            />
          </div>
        </Modal>
      )}

      {/* Receipt View Modal */}
      {showReceiptModal && selectedSale && (
        <Modal isOpen={showReceiptModal} onClose={() => setShowReceiptModal(false)} size="xl">
          <ReceiptModal
            sale={selectedSale}
            onClose={() => setShowReceiptModal(false)}
            onPrint={handlePrintReceipt}
          />
        </Modal>
      )}
    </div>
  );
};

export default SalesManager;

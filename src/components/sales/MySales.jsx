import React, { useState } from 'react';
import { Search, Printer, Edit, Trash2 } from 'lucide-react';
import RemainingStockSummary from '../stocking/RemainingStockSummary';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatNumber } from '../../utils/formatNumber';

const MySales = ({ salesRecords, stockItems }) => {
  const [selectedSale, setSelectedSale] = useState(null);
  const [showSalesSummary, setShowSalesSummary] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editItemIndex, setEditItemIndex] = useState(null);
  const [editItem, setEditItem] = useState({});
  const [showStockSummary, setShowStockSummary] = useState(false);

  const sortedSales = salesRecords.slice().sort((a, b) => new Date(b.date) - new Date(a.date));


  const handleDoubleClick = (sale) => {
    setSelectedSale(sale);
  };

  const handleBack = () => {
    setSelectedSale(null);
    setIsEditing(false);
    setEditItemIndex(null);
  };

  const toggleSalesSummary = () => {
    setShowSalesSummary(!showSalesSummary);
  };

  // Filter sales based on search term
  const filteredSales = sortedSales.filter(sale => 
    sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate summary data
  const totalSalesAmount = salesRecords.reduce((sum, sale) => sum + sale.total, 0);
  const totalSalesProfit = salesRecords.reduce((sum, sale) => sum + sale.profit, 0);

  // Handle print functionality
  const handlePrint = () => {
    if (!selectedSale) return;
    
    // Create a new jsPDF instance
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Sales Invoice', 105, 20, { align: 'center' });
    
    // Add invoice details
    doc.setFontSize(12);
    doc.text(`Invoice Number: ${selectedSale.id}`, 20, 35);
    doc.text(`Date: ${new Date(selectedSale.date).toLocaleDateString()}`, 20, 45);
    doc.text(`Customer: ${selectedSale.customer}`, 20, 55);
    
    // Add items table
    if (selectedSale.items && selectedSale.items.length > 0) {
      const itemsData = selectedSale.items.map(item => [
        item.name,
        item.qty.toString(),
        `UGX ${formatNumber(item.price)}`,
        `UGX ${formatNumber(item.amount)}`,
        `UGX ${formatNumber(item.profit)}`
      ]);
      
      autoTable(doc, {
        startY: 65,
        head: [['Item Name', 'Quantity', 'Unit Price', 'Amount', 'Profit']],
        body: itemsData,
        theme: 'grid',
        styles: {
          fontSize: 10
        },
        headStyles: {
          fillColor: [72, 187, 120] // Green color
        }
      });
      
      // Add totals
      const finalY = doc.lastAutoTable.finalY || 65;
      doc.setFontSize(14);
      doc.text(`Total: UGX ${formatNumber(selectedSale.total)}`, 150, finalY + 15);
      doc.text(`Profit: UGX ${formatNumber(selectedSale.profit)}`, 150, finalY + 25);
    } else {
      doc.text('No items in this sale.', 20, 75);
    }
    
    // Save the PDF
    doc.save(`invoice-${selectedSale.id}.pdf`);
  };

  // Handle edit item
  const handleEditItem = (item, index) => {
    setEditItemIndex(index);
    setEditItem({ ...item });
  };

  // Handle save edited item
  const handleSaveEdit = () => {
    // In a real app, this would update the item in state
    // For now, we'll just reset the edit state
    setEditItemIndex(null);
    setEditItem({});
  };

  // Handle delete item
  const handleDeleteItem = (index) => {
    // In a real app, this would delete the item from state
    // For now, we'll just show an alert
    alert(`Item at index ${index} would be deleted in a real implementation`);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditItemIndex(null);
    setEditItem({});
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      {!selectedSale ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">My Sales</h2>
            <div className="flex gap-2">
              <button
                onClick={toggleSalesSummary}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {showSalesSummary ? 'Hide Sales Summary' : 'Show Sales Summary'}
              </button>
              <button
                onClick={() => setShowStockSummary(!showStockSummary)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                {showStockSummary ? 'Hide Stock Summary' : 'Show Stock Summary'}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-gray-400" size={20} />
              </div>
              <input
                type="text"
                placeholder="Search sales by customer or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md input"
              />
            </div>
          </div>

          {showSalesSummary && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Sales Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-gray-500">Total Sales Amount</p>
                  <p className="text-xl font-bold text-blue-600">UGX {formatNumber(totalSalesAmount)}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-md">
                  <p className="text-sm text-gray-500">Total Sales Profit</p>
                  <p className="text-xl font-bold text-green-600">UGX {formatNumber(totalSalesProfit)}</p>
                </div>
              </div>
            </div>
          )}

          {showStockSummary && stockItems && (
            <div className="mb-6">
              <RemainingStockSummary stockItems={stockItems} />
            </div>
          )}

          <div className="space-y-4">
            {filteredSales.length > 0 ? (
              filteredSales.map((sale) => (
                <div
                  key={sale.id}
                  className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  onDoubleClick={() => handleDoubleClick(sale)}
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{new Date(sale.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Customer</p>
                      <p className="font-medium">{sale.customer}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="font-medium">UGX {formatNumber(sale.total)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Profit</p>
                      <p className="font-medium">UGX {formatNumber(sale.profit)}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No sales records available.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        // Sale detail view
        <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200 print:p-0 print:bg-white print:border-0">
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Back to Sales
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
            >
              <Printer size={16} className="mr-2" />
              Print Invoice
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                isEditing 
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                  : 'bg-yellow-400 hover:bg-yellow-500 text-gray-800'
              }`}
            >
              {isEditing ? 'Cancel Edit' : 'Edit Sale'}
            </button>
          </div>
          
          <h3 className="text-xl font-semibold mb-4">Sale Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">{new Date(selectedSale.date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Invoice Number</p>
              <p className="font-medium">{selectedSale.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Customer</p>
              <p className="font-medium">{selectedSale.customer}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="font-medium text-lg">UGX {formatNumber(selectedSale.total)}</p>
            </div>
          </div>
          
          <h4 className="text-lg font-semibold mb-3">Items Sold</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                  {isEditing && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedSale.items.map((item, index) => (
                  <tr key={index}>
                    {editItemIndex === index ? (
                      <>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <input
                            type="text"
                            value={editItem.name}
                            onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md input"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <input
                            type="number"
                            value={editItem.qty}
                            onChange={(e) => setEditItem({ ...editItem, qty: parseInt(e.target.value) || 0 })}
                            className="w-full p-2 border border-gray-300 rounded-md input"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <input
                            type="number"
                            value={editItem.price}
                            onChange={(e) => setEditItem({ ...editItem, price: parseFloat(e.target.value) || 0 })}
                            className="w-full p-2 border border-gray-300 rounded-md input"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">UGX {formatNumber(editItem.qty * editItem.price)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">UGX {formatNumber((editItem.qty * editItem.price) * 0.2)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button 
                            onClick={handleSaveEdit}
                            className="mr-2 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                          >
                            Save
                          </button>
                          <button 
                            onClick={handleCancelEdit}
                            className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.qty}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">UGX {formatNumber(item.price)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">UGX {formatNumber(item.amount)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">UGX {formatNumber(item.profit)}</td>
                        {isEditing && (
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <button 
                              onClick={() => handleEditItem(item, index)}
                              className="mr-2 px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteItem(index)}
                              className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        )}
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Profit</p>
                <p className="text-lg font-bold text-green-600">UGX {formatNumber(selectedSale.profit)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-lg font-bold text-blue-600">UGX {formatNumber(selectedSale.total)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySales;
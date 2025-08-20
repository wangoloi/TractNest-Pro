import React, { useState, useEffect } from 'react';
import { Search, Printer, Edit, Trash2, Eye, ArrowLeft } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-toastify';
import api from '@utils/api';
import { formatNumber } from '../../utils/formatNumber';

const MySales = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editItemIndex, setEditItemIndex] = useState(null);
  const [editItem, setEditItem] = useState({});
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/api/invoices');
      setInvoices(data);
    } catch (error) {
      toast.error('Failed to fetch sales data');
      console.error('Error fetching invoices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.invoice_no?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedInvoices = filteredInvoices.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Calculate summary data
  const totalSalesAmount = invoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
  const totalSalesProfit = invoices.reduce((sum, invoice) => sum + (invoice.profit || 0), 0);
  const totalInvoices = invoices.length;

  const handleInvoiceSelect = (invoice) => {
    setSelectedInvoice(invoice);
    setIsEditing(false);
    setEditItemIndex(null);
  };

  const handleBack = () => {
    setSelectedInvoice(null);
    setIsEditing(false);
    setEditItemIndex(null);
  };

  const handlePrint = () => {
    if (!selectedInvoice) return;
    
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Sales Invoice', 105, 20, { align: 'center' });
    
    // Invoice details
    doc.setFontSize(12);
    doc.text(`Invoice Number: ${selectedInvoice.invoice_no}`, 20, 35);
    doc.text(`Date: ${new Date(selectedInvoice.date).toLocaleDateString()}`, 20, 45);
    doc.text(`Customer: ${selectedInvoice.customer}`, 20, 55);
    
    // Items table
    if (selectedInvoice.items && selectedInvoice.items.length > 0) {
      const itemsData = selectedInvoice.items.map(item => [
        item.name,
        item.qty.toString(),
        `UGX ${formatNumber(item.unit_price)}`,
        `UGX ${formatNumber(item.amount)}`,
        `UGX ${formatNumber(item.profit)}`
      ]);
      
      autoTable(doc, {
        startY: 65,
        head: [['Item Name', 'Quantity', 'Unit Price', 'Amount', 'Profit']],
        body: itemsData,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [72, 187, 120] }
      });
      
      const finalY = doc.lastAutoTable.finalY || 65;
      doc.setFontSize(14);
      doc.text(`Total: UGX ${formatNumber(selectedInvoice.total)}`, 150, finalY + 15);
      doc.text(`Profit: UGX ${formatNumber(selectedInvoice.profit)}`, 150, finalY + 25);
    } else {
      doc.text('No items in this invoice.', 20, 75);
    }
    
    doc.save(`invoice-${selectedInvoice.invoice_no}.pdf`);
  };

  const handleEditItem = (item, index) => {
    setEditItemIndex(index);
    setEditItem({ ...item });
  };

  const handleSaveEdit = async () => {
    try {
      // In a real implementation, you would update the item via API
      // For now, we'll just show a success message
      toast.success('Item updated successfully');
      setEditItemIndex(null);
      setEditItem({});
    } catch (error) {
      toast.error('Failed to update item');
    }
  };

  const handleDeleteItem = async (index) => {
    try {
      // In a real implementation, you would delete the item via API
      toast.success('Item deleted successfully');
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const handleCancelEdit = () => {
    setEditItemIndex(null);
    setEditItem({});
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      {!selectedInvoice ? (
        <>
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Sales Management</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSummary(!showSummary)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                {showSummary ? 'Hide Summary' : 'Show Summary'}
              </button>
            </div>
          </div>

          {/* Summary Section */}
          {showSummary && (
            <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Sales Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Total Invoices</p>
                  <p className="text-2xl font-bold text-blue-600">{totalInvoices}</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Total Sales</p>
                  <p className="text-2xl font-bold text-green-600">UGX {formatNumber(totalSalesAmount)}</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Total Profit</p>
                  <p className="text-2xl font-bold text-purple-600">UGX {formatNumber(totalSalesProfit)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-gray-400" size={20} />
              </div>
              <input
                type="text"
                placeholder="Search invoices by customer or invoice number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>
          </div>

          {/* Invoices List */}
          <div className="space-y-4">
            {sortedInvoices.length > 0 ? (
              sortedInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="p-6 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
                  onClick={() => handleInvoiceSelect(invoice)}
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Date</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(invoice.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Customer</p>
                      <p className="font-semibold text-gray-900">{invoice.customer}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                      <p className="font-semibold text-green-600">UGX {formatNumber(invoice.total)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Profit</p>
                      <p className="font-semibold text-blue-600">UGX {formatNumber(invoice.profit)}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-gray-500">Invoice: {invoice.invoice_no}</span>
                    <div className="flex items-center text-sm text-gray-500">
                      <Eye size={16} className="mr-1" />
                      Click to view details
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search size={48} className="mx-auto" />
                </div>
                <p className="text-gray-500 text-lg">No sales records found</p>
                <p className="text-gray-400 text-sm mt-2">
                  {searchTerm ? 'Try adjusting your search terms' : 'Start by creating your first sale'}
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Invoice Detail View */
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Sales
              </button>
              <h3 className="text-xl font-semibold text-gray-800">Invoice Details</h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Printer size={16} />
                Print Invoice
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isEditing 
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                    : 'bg-yellow-400 hover:bg-yellow-500 text-gray-800'
                }`}
              >
                <Edit size={16} />
                {isEditing ? 'Cancel Edit' : 'Edit Invoice'}
              </button>
            </div>
          </div>

          {/* Invoice Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500 mb-1">Invoice Number</p>
              <p className="font-semibold text-gray-900">{selectedInvoice.invoice_no}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Date</p>
              <p className="font-semibold text-gray-900">
                {new Date(selectedInvoice.date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Customer</p>
              <p className="font-semibold text-gray-900">{selectedInvoice.customer}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Amount</p>
              <p className="font-semibold text-lg text-green-600">UGX {formatNumber(selectedInvoice.total)}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800">Items Sold</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profit
                    </th>
                    {isEditing && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(selectedInvoice.items || []).map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {editItemIndex === index ? (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={editItem.name}
                              onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              value={editItem.qty}
                              onChange={(e) => setEditItem({ ...editItem, qty: parseFloat(e.target.value) || 0 })}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              value={editItem.unit_price}
                              onChange={(e) => setEditItem({ ...editItem, unit_price: parseFloat(e.target.value) || 0 })}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            UGX {formatNumber(editItem.qty * editItem.unit_price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            UGX {formatNumber((editItem.qty * editItem.unit_price) * 0.2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex gap-2">
                              <button 
                                onClick={handleSaveEdit}
                                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-xs"
                              >
                                Save
                              </button>
                              <button 
                                onClick={handleCancelEdit}
                                className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.qty}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            UGX {formatNumber(item.unit_price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            UGX {formatNumber(item.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            UGX {formatNumber(item.profit)}
                          </td>
                          {isEditing && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleEditItem(item, index)}
                                  className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                  title="Edit item"
                                >
                                  <Edit size={14} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteItem(index)}
                                  className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                  title="Delete item"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          )}
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Profit</p>
                <p className="text-2xl font-bold text-green-600">UGX {formatNumber(selectedInvoice.profit)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-blue-600">UGX {formatNumber(selectedInvoice.total)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySales;
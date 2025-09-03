import React, { useState, useEffect } from 'react';
import { Search, Printer, Edit, Trash2, Eye, ArrowLeft } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-toastify';
import { formatAppCurrency } from '../../../lib/utils/formatNumber';

const MySales = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      // Load sales from localStorage
      const savedSales = localStorage.getItem("sales");
      const salesData = savedSales ? JSON.parse(savedSales) : [];
      setInvoices(salesData);
    } catch (error) {
      toast.error('Failed to fetch sales data');
      console.error('Error fetching sales:', error);
      // Set empty array to prevent UI crashes
      setInvoices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.receiptNumber?.toString().includes(searchTerm.toLowerCase()) ||
    invoice.items?.some(item => item.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedInvoices = filteredInvoices.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Calculate summary data
  const totalSalesAmount = invoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
  const totalSalesProfit = invoices.reduce((sum, invoice) => sum + (invoice.profit || 0), 0);
  const totalInvoices = invoices.length;

  const handleInvoiceSelect = (invoice) => {
    setSelectedInvoice(invoice);
    setIsEditing(false);
  };

  const handleBack = () => {
    setSelectedInvoice(null);
    setIsEditing(false);
  };

  const handlePrint = () => {
    if (!selectedInvoice) return;
    
    const doc = new jsPDF();
    
         // Header
     doc.setFontSize(20);
     doc.text('Sales Receipt', 105, 20, { align: 'center' });
     
     // Sale details
     doc.setFontSize(12);
     doc.text(`Receipt #: ${selectedInvoice.receiptNumber}`, 20, 35);
     doc.text(`Date: ${new Date(selectedInvoice.date).toLocaleDateString()}`, 20, 45);
     doc.text(`Customer: ${selectedInvoice.customerName}`, 20, 55);
    
         // Sale details table
     const saleData = selectedInvoice.items.map(item => [
       item.name, 
       item.quantity.toString(), 
       formatAppCurrency(item.price), 
       formatAppCurrency(item.total), 
       formatAppCurrency((item.price - (item.cost || 0)) * item.quantity)
     ]);
     
     autoTable(doc, {
       startY: 65,
       head: [['Item Name', 'Quantity', 'Unit Price', 'Total', 'Profit']],
       body: saleData,
       theme: 'grid',
       styles: { fontSize: 10 },
       headStyles: { fillColor: [72, 187, 120] }
     });
     
     const finalY = doc.lastAutoTable.finalY || 65;
     doc.setFontSize(14);
     doc.text(`Total: ${formatAppCurrency(selectedInvoice.total)}`, 150, finalY + 15);
     doc.text(`Profit: ${formatAppCurrency(selectedInvoice.profit)}`, 150, finalY + 25);
     
     doc.save(`sale-${selectedInvoice.receiptNumber}.pdf`);
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
                  <p className="text-2xl font-bold text-green-600">{formatAppCurrency(totalSalesAmount)}</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Total Profit</p>
                  <p className="text-2xl font-bold text-purple-600">{formatAppCurrency(totalSalesProfit)}</p>
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
                         {new Date(invoice.createdAt).toLocaleDateString()}
                       </p>
                     </div>
                     <div>
                       <p className="text-sm text-gray-500 mb-1">Item</p>
                       <p className="font-semibold text-gray-900">{invoice.itemName}</p>
                     </div>
                     <div>
                       <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                       <p className="font-semibold text-green-600">{formatAppCurrency(invoice.totalPrice)}</p>
                     </div>
                     <div>
                       <p className="text-sm text-gray-500 mb-1">Profit</p>
                       <p className="font-semibold text-blue-600">{formatAppCurrency(invoice.profit)}</p>
                     </div>
                  </div>
                                     <div className="mt-3 flex items-center justify-between">
                     <span className="text-sm text-gray-500">Sale ID: {invoice.id}</span>
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
                             <h3 className="text-xl font-semibold text-gray-800">Sale Details</h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                                 <Printer size={16} />
                 Print Sale
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
                 {isEditing ? 'Cancel Edit' : 'Edit Sale'}
              </button>
            </div>
          </div>

          {/* Invoice Information */}
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-gray-50 rounded-lg">
             <div>
               <p className="text-sm text-gray-500 mb-1">Sale ID</p>
               <p className="font-semibold text-gray-900">{selectedInvoice.id}</p>
             </div>
             <div>
               <p className="text-sm text-gray-500 mb-1">Date</p>
               <p className="font-semibold text-gray-900">
                 {new Date(selectedInvoice.createdAt).toLocaleDateString()}
               </p>
             </div>
             <div>
               <p className="text-sm text-gray-500 mb-1">Item</p>
               <p className="font-semibold text-gray-900">{selectedInvoice.itemName}</p>
             </div>
             <div>
               <p className="text-sm text-gray-500 mb-1">Total Amount</p>
               <p className="font-semibold text-lg text-green-600">UGX {formatNumber(selectedInvoice.totalPrice)}</p>
             </div>
           </div>

          {/* Items Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                         <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
               <h4 className="text-lg font-semibold text-gray-800">Sale Details</h4>
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
                   <tr className="hover:bg-gray-50">
                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                       {selectedInvoice.itemName}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                       {selectedInvoice.quantity}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                       {formatAppCurrency(selectedInvoice.unitPrice)}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                       {formatAppCurrency(selectedInvoice.totalPrice)}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                       {formatAppCurrency(selectedInvoice.profit)}
                     </td>
                   </tr>
                 </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-100">
                         <div className="flex justify-between items-center">
               <div>
                 <p className="text-sm text-gray-500 mb-1">Total Profit</p>
                 <p className="text-2xl font-bold text-green-600">{formatAppCurrency(selectedInvoice.profit)}</p>
               </div>
               <div>
                 <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                 <p className="text-2xl font-bold text-blue-600">{formatAppCurrency(selectedInvoice.totalPrice)}</p>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySales;
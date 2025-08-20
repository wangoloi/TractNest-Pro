import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download } from 'lucide-react';
import { formatNumber } from '../../utils/formatNumber';

const StockStatement = ({ receipts, timePeriod, customStartDate, customEndDate }) => {
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [totalStockValue, setTotalStockValue] = useState(0);

  // Function to get date range based on selection
  const getDateRange = () => {
    const today = new Date();
    const startDate = new Date();
    const endDate = new Date();

    switch (timePeriod) {
      case 'this_month':
        startDate.setDate(1);
        endDate.setMonth(today.getMonth() + 1);
        endDate.setDate(0);
        break;
      case 'last_month':
        startDate.setMonth(today.getMonth() - 1);
        startDate.setDate(1);
        endDate.setDate(0);
        break;
      case 'last_3_months':
        startDate.setMonth(today.getMonth() - 3);
        startDate.setDate(1);
        endDate.setMonth(today.getMonth() + 1);
        endDate.setDate(0);
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          startDate.setTime(new Date(customStartDate).getTime());
          endDate.setTime(new Date(customEndDate).getTime());
        }
        break;
      default:
        startDate.setMonth(today.getMonth() - 1);
        startDate.setDate(1);
        endDate.setMonth(today.getMonth() + 1);
        endDate.setDate(0);
    }

    return { startDate, endDate };
  };

  // Filter receipts based on date range
  useEffect(() => {
    const { startDate, endDate } = getDateRange();
    
    // Filter receipts by date range
    const filtered = receipts.filter(receipt => {
      const receiptDate = new Date(receipt.date);
      return receiptDate >= startDate && receiptDate <= endDate;
    });
    
    setFilteredReceipts(filtered);
    
    // Calculate total stock value for the period
    const totalValue = filtered.reduce((sum, receipt) => sum + receipt.total, 0);
    setTotalStockValue(totalValue);
  }, [receipts, timePeriod, customStartDate, customEndDate]);


  // Handle print functionality
  const handlePrint = () => {
    // Create a new jsPDF instance
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Stock Statement', 105, 20, { align: 'center' });
    
    // Add date range
    const { startDate, endDate } = getDateRange();
    doc.setFontSize(12);
    doc.text(`Period: ${startDate.toDateString()} to ${endDate.toDateString()}`, 20, 35);
    
    // Add summary
    doc.text(`Total Stock Value: UGX ${formatNumber(totalStockValue)}`, 20, 45);
    
    // Add receipts table
    if (filteredReceipts.length > 0) {
      const receiptsData = filteredReceipts.map(receipt => [
        receipt.id,
        new Date(receipt.date).toLocaleDateString(),
        receipt.company,
        `UGX ${formatNumber(receipt.total)}`
      ]);
      
      autoTable(doc, {
        startY: 55,
        head: [['Receipt ID', 'Date', 'Company', 'Total Amount']],
        body: receiptsData,
        theme: 'grid',
        styles: {
          fontSize: 10
        },
        headStyles: {
          fillColor: [72, 187, 120] // Green color
        }
      });
      
      // Add total
      const finalY = doc.lastAutoTable.finalY || 55;
      doc.setFontSize(14);
      doc.text(`Total Stock Value: UGX ${formatNumber(totalStockValue)}`, 150, finalY + 15);
    } else {
      doc.text('No stock receipts found for the selected period.', 20, 65);
    }
    
    // Save the PDF
    doc.save(`stock-statement-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Stock Statement</h3>
        <button
          onClick={handlePrint}
          className="flex items-center px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
        >
          <Download size={14} className="mr-1" />
          Print
        </button>
      </div>
      
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-lg font-semibold text-blue-800">
          Total Stock Value: UGX {formatNumber(totalStockValue)}
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReceipts.length > 0 ? (
              filteredReceipts.map((receipt) => (
                <tr key={receipt.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{receipt.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{new Date(receipt.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{receipt.company}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">UGX {formatNumber(receipt.total)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-4 py-3 text-center text-sm text-gray-500">
                  No stock receipts found for the selected period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockStatement;
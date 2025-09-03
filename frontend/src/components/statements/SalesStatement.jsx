import React, { useState, useEffect, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download } from 'lucide-react';
import { formatNumber, formatAppCurrency } from '../../utils/formatNumber';

const SalesStatement = ({ salesRecords, timePeriod, customStartDate, customEndDate }) => {
  const [filteredSales, setFilteredSales] = useState([]);
  const [totalSalesAmount, setTotalSalesAmount] = useState(0);
  const [totalSalesProfit, setTotalSalesProfit] = useState(0);

  // Function to get date range based on selection
  const getDateRange = useCallback(() => {
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
  }, [timePeriod, customStartDate, customEndDate]);

  // Filter sales records based on date range
  useEffect(() => {
    const { startDate, endDate } = getDateRange();
    
    // Filter sales by date range
    const filtered = salesRecords.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= startDate && saleDate <= endDate;
    });
    
    setFilteredSales(filtered);
    
    // Calculate total sales amount and profit for the period
    const totalAmount = filtered.reduce((sum, sale) => sum + sale.total, 0);
    const totalProfit = filtered.reduce((sum, sale) => sum + sale.profit, 0);
    
    setTotalSalesAmount(totalAmount);
    setTotalSalesProfit(totalProfit);
  }, [salesRecords, getDateRange]);


  // Handle print functionality
  const handlePrint = () => {
    // Create a new jsPDF instance
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Sales Statement', 105, 20, { align: 'center' });
    
    // Add date range
    const { startDate, endDate } = getDateRange();
    doc.setFontSize(12);
    doc.text(`Period: ${startDate.toDateString()} to ${endDate.toDateString()}`, 20, 35);
    
    // Add summary
            doc.text(`Total Sales Amount: ${formatAppCurrency(totalSalesAmount)}`, 20, 45);
        doc.text(`Total Sales Profit: ${formatAppCurrency(totalSalesProfit)}`, 20, 55);
    
    // Add sales table
    if (filteredSales.length > 0) {
      const salesData = filteredSales.map(sale => [
        sale.id,
        new Date(sale.date).toLocaleDateString(),
        sale.customer,
                        `${formatAppCurrency(sale.total)}`,
                `${formatAppCurrency(sale.profit)}`
      ]);
      
      autoTable(doc, {
        startY: 65,
        head: [['Invoice ID', 'Date', 'Customer', 'Total Amount', 'Profit']],
        body: salesData,
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
              doc.text(`Total Sales Amount: ${formatAppCurrency(totalSalesAmount)}`, 150, finalY + 15);
        doc.text(`Total Sales Profit: ${formatAppCurrency(totalSalesProfit)}`, 150, finalY + 25);
    } else {
      doc.text('No sales records found for the selected period.', 20, 75);
    }
    
    // Save the PDF
    doc.save(`sales-statement-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Sales Statement</h3>
        <button
          onClick={handlePrint}
          className="flex items-center px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
        >
          <Download size={14} className="mr-1" />
          Print
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-gray-500">Total Sales Amount</p>
          <p className="text-lg font-bold text-blue-600">{formatAppCurrency(totalSalesAmount)}</p>
        </div>
        <div className="p-3 bg-green-50 rounded-md">
          <p className="text-sm text-gray-500">Total Sales Profit</p>
          <p className="text-lg font-bold text-green-600">{formatAppCurrency(totalSalesProfit)}</p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSales.length > 0 ? (
              filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{sale.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{new Date(sale.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{sale.customer}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatAppCurrency(sale.total)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatAppCurrency(sale.profit)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-4 py-3 text-center text-sm text-gray-500">
                  No sales records found for the selected period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesStatement;

import React, { useState, useEffect } from 'react';
import { Search, Printer, Calendar, FileText, TrendingUp, Package, RefreshCw } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-toastify';
import { formatAppCurrency } from '../../lib/utils/formatNumber';

const Statements = () => {
  const [statementType, setStatementType] = useState('sales'); // 'sales' or 'stock'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statementData, setStatementData] = useState([]);
  const [summary, setSummary] = useState({});

  // Get real sales data from localStorage
  const getSalesData = () => {
    try {
      const salesData = JSON.parse(localStorage.getItem('sales') || '[]');
      console.log('Raw sales data from localStorage:', salesData);
      const processedData = salesData.map(sale => ({
        id: sale.id,
        date: sale.date,
        customer: sale.customerName,
        receiptNumber: sale.receiptNumber,
        totalAmount: sale.total,
        totalProfit: sale.profit || 0, // Ensure profit is available
        items: sale.items || []
      }));
      console.log('Processed sales data:', processedData);
      return processedData;
    } catch (error) {
      console.error('Error parsing sales data:', error);
      return [];
    }
  };

  // Get real stock data from localStorage
  const getStockData = () => {
    try {
      const receiptsData = JSON.parse(localStorage.getItem('receipts') || '[]');
      const stockItems = [];
      
      receiptsData.forEach(receipt => {
        if (receipt.items && Array.isArray(receipt.items)) {
          receipt.items.forEach(item => {
            stockItems.push({
              id: `${receipt.id}-${item.name}`,
              date: receipt.date || receipt.receipt_date,
              itemName: item.name,
              quantity: item.qty || item.quantity,
              unitPrice: item.price || item.cost_price,
              totalPrice: (item.qty || item.quantity) * (item.price || item.cost_price),
              supplier: receipt.company || receipt.company_name,
              receiptNumber: receipt.receiptNo || receipt.receipt_number
            });
          });
        }
      });
      
      return stockItems;
    } catch (error) {
      console.error('Error parsing stock data:', error);
      return [];
    }
  };

  useEffect(() => {
    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);

    // Initialize sample data if none exists
    initializeSampleData();
  }, []);

  const initializeSampleData = () => {
    // Initialize sample sales data if none exists
    if (!localStorage.getItem('sales')) {
      const sampleSales = [
        {
          id: 1,
          customerName: "John Smith",
          items: [
            { name: "Laptop Pro", quantity: 1, price: 1200000, total: 1200000 },
          ],
          total: 1200000,
          profit: 300000, // Correct profit: 1,200,000 - 900,000 = 300,000
          date: "2024-01-15",
          status: "completed",
          receiptNumber: "001",
          customerPhone: "+256 701 234 567",
          customerEmail: "john.smith@email.com",
          paymentMethod: "cash",
          discount: 0,
          tax: 0,
          notes: "",
        },
        {
          id: 2,
          customerName: "Jane Doe",
          items: [
            { name: "Smartphone X", quantity: 2, price: 800000, total: 1600000 },
          ],
          total: 1600000,
          profit: 400000, // Correct profit: 1,600,000 - 1,200,000 = 400,000
          date: "2024-01-16",
          status: "completed",
          receiptNumber: "002",
          customerPhone: "+256 702 345 678",
          customerEmail: "jane.doe@email.com",
          paymentMethod: "mobile_money",
          discount: 5,
          tax: 2,
          notes: "Customer requested delivery",
        },
      ];
      localStorage.setItem('sales', JSON.stringify(sampleSales));
    }

    // Initialize sample stock receipts data if none exists
    if (!localStorage.getItem('receipts')) {
      const sampleReceipts = [
        {
          id: 1,
          date: "2024-01-15",
          company: "Tech Supplies Ltd",
          company_name: "Tech Supplies Ltd",
          receiptNo: "REC-001",
          receipt_number: "REC-001",
          items: [
            { name: "Laptop Pro", qty: 10, quantity: 10, price: 900000, cost_price: 900000 },
            { name: "Smartphone X", qty: 15, quantity: 15, price: 600000, cost_price: 600000 },
          ]
        },
        {
          id: 2,
          date: "2024-01-16",
          company: "Mobile World",
          company_name: "Mobile World",
          receiptNo: "REC-002",
          receipt_number: "REC-002",
          items: [
            { name: "Tablet Air", qty: 8, quantity: 8, price: 350000, cost_price: 350000 },
            { name: "Wireless Headphones", qty: 20, quantity: 20, price: 90000, cost_price: 90000 },
          ]
        },
      ];
      localStorage.setItem('receipts', JSON.stringify(sampleReceipts));
    }
  };

  const generateStatement = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start date cannot be after end date');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let filteredData = [];
      
      if (statementType === 'sales') {
        // Get sales data and flatten items
        const salesData = getSalesData();
        const salesItems = [];
        
        salesData.forEach(sale => {
          const saleDate = new Date(sale.date);
          const start = new Date(startDate);
          const end = new Date(endDate);
          
          if (saleDate >= start && saleDate <= end) {
            if (sale.items && Array.isArray(sale.items)) {
              sale.items.forEach(item => {
                // Calculate profit per item based on the sale's total profit proportionally
                const itemProfit = sale.totalProfit ? (item.total / sale.totalAmount) * sale.totalProfit : 0;
                salesItems.push({
                  id: `${sale.id}-${item.name}`,
                  date: sale.date,
                  itemName: item.name,
                  quantity: item.quantity,
                  unitPrice: item.price,
                  totalPrice: item.total,
                  profit: itemProfit,
                  customer: sale.customer,
                  receiptNumber: sale.receiptNumber
                });
              });
            }
          }
        });
        
        filteredData = salesItems;
      } else {
        // Get stock data
        const stockData = getStockData();
        filteredData = stockData.filter(item => {
          const itemDate = new Date(item.date);
          const start = new Date(startDate);
          const end = new Date(endDate);
          return itemDate >= start && itemDate <= end;
        });
      }

      setStatementData(filteredData);

      // Calculate summary
      const totalAmount = filteredData.reduce((sum, item) => sum + item.totalPrice, 0);
      const totalQuantity = filteredData.reduce((sum, item) => sum + item.quantity, 0);
      const totalProfit = statementType === 'sales' 
        ? filteredData.reduce((sum, item) => sum + (item.profit || 0), 0)
        : 0;

      setSummary({
        totalAmount,
        totalQuantity,
        totalProfit,
        itemCount: filteredData.length
      });

      toast.success(`${statementType === 'sales' ? 'Sales' : 'Stock'} statement generated successfully!`);
    } catch (error) {
      toast.error('Failed to generate statement');
      console.error('Error generating statement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const printStatement = () => {
    if (statementData.length === 0) {
      toast.error('No data to print');
      return;
    }

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text(`${statementType === 'sales' ? 'Sales' : 'Stock'} Statement`, 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`, 20, 35);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45);
    
    // Summary
    doc.setFontSize(14);
    doc.text('Summary:', 20, 65);
    doc.setFontSize(10);
    doc.text(`Total Items: ${summary.itemCount}`, 20, 75);
    doc.text(`Total Quantity: ${summary.totalQuantity}`, 20, 85);
    doc.text(`Total Amount: ${formatAppCurrency(summary.totalAmount)}`, 20, 95);
    if (statementType === 'sales') {
      doc.text(`Total Profit: ${formatAppCurrency(summary.totalProfit)}`, 20, 105);
    }
    
    // Table
    const tableY = statementType === 'sales' ? 125 : 115;
    
    const headers = statementType === 'sales' 
      ? ['Date', 'Item', 'Qty', 'Unit Price', 'Total', 'Profit', 'Customer']
      : ['Date', 'Item', 'Qty', 'Unit Price', 'Total', 'Supplier', 'Receipt #'];
    
    const tableData = statementData.map(item => {
      if (statementType === 'sales') {
        return [
          new Date(item.date).toLocaleDateString(),
          item.itemName,
          item.quantity.toString(),
          formatAppCurrency(item.unitPrice),
          formatAppCurrency(item.totalPrice),
          formatAppCurrency(item.profit || 0),
          item.customer
        ];
      } else {
        return [
          new Date(item.date).toLocaleDateString(),
          item.itemName,
          item.quantity.toString(),
          formatAppCurrency(item.unitPrice),
          formatAppCurrency(item.totalPrice),
          item.supplier,
          item.receiptNumber
        ];
      }
    });

    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: tableY,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }
    });

    doc.save(`${statementType}_statement_${startDate}_to_${endDate}.pdf`);
    toast.success('Statement printed successfully!');
  };

  const clearStatement = () => {
    setStatementData([]);
    setSummary({});
  };

  // Function to refresh data from localStorage
  const refreshData = () => {
    // Clear current statement
    setStatementData([]);
    setSummary({});
    
    // Re-initialize sample data if needed
    initializeSampleData();
    
    toast.success('Data refreshed from storage');
  };

  return (
    <div className="space-y-6 p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Statements</h1>
            <p className="text-gray-600">Generate statements for sales or stock receipts</p>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        {/* Statement Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Statement Type</label>
          <div className="flex gap-4">
            <button
              onClick={() => setStatementType('sales')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                statementType === 'sales'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <TrendingUp size={20} />
              Sales Statement
            </button>
            <button
              onClick={() => setStatementType('stock')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                statementType === 'stock'
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Package size={20} />
              Stock Receipts Statement
            </button>
          </div>
        </div>

        {/* Date Range Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={generateStatement}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Generating...' : 'Generate Statement'}
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {Object.keys(summary).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Items</p>
                  <p className="text-2xl font-bold text-blue-900">{summary.itemCount}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Total Quantity</p>
                  <p className="text-2xl font-bold text-green-900">{summary.totalQuantity}</p>
                </div>
                <Package className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Total Amount</p>
                  <p className="text-2xl font-bold text-purple-900">{formatAppCurrency(summary.totalAmount)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            {statementType === 'sales' && (
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 font-medium">Total Profit</p>
                    <p className="text-2xl font-bold text-orange-900">{formatAppCurrency(summary.totalProfit)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            )}
          </div>
        )}

                 {/* Actions */}
         <div className="flex gap-3 mb-6">
           {statementData.length > 0 && (
             <>
               <button
                 onClick={printStatement}
                 className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
               >
                 <Printer size={20} />
                 Print Statement
               </button>
               <button
                 onClick={clearStatement}
                 className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
               >
                 <Search size={20} />
                 Clear Statement
               </button>
             </>
           )}
           <button
             onClick={refreshData}
             className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
           >
             <RefreshCw size={20} />
             Refresh Data
           </button>
         </div>

        {/* Statement Data Table */}
        {statementData.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {statementType === 'sales' ? 'Sales' : 'Stock Receipts'} Statement
              </h3>
              <p className="text-sm text-gray-600">
                Period: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    {statementType === 'sales' ? (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt #</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {statementData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(item.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.itemName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatAppCurrency(item.unitPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        {formatAppCurrency(item.totalPrice)}
                      </td>
                                             {statementType === 'sales' ? (
                         <>
                           <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                             {formatAppCurrency(item.profit || 0)}
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                             {item.customer}
                           </td>
                         </>
                       ) : (
                         <>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                             {item.supplier}
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                             {item.receiptNumber}
                           </td>
                         </>
                       )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {statementData.length === 0 && Object.keys(summary).length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Statement Generated</h3>
            <p className="text-gray-500 mb-6">
              Select a statement type, date range, and click "Generate Statement" to create your report.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statements;

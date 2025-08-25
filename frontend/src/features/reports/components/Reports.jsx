import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  FileText,
  Eye,
  RefreshCw,
  Search,
  CalendarDays,
  Clock
} from 'lucide-react';
import { toast } from 'react-toastify';

const Reports = () => {
  const [selectedReportType, setSelectedReportType] = useState('sales');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock report data
  const generateMockReport = (type, start, end) => {
    const mockSalesData = [
      {
        id: 1,
        date: '2024-01-15',
        customer: 'Alice Johnson',
        items: [
          { name: 'Laptop Pro', quantity: 1, price: 1200, total: 1200 },
          { name: 'Wireless Mouse', quantity: 2, price: 25, total: 50 }
        ],
        total: 1250,
        paymentMethod: 'Credit Card',
        status: 'completed'
      },
      {
        id: 2,
        date: '2024-01-14',
        customer: 'Bob Smith',
        items: [
          { name: 'Smartphone X', quantity: 1, price: 800, total: 800 },
          { name: 'Phone Case', quantity: 1, price: 20, total: 20 }
        ],
        total: 820,
        paymentMethod: 'PayPal',
        status: 'completed'
      },
      {
        id: 3,
        date: '2024-01-13',
        customer: 'Carol Davis',
        items: [
          { name: 'Wireless Headphones', quantity: 1, price: 150, total: 150 }
        ],
        total: 150,
        paymentMethod: 'Cash',
        status: 'completed'
      }
    ];

    const mockStockData = [
      {
        id: 1,
        date: '2024-01-15',
        item: 'Laptop Pro',
        action: 'sale',
        quantity: -1,
        previousStock: 10,
        currentStock: 9,
        unitPrice: 1200,
        totalValue: 1200
      },
      {
        id: 2,
        date: '2024-01-14',
        item: 'Smartphone X',
        action: 'sale',
        quantity: -1,
        previousStock: 15,
        currentStock: 14,
        unitPrice: 800,
        totalValue: 800
      },
      {
        id: 3,
        date: '2024-01-13',
        item: 'Wireless Headphones',
        action: 'restock',
        quantity: 5,
        previousStock: 8,
        currentStock: 13,
        unitPrice: 150,
        totalValue: 750
      }
    ];

    const mockInventoryData = [
      {
        id: 1,
        name: 'Laptop Pro',
        category: 'Electronics',
        currentStock: 9,
        minStock: 5,
        unitPrice: 1200,
        totalValue: 10800,
        lastUpdated: '2024-01-15'
      },
      {
        id: 2,
        name: 'Smartphone X',
        category: 'Electronics',
        currentStock: 14,
        minStock: 10,
        unitPrice: 800,
        totalValue: 11200,
        lastUpdated: '2024-01-14'
      },
      {
        id: 3,
        name: 'Wireless Headphones',
        category: 'Accessories',
        currentStock: 13,
        minStock: 5,
        unitPrice: 150,
        totalValue: 1950,
        lastUpdated: '2024-01-13'
      }
    ];

    const calculateStats = (data, type) => {
      if (type === 'sales') {
        const totalSales = data.reduce((sum, sale) => sum + sale.total, 0);
        const totalItems = data.reduce((sum, sale) => 
          sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
        );
        const uniqueCustomers = new Set(data.map(sale => sale.customer)).size;
        return { totalSales, totalItems, uniqueCustomers };
      } else if (type === 'stock') {
        const totalValue = data.reduce((sum, item) => sum + item.totalValue, 0);
        const totalItems = data.length;
        const lowStockItems = data.filter(item => item.currentStock <= item.minStock).length;
        return { totalValue, totalItems, lowStockItems };
      }
      return {};
    };

    return {
      type,
      period: { start, end },
      data: type === 'sales' ? mockSalesData : type === 'stock' ? mockStockData : mockInventoryData,
      stats: calculateStats(type === 'sales' ? mockSalesData : mockStockData, type),
      generatedAt: new Date().toISOString()
    };
  };

  const generateReport = () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start date cannot be after end date');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const report = generateMockReport(selectedReportType, startDate, endDate);
      setReportData(report);
      setLoading(false);
      toast.success(`${selectedReportType.charAt(0).toUpperCase() + selectedReportType.slice(1)} report generated successfully!`);
    }, 1500);
  };

  const printReport = () => {
    if (!reportData) {
      toast.error('No report to print');
      return;
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${selectedReportType.charAt(0).toUpperCase() + selectedReportType.slice(1)} Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .stats { display: flex; justify-content: space-around; margin-bottom: 30px; }
            .stat { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${selectedReportType.charAt(0).toUpperCase() + selectedReportType.slice(1)} Report</h1>
            <p>Period: ${startDate} to ${endDate}</p>
            <p>Generated: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="stats">
            ${Object.entries(reportData.stats).map(([key, value]) => `
              <div class="stat">
                <h3>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h3>
                <p>${typeof value === 'number' && key.includes('Sales') ? '$' + value.toLocaleString() : value}</p>
              </div>
            `).join('')}
          </div>
          
          <table>
            <thead>
              <tr>
                ${selectedReportType === 'sales' ? 
                  '<th>Date</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th>' :
                  selectedReportType === 'stock' ?
                  '<th>Date</th><th>Item</th><th>Action</th><th>Quantity</th><th>Stock</th><th>Value</th>' :
                  '<th>Item</th><th>Category</th><th>Stock</th><th>Price</th><th>Value</th>'
                }
              </tr>
            </thead>
            <tbody>
              ${reportData.data.map(item => {
                if (selectedReportType === 'sales') {
                  return `
                    <tr>
                      <td>${item.date}</td>
                      <td>${item.customer}</td>
                      <td>${item.items.map(i => `${i.name} (${i.quantity})`).join(', ')}</td>
                      <td>$${item.total}</td>
                      <td>${item.paymentMethod}</td>
                    </tr>
                  `;
                } else if (selectedReportType === 'stock') {
                  return `
                    <tr>
                      <td>${item.date}</td>
                      <td>${item.item}</td>
                      <td>${item.action}</td>
                      <td>${item.quantity > 0 ? '+' : ''}${item.quantity}</td>
                      <td>${item.currentStock}</td>
                      <td>$${item.totalValue}</td>
                    </tr>
                  `;
                } else {
                  return `
                    <tr>
                      <td>${item.name}</td>
                      <td>${item.category}</td>
                      <td>${item.currentStock}</td>
                      <td>$${item.unitPrice}</td>
                      <td>$${item.totalValue}</td>
                    </tr>
                  `;
                }
              }).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Report generated by TrackNest Pro</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const downloadReport = () => {
    if (!reportData) {
      toast.error('No report to download');
      return;
    }

    // Create CSV content
    let csvContent = '';
    
    if (selectedReportType === 'sales') {
      csvContent = 'Date,Customer,Items,Total,Payment Method\n';
      reportData.data.forEach(sale => {
        csvContent += `${sale.date},${sale.customer},"${sale.items.map(i => `${i.name} (${i.quantity})`).join(', ')}",$${sale.total},${sale.paymentMethod}\n`;
      });
    } else if (selectedReportType === 'stock') {
      csvContent = 'Date,Item,Action,Quantity,Current Stock,Value\n';
      reportData.data.forEach(item => {
        csvContent += `${item.date},${item.item},${item.action},${item.quantity},${item.currentStock},$${item.totalValue}\n`;
      });
    } else {
      csvContent = 'Item,Category,Current Stock,Unit Price,Total Value\n';
      reportData.data.forEach(item => {
        csvContent += `${item.name},${item.category},${item.currentStock},$${item.unitPrice},$${item.totalValue}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedReportType}_report_${startDate}_to_${endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Report downloaded successfully!');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Reports</h1>
          <p className="text-gray-600">Generate and analyze sales, stock, and inventory reports</p>
        </div>

        {/* Report Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <select
                value={selectedReportType}
                onChange={(e) => setSelectedReportType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="sales">Sales Report</option>
                <option value="stock">Stock Movement</option>
                <option value="inventory">Inventory Status</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                onClick={generateReport}
                disabled={loading}
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <BarChart3 className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>

          {/* Quick Date Presets */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                const today = new Date();
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                setStartDate(yesterday.toISOString().split('T')[0]);
                setEndDate(today.toISOString().split('T')[0]);
              }}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Yesterday
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                setStartDate(weekAgo.toISOString().split('T')[0]);
                setEndDate(today.toISOString().split('T')[0]);
              }}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Last 7 Days
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const monthAgo = new Date(today);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                setStartDate(monthAgo.toISOString().split('T')[0]);
                setEndDate(today.toISOString().split('T')[0]);
              }}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Last 30 Days
            </button>
          </div>
        </div>

        {/* Report Results */}
        {reportData && (
          <div className="space-y-6">
            {/* Report Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(reportData.stats).map(([key, value]) => (
                <div key={key} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {key.includes('Sales') ? (
                        <DollarSign className="h-6 w-6 text-blue-600" />
                      ) : key.includes('Items') ? (
                        <Package className="h-6 w-6 text-blue-600" />
                      ) : key.includes('Customers') ? (
                        <Users className="h-6 w-6 text-blue-600" />
                      ) : key.includes('Value') ? (
                        <TrendingUp className="h-6 w-6 text-blue-600" />
                      ) : (
                        <BarChart3 className="h-6 w-6 text-blue-600" />
                      )}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {typeof value === 'number' && key.includes('Sales') ? `$${value.toLocaleString()}` : value}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Report Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedReportType.charAt(0).toUpperCase() + selectedReportType.slice(1)} Report
                </h3>
                <div className="flex space-x-3">
                  <button
                    onClick={printReport}
                    className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </button>
                  <button
                    onClick={downloadReport}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV
                  </button>
                </div>
              </div>

              {/* Report Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {selectedReportType === 'sales' ? (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                        </>
                      ) : selectedReportType === 'stock' ? (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                        </>
                      ) : (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.data.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {selectedReportType === 'sales' ? (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.customer}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {item.items.map(i => `${i.name} (${i.quantity})`).join(', ')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${item.total}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.paymentMethod}</td>
                          </>
                        ) : selectedReportType === 'stock' ? (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.item}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                item.action === 'sale' ? 'text-red-600 bg-red-100' : 'text-green-600 bg-green-100'
                              }`}>
                                {item.action}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.quantity > 0 ? '+' : ''}{item.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.currentStock}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${item.totalValue}</td>
                          </>
                        ) : (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.category}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.currentStock}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.unitPrice}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${item.totalValue}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;

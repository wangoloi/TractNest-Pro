import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Package, 
  ShoppingCart,
  Download,
  Printer,
  FileText
} from 'lucide-react';
import { formatNumber } from '../../../utils/formatNumber';

const DailyReport = ({ sales, inventory }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState({
    dailySales: [],
    totalRevenue: 0,
    totalItems: 0,
    topSellingItems: [],
    lowStockItems: []
  });

  useEffect(() => {
    const selectedDateObj = new Date(selectedDate);
    const startOfDay = new Date(selectedDateObj.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDateObj.setHours(23, 59, 59, 999));

    // Filter sales for selected date
    const dailySales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= startOfDay && saleDate <= endOfDay;
    });

    // Calculate totals
    const totalRevenue = dailySales.reduce((sum, sale) => sum + sale.total, 0);
    const totalItems = dailySales.reduce((sum, sale) => 
      sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );

    // Get top selling items
    const itemSales = {};
    dailySales.forEach(sale => {
      sale.items.forEach(item => {
        if (itemSales[item.name]) {
          itemSales[item.name] += item.quantity;
        } else {
          itemSales[item.name] = item.quantity;
        }
      });
    });

    const topSellingItems = Object.entries(itemSales)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Get low stock items (quantity <= 5)
    const lowStockItems = inventory.filter(item => item.quantity <= 5);

    setReportData({
      dailySales,
      totalRevenue,
      totalItems,
      topSellingItems,
      lowStockItems
    });
  }, [selectedDate, sales, inventory]);

  const exportReport = () => {
    const reportContent = `
Daily Sales Report - ${selectedDate}

SUMMARY:
- Total Sales: ${reportData.dailySales.length}
- Total Revenue: UGX ${formatNumber(reportData.totalRevenue)}
- Total Items Sold: ${reportData.totalItems}

TOP SELLING ITEMS:
${reportData.topSellingItems.map((item, index) => 
  `${index + 1}. ${item.name} - ${item.quantity} units`
).join('\n')}

LOW STOCK ITEMS:
${reportData.lowStockItems.map(item => 
  `- ${item.name} - ${item.quantity} remaining`
).join('\n')}

DETAILED SALES:
${reportData.dailySales.map(sale => `
Receipt: ${sale.receiptNumber}
Customer: ${sale.customerName}
Items: ${sale.items.map(item => `${item.name} (${item.quantity})`).join(', ')}
Total: UGX ${formatNumber(sale.total)}
`).join('\n')}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-report-${selectedDate}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    const printWindow = window.open('', '_blank');
    const reportHTML = `
      <html>
        <head>
          <title>Daily Report - ${selectedDate}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Daily Sales Report</h1>
            <h2>${selectedDate}</h2>
          </div>
          
          <div class="summary">
            <h3>Summary</h3>
            <p><strong>Total Sales:</strong> ${reportData.dailySales.length}</p>
            <p><strong>Total Revenue:</strong> UGX ${formatNumber(reportData.totalRevenue)}</p>
            <p><strong>Total Items Sold:</strong> ${reportData.totalItems}</p>
          </div>
          
          <div class="section">
            <h3>Top Selling Items</h3>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity Sold</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.topSellingItems.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <h3>Low Stock Items</h3>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Remaining Quantity</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.lowStockItems.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(reportHTML);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Daily Report</h2>
          <p className="text-gray-600">View and analyze your daily sales performance</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportReport}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <Download size={16} />
            Export Report
          </button>
          <button
            onClick={printReport}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Printer size={16} />
            Print Report
          </button>
        </div>
      </div>

      {/* Date Selector */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <Calendar className="text-gray-400" size={20} />
          <label className="text-sm font-medium text-gray-700">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.dailySales.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <ShoppingCart size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">UGX {formatNumber(reportData.totalRevenue)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Items Sold</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.totalItems}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Package size={24} className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-yellow-600">{reportData.lowStockItems.length}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <TrendingUp size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Top Selling Items */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Selling Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity Sold</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.topSellingItems.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Items */}
      {reportData.lowStockItems.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Low Stock Items</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remaining Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.lowStockItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.quantity === 0 
                          ? 'text-red-600 bg-red-50' 
                          : 'text-yellow-600 bg-yellow-50'
                      }`}>
                        {item.quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyReport;

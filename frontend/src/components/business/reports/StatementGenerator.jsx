import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Download,
  Printer,
  FileText,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { formatNumber } from '../../../utils/formatNumber';

const StatementGenerator = ({ sales, inventory }) => {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [statementType, setStatementType] = useState('sales');
  const [statementData, setStatementData] = useState({
    sales: [],
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    totalTransactions: 0,
    averageSale: 0,
    topItems: [],
    categoryBreakdown: [],
    dailyBreakdown: []
  });

  useEffect(() => {
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999);

    // Filter sales for date range
    const filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= startDateObj && saleDate <= endDateObj;
    });

    // Calculate basic metrics
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalTransactions = filteredSales.length;
    const averageSale = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Calculate profit (assuming we have cost data)
    const totalCost = filteredSales.reduce((sum, sale) => {
      return sum + sale.items.reduce((itemSum, item) => {
        const inventoryItem = inventory.find(inv => inv.name === item.name);
        const cost = inventoryItem ? inventoryItem.cost : 0;
        return itemSum + (cost * item.quantity);
      }, 0);
    }, 0);

    const totalProfit = totalRevenue - totalCost;

    // Get top selling items
    const itemSales = {};
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        if (itemSales[item.name]) {
          itemSales[item.name].quantity += item.quantity;
          itemSales[item.name].revenue += item.total;
        } else {
          itemSales[item.name] = {
            quantity: item.quantity,
            revenue: item.total
          };
        }
      });
    });

    const topItems = Object.entries(itemSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Category breakdown
    const categorySales = {};
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const inventoryItem = inventory.find(inv => inv.name === item.name);
        const category = inventoryItem ? inventoryItem.category : 'Unknown';
        
        if (categorySales[category]) {
          categorySales[category].quantity += item.quantity;
          categorySales[category].revenue += item.total;
        } else {
          categorySales[category] = {
            quantity: item.quantity,
            revenue: item.total
          };
        }
      });
    });

    const categoryBreakdown = Object.entries(categorySales)
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.revenue - a.revenue);

    // Daily breakdown
    const dailySales = {};
    filteredSales.forEach(sale => {
      const date = new Date(sale.date).toISOString().split('T')[0];
      if (dailySales[date]) {
        dailySales[date].revenue += sale.total;
        dailySales[date].transactions += 1;
      } else {
        dailySales[date] = {
          revenue: sale.total,
          transactions: 1
        };
      }
    });

    const dailyBreakdown = Object.entries(dailySales)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    setStatementData({
      sales: filteredSales,
      totalRevenue,
      totalCost,
      totalProfit,
      totalTransactions,
      averageSale,
      topItems,
      categoryBreakdown,
      dailyBreakdown
    });
  }, [startDate, endDate, statementType, sales, inventory]);

  const exportStatement = () => {
    const statementContent = `
${statementType.toUpperCase()} STATEMENT
Period: ${startDate} to ${endDate}

SUMMARY:
- Total Revenue: UGX ${formatNumber(statementData.totalRevenue)}
- Total Cost: UGX ${formatNumber(statementData.totalCost)}
- Total Profit: UGX ${formatNumber(statementData.totalProfit)}
- Total Transactions: ${statementData.totalTransactions}
- Average Sale: UGX ${formatNumber(statementData.averageSale)}
- Profit Margin: ${((statementData.totalProfit / statementData.totalRevenue) * 100).toFixed(2)}%

TOP SELLING ITEMS:
${statementData.topItems.map((item, index) => 
  `${index + 1}. ${item.name} - ${item.quantity} units - UGX ${formatNumber(item.revenue)}`
).join('\n')}

CATEGORY BREAKDOWN:
${statementData.categoryBreakdown.map(cat => 
  `- ${cat.category}: ${cat.quantity} units - UGX ${formatNumber(cat.revenue)}`
).join('\n')}

DAILY BREAKDOWN:
${statementData.dailyBreakdown.map(day => 
  `- ${day.date}: ${day.transactions} transactions - UGX ${formatNumber(day.revenue)}`
).join('\n')}

DETAILED TRANSACTIONS:
${statementData.sales.map(sale => `
Receipt: ${sale.receiptNumber}
Date: ${new Date(sale.date).toLocaleDateString()}
Customer: ${sale.customerName}
Items: ${sale.items.map(item => `${item.name} (${item.quantity})`).join(', ')}
Total: UGX ${formatNumber(sale.total)}
`).join('\n')}
    `;

    const blob = new Blob([statementContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${statementType}-statement-${startDate}-to-${endDate}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const printStatement = () => {
    const printWindow = window.open('', '_blank');
    const statementHTML = `
      <html>
        <head>
          <title>${statementType.toUpperCase()} Statement - ${startDate} to ${endDate}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .summary { margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { font-weight: bold; background-color: #f9f9f9; }
            .profit { color: green; }
            .loss { color: red; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>TrackNest Pro</h1>
            <h2>${statementType.toUpperCase()} STATEMENT</h2>
            <p>Period: ${startDate} to ${endDate}</p>
          </div>
          
          <div class="summary">
            <h3>Financial Summary</h3>
            <table>
              <tr>
                <td><strong>Total Revenue:</strong></td>
                <td>UGX ${formatNumber(statementData.totalRevenue)}</td>
              </tr>
              <tr>
                <td><strong>Total Cost:</strong></td>
                <td>UGX ${formatNumber(statementData.totalCost)}</td>
              </tr>
              <tr class="total">
                <td><strong>Total Profit:</strong></td>
                <td class="${statementData.totalProfit >= 0 ? 'profit' : 'loss'}">UGX ${formatNumber(statementData.totalProfit)}</td>
              </tr>
              <tr>
                <td><strong>Total Transactions:</strong></td>
                <td>${statementData.totalTransactions}</td>
              </tr>
              <tr>
                <td><strong>Average Sale:</strong></td>
                <td>UGX ${formatNumber(statementData.averageSale)}</td>
              </tr>
              <tr>
                <td><strong>Profit Margin:</strong></td>
                <td>${((statementData.totalProfit / statementData.totalRevenue) * 100).toFixed(2)}%</td>
              </tr>
            </table>
          </div>
          
          <div class="section">
            <h3>Top Selling Items</h3>
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Item</th>
                  <th>Quantity Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                ${statementData.topItems.map((item, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>UGX ${formatNumber(item.revenue)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <h3>Category Breakdown</h3>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Quantity Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                ${statementData.categoryBreakdown.map(cat => `
                  <tr>
                    <td>${cat.category}</td>
                    <td>${cat.quantity}</td>
                    <td>UGX ${formatNumber(cat.revenue)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <h3>Daily Breakdown</h3>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Transactions</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                ${statementData.dailyBreakdown.map(day => `
                  <tr>
                    <td>${day.date}</td>
                    <td>${day.transactions}</td>
                    <td>UGX ${formatNumber(day.revenue)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(statementHTML);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Statement Generator</h2>
          <p className="text-gray-600">Generate detailed financial statements for any date range</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportStatement}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <Download size={16} />
            Export Statement
          </button>
          <button
            onClick={printStatement}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Printer size={16} />
            Print Statement
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statement Type</label>
            <select
              value={statementType}
              onChange={(e) => setStatementType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="sales">Sales Statement</option>
              <option value="profit">Profit & Loss</option>
              <option value="inventory">Inventory Report</option>
            </select>
          </div>

                     <div className="flex items-end">
             <button
               className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
             >
               Generate Statement
             </button>
           </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">UGX {formatNumber(statementData.totalRevenue)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cost</p>
              <p className="text-2xl font-bold text-gray-900">UGX {formatNumber(statementData.totalCost)}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <TrendingDown size={24} className="text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Profit</p>
              <p className={`text-2xl font-bold ${statementData.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                UGX {formatNumber(statementData.totalProfit)}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              statementData.totalProfit >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <TrendingUp size={24} className={statementData.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{statementData.totalTransactions}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Activity size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Top Items */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Selling Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {statementData.topItems.map((item, index) => (
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    UGX {formatNumber(item.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Category Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statementData.categoryBreakdown.map((cat, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {cat.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cat.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      UGX {formatNumber(cat.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Daily Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transactions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statementData.dailyBreakdown.map((day, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {day.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {day.transactions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      UGX {formatNumber(day.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatementGenerator;

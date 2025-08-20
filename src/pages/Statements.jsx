import React, { useState } from 'react';
import { Calendar, FileText, Download } from 'lucide-react';
import StockStatement from '../components/statements/StockStatement';
import SalesStatement from '../components/statements/SalesStatement';

const Statements = ({ receipts, salesRecords }) => {
  const [reportType, setReportType] = useState('stock');
  const [timePeriod, setTimePeriod] = useState('this_month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

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

  const handlePrint = () => {
    // This will be handled by the individual statement components
    // We'll pass the date range to the appropriate component
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-500 mb-6">Financial Statements</h2>
      
      {/* Controls Section */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Report Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <div className="flex space-x-2">
              <button
                onClick={() => setReportType('stock')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  reportType === 'stock'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Stock
              </button>
              <button
                onClick={() => setReportType('sales')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  reportType === 'sales'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Sales
              </button>
            </div>
          </div>

          {/* Time Period Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md input focus:outline-none focus:ring-0 focus:border-green-500 transition-all"
            >
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="last_3_months">Last 3 Months</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Range */}
          {timePeriod === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md input focus:outline-none focus:ring-0 focus:border-green-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md input focus:outline-none focus:ring-0 focus:border-green-500 transition-all"
                />
              </div>
            </>
          )}
        </div>

        {/* Print Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Download size={16} className="mr-2" />
            Print Statement
          </button>
        </div>
      </div>

      {/* Statement Content */}
      <div>
        {reportType === 'stock' ? (
          <StockStatement
            receipts={receipts}
            timePeriod={timePeriod}
            customStartDate={customStartDate}
            customEndDate={customEndDate}
          />
        ) : (
          <SalesStatement
            salesRecords={salesRecords}
            timePeriod={timePeriod}
            customStartDate={customStartDate}
            customEndDate={customEndDate}
          />
        )}
      </div>
    </div>
  );
};

export default Statements;
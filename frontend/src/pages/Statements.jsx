import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Download } from 'lucide-react';
import StockStatement from '../components/statements/StockStatement';
import SalesStatement from '../components/statements/SalesStatement';
import Dropdown from '../components/shared/Dropdown';
import api from '../utils/api';

const Statements = () => {
  const [receipts, setReceipts] = useState([]);
  const [salesRecords, setSalesRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('stock');
  const [timePeriod, setTimePeriod] = useState('this_month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [receiptsRes, salesRes] = await Promise.all([
          api.get('/api/receipts'),
          api.get('/api/sales')
        ]);
        
        setReceipts(receiptsRes.data || []);
        setSalesRecords(salesRes.data || []);
      } catch (error) {
        console.error('Error fetching statement data:', error);
        setReceipts([]);
        setSalesRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePrint = () => {
    // This will be handled by the individual statement components
    // We'll pass the date range to the appropriate component
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Loading statements...</span>
        </div>
      </div>
    );
  }

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
            <Dropdown
              options={[
                { value: 'this_month', label: 'This Month' },
                { value: 'last_month', label: 'Last Month' },
                { value: 'last_3_months', label: 'Last 3 Months' },
                { value: 'custom', label: 'Custom Range' }
              ]}
              value={timePeriod}
              onChange={(value) => setTimePeriod(value)}
              placeholder="Select time period..."
            />
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

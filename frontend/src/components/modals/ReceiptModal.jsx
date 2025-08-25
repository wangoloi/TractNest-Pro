import React from 'react';
import { Printer } from 'lucide-react';
import { formatNumber } from '../../utils/formatNumber';

const ReceiptModal = ({ sale, onPrint }) => {
  const calculateSaleTotal = (items, discount = 0, tax = 0) => {
    const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
    const discountAmount = (subtotal * discount) / 100;
    const taxAmount = ((subtotal - discountAmount) * tax) / 100;
    return {
      subtotal,
      discountAmount,
      taxAmount,
      total: subtotal - discountAmount + taxAmount
    };
  };

  if (!sale) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg max-w-6xl mx-auto">
      <div className="bg-blue-500 p-6 rounded-t-xl">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Sales Receipt</h2>
          <button
            onClick={() => onPrint(sale)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Printer size={20} />
            Print Receipt
          </button>
        </div>
      </div>
      
      <div className="max-h-[80vh] overflow-y-auto custom-scrollbar p-8" style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#3B82F6 #E5E7EB'
      }}>
        <div className="bg-gray-50 p-8 rounded-xl border-2 border-gray-200">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">TrackNest Pro</h3>
            <p className="text-xl text-gray-600 mb-4">Sales Receipt</p>
            <div className="grid grid-cols-2 gap-8 text-lg">
              <div>
                <p className="text-gray-500">Date:</p>
                <p className="font-semibold">{new Date(sale.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Receipt #:</p>
                <p className="font-semibold">{sale.receiptNumber || sale.id}</p>
              </div>
            </div>
          </div>
          
          <div className="mb-8 p-6 bg-white rounded-lg border">
            <h4 className="text-xl font-semibold mb-4 text-gray-900">Customer Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600 mb-1">Customer Name:</p>
                <p className="text-lg font-semibold">{sale.customerName}</p>
              </div>
              {sale.customerPhone && (
                <div>
                  <p className="text-gray-600 mb-1">Phone Number:</p>
                  <p className="text-lg font-semibold">{sale.customerPhone}</p>
                </div>
              )}
              {sale.customerEmail && (
                <div className="md:col-span-2">
                  <p className="text-gray-600 mb-1">Email Address:</p>
                  <p className="text-lg font-semibold">{sale.customerEmail}</p>
                </div>
              )}
            </div>
          </div>
        
          <div className="mb-8">
            <h4 className="text-xl font-semibold mb-4 text-gray-900">Items Purchased</h4>
            <div className="bg-white rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-lg font-semibold text-gray-900">Item</th>
                    <th className="px-6 py-4 text-center text-lg font-semibold text-gray-900">Quantity</th>
                    <th className="px-6 py-4 text-center text-lg font-semibold text-gray-900">Unit Price</th>
                    <th className="px-6 py-4 text-right text-lg font-semibold text-gray-900">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-lg">{item.name}</td>
                      <td className="px-6 py-4 text-center text-lg">{item.quantity}</td>
                      <td className="px-6 py-4 text-center text-lg">UGX {formatNumber(item.price)}</td>
                      <td className="px-6 py-4 text-right text-lg font-semibold">UGX {formatNumber(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        
          {(() => {
            const totals = calculateSaleTotal(sale.items, sale.discount, sale.tax);
            return (
              <div className="mb-8 p-6 bg-white rounded-lg border">
                <h4 className="text-xl font-semibold mb-4 text-gray-900">Payment Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">UGX {formatNumber(totals.subtotal)}</span>
                  </div>
                  {sale.discount > 0 && (
                    <div className="flex justify-between text-lg text-green-600">
                      <span>Discount ({sale.discount}%):</span>
                      <span className="font-semibold">-UGX {formatNumber(totals.discountAmount)}</span>
                    </div>
                  )}
                  {sale.tax > 0 && (
                    <div className="flex justify-between text-lg">
                      <span className="text-gray-600">Tax ({sale.tax}%):</span>
                      <span className="font-semibold">UGX {formatNumber(totals.taxAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-2xl font-bold border-t pt-4 text-blue-600">
                    <span>Total Amount:</span>
                    <span>UGX {formatNumber(totals.total)}</span>
                  </div>
                </div>
              </div>
            );
          })()}
        
          <div className="mb-8 p-6 bg-white rounded-lg border">
            <h4 className="text-xl font-semibold mb-4 text-gray-900">Payment Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600 mb-1">Payment Method:</p>
                <p className="text-lg font-semibold capitalize">{sale.paymentMethod.replace('_', ' ')}</p>
              </div>
              {sale.notes && (
                <div className="md:col-span-2">
                  <p className="text-gray-600 mb-1">Additional Notes:</p>
                  <p className="text-lg">{sale.notes}</p>
                </div>
              )}
            </div>
          </div>
        
          <div className="text-center p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
            <p className="text-xl font-semibold text-blue-900 mb-2">Thank you for your business!</p>
            <p className="text-lg text-blue-700">Generated by TrackNest Pro</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;

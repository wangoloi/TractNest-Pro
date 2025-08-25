import React, { useState } from 'react';
import { 
  Package, 
  DollarSign,
  X,
  FileText,
  Save
} from 'lucide-react';
import { toast } from 'react-toastify';
import { formatNumber } from '../../../lib/utils/formatNumber';

const StockForm = ({ onSave, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    category: '',
    quantity: 1,
    costPrice: 0,
    sellingPrice: 0,
    supplier: '',
    supplierPhone: '',
    supplierEmail: '',
    receiptNumber: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || formData.quantity <= 0 || formData.costPrice <= 0 || formData.sellingPrice <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    const stockData = {
      ...formData,
      date: new Date().toISOString(),
      status: 'completed'
    };

    onSave(stockData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar" style={{
      scrollbarWidth: 'thin',
      scrollbarColor: '#3B82F6 #E5E7EB'
    }}>
      {/* Top Section - Date, Receipt No, Item Name */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date:
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="date"
              value={new Date().toISOString().split('T')[0]}
              readOnly
              className="w-full pl-12 pr-6 py-4 border-2 border-green-400 rounded-xl bg-gray-50 font-mono text-lg"
            />
          </div>
        </div>

        {/* Receipt Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Receipt No:
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={formData.receiptNumber}
              onChange={(e) => setFormData({...formData, receiptNumber: e.target.value})}
              className="w-full pl-12 pr-6 py-4 border-2 border-green-400 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-lg"
              placeholder="Enter receipt number"
            />
          </div>
        </div>

        {/* Item Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Item Name:
          </label>
          <div className="relative">
            <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full pl-12 pr-6 py-4 border-2 border-green-400 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-lg"
              placeholder="Enter item name"
            />
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">Stock Details</h3>
        
        {/* Items Table Header */}
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <div className="grid grid-cols-12 gap-4 items-center font-semibold text-gray-700">
            <div className="col-span-3">Item Name</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-2 text-center">Cost Price</div>
            <div className="col-span-2 text-center">Selling Price</div>
            <div className="col-span-2 text-center">Total Value</div>
            <div className="col-span-1 text-center">Actions</div>
          </div>
        </div>
        
        {/* Items List */}
        <div className="space-y-4 max-h-64 overflow-y-auto custom-scrollbar" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#3B82F6 #E5E7EB'
        }}>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-3">
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Item name"
                  />
                </div>
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center"
                  placeholder="Qty"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  min="0"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({...formData, costPrice: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center"
                  placeholder="Cost"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  min="0"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({...formData, sellingPrice: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center"
                  placeholder="Price"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="text"
                  value={`UGX ${formatNumber(formData.quantity * formData.sellingPrice)}`}
                  readOnly
                  className="w-full px-3 py-3 bg-gray-100 border border-gray-300 rounded-lg font-semibold text-center"
                  placeholder="Auto"
                />
              </div>
              <div className="col-span-1 flex justify-center">
                <button
                  type="button"
                  className="p-2 text-gray-400 cursor-not-allowed"
                  disabled
                  title="Single item form"
                >
                  <Package size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category:
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full pl-12 pr-6 py-4 border-2 border-green-400 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-lg"
            >
              <option value="">Select category</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Food">Food</option>
              <option value="Books">Books</option>
              <option value="Accessories">Accessories</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Supplier Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Supplier Name:
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={formData.supplier}
              onChange={(e) => setFormData({...formData, supplier: e.target.value})}
              className="w-full pl-12 pr-6 py-4 border-2 border-green-400 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-lg"
              placeholder="Enter supplier name"
            />
          </div>
        </div>

        {/* Supplier Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Supplier Phone:
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="tel"
              value={formData.supplierPhone}
              onChange={(e) => setFormData({...formData, supplierPhone: e.target.value})}
              className="w-full pl-12 pr-6 py-4 border-2 border-green-400 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-lg"
              placeholder="Enter supplier phone"
            />
          </div>
        </div>

        {/* Supplier Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Supplier Email:
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="email"
              value={formData.supplierEmail}
              onChange={(e) => setFormData({...formData, supplierEmail: e.target.value})}
              className="w-full pl-12 pr-6 py-4 border-2 border-green-400 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-lg"
              placeholder="Enter supplier email"
            />
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Notes:
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-4 text-gray-400" size={16} />
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            className="w-full pl-12 pr-6 py-4 border-2 border-green-400 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-lg"
            rows="4"
            placeholder="Enter any additional notes..."
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2"
        >
          <X size={16} />
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium flex items-center gap-2"
        >
          <Save size={16} />
          Add Stock
        </button>
      </div>
    </form>
  );
};

export default StockForm;

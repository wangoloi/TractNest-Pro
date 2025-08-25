import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Trash2,
  DollarSign,
  X,
  FileText,
  Save
} from 'lucide-react';
import { toast } from 'react-toastify';
import { formatNumber } from '../../utils/formatNumber';

const SaleForm = ({ onSave, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState(initialData || {
    receiptNumber: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    items: [{ id: 1, name: '', quantity: 1, price: 0, total: 0 }],
    paymentMethod: 'cash',
    discount: 0,
    tax: 0,
    notes: ''
  });

  // Helper functions
  const generateReceiptNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `RCP-${year}${month}${day}-${random}`;
  };

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

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Calculate total for this item
    if (field === 'quantity' || field === 'price') {
      const quantity = field === 'quantity' ? value : updatedItems[index].quantity;
      const price = field === 'price' ? value : updatedItems[index].price;
      updatedItems[index].total = quantity * price;
    }
    
    setFormData({ ...formData, items: updatedItems });
  };

  const addItem = () => {
    const newId = Math.max(...formData.items.map(item => item.id), 0) + 1;
    const newItem = { id: newId, name: '', quantity: 1, price: 0, total: 0 };
    setFormData({ ...formData, items: [...formData.items, newItem] });
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: updatedItems });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.customerName || formData.items.some(item => !item.name || item.price <= 0)) {
      toast.error('Please fill in all required fields');
      return;
    }

    const saleData = {
      ...formData,
      receiptNumber: formData.receiptNumber || generateReceiptNumber(),
      date: new Date().toISOString(),
      status: 'completed'
    };

    onSave(saleData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar" style={{
      scrollbarWidth: 'thin',
      scrollbarColor: '#3B82F6 #E5E7EB'
    }}>
      {/* Top Section - Date, Receipt No, Name */}
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
              value={formData.receiptNumber || generateReceiptNumber()}
              onChange={(e) => setFormData({...formData, receiptNumber: e.target.value})}
              className="w-full pl-12 pr-6 py-4 border-2 border-green-400 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 font-mono text-lg"
              placeholder="Auto-generated receipt number"
            />
          </div>
        </div>

        {/* Customer Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name:
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData({...formData, customerName: e.target.value})}
              className="w-full pl-12 pr-6 py-4 border-2 border-green-400 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-lg"
              placeholder="Enter customer name"
            />
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">Items</h3>
        
        {/* Items Table Header */}
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <div className="grid grid-cols-12 gap-4 items-center font-semibold text-gray-700">
            <div className="col-span-4">Item Name</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-2 text-center">Unit Price</div>
            <div className="col-span-2 text-center">Amount</div>
            <div className="col-span-2 text-center">Actions</div>
          </div>
        </div>
        
        {/* Items List */}
        <div className="space-y-4 max-h-64 overflow-y-auto custom-scrollbar" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#3B82F6 #E5E7EB'
        }}>
          {formData.items.map((item, index) => (
            <div key={item.id || index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-4">
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Item name"
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center"
                    placeholder="Qty"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    min="0"
                    value={item.price}
                    onChange={(e) => handleItemChange(index, 'price', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center"
                    placeholder="Price"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    value={item.total}
                    readOnly
                    className="w-full px-3 py-3 bg-gray-100 border border-gray-300 rounded-lg font-semibold text-center"
                    placeholder="Auto"
                  />
                </div>
                <div className="col-span-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={formData.items.length === 1}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Add Item Button */}
        <div className="mt-4">
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            <Plus size={16} />
            Add Item
          </button>
        </div>
      </div>

      {/* Additional Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Customer Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number:
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="tel"
              value={formData.customerPhone}
              onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
              className="w-full pl-12 pr-6 py-4 border-2 border-green-400 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-lg"
              placeholder="Enter phone number"
            />
          </div>
        </div>

        {/* Customer Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address:
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="email"
              value={formData.customerEmail}
              onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
              className="w-full pl-12 pr-6 py-4 border-2 border-green-400 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-lg"
              placeholder="Enter email address"
            />
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method:
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
              className="w-full pl-12 pr-6 py-4 border-2 border-green-400 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-lg"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>
        </div>

        {/* Total Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Amount:
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={`UGX ${formatNumber(calculateSaleTotal(formData.items, formData.discount, formData.tax).total)}`}
              readOnly
              className="w-full pl-12 pr-6 py-4 border-2 border-green-400 rounded-xl bg-gray-50 font-semibold text-lg"
            />
          </div>
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
          Complete Sale
        </button>
      </div>
    </form>
  );
};

export default SaleForm;

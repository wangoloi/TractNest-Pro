import React, { useState } from "react";
import { Package, Save, Plus, X, Trash2 } from "lucide-react";
import Dropdown from "./Dropdown";

const StockForm = ({ onSave, onCancel, existingItem = null, multiItemMode = false }) => {
  const [formData, setFormData] = useState({
    name: existingItem?.name || "",
    category: existingItem?.category || "",
    quantity: existingItem?.quantity || "",
    price: existingItem?.price || "",
    cost: existingItem?.cost || "",
    invoiceNumber: existingItem?.invoiceNumber || "",
    supplier: existingItem?.supplier || "",
    supplierPhone: existingItem?.supplierPhone || "",
    supplierEmail: existingItem?.supplierEmail || "",
  });

  // Receipt/Invoice and Supplier info for multi-item mode
  const [receiptInfo, setReceiptInfo] = useState({
    invoiceNumber: "",
    supplier: "",
    supplierPhone: "",
    supplierEmail: "",
  });

  // Temporary items for multi-item mode
  const [tempItems, setTempItems] = useState([]);
  const [errors, setErrors] = useState({});
  const [receiptErrors, setReceiptErrors] = useState({});

  const categories = [
    { value: "Electronics", label: "Electronics" },
    { value: "Clothing", label: "Clothing" },
    { value: "Food & Beverages", label: "Food & Beverages" },
    { value: "Home & Garden", label: "Home & Garden" },
    { value: "Sports & Outdoors", label: "Sports & Outdoors" },
    { value: "Books & Media", label: "Books & Media" },
    { value: "Automotive", label: "Automotive" },
    { value: "Health & Beauty", label: "Health & Beauty" },
    { value: "Toys & Games", label: "Toys & Games" },
    { value: "Office Supplies", label: "Office Supplies" },
    { value: "Other", label: "Other" },
  ];

  // Helper function to format numbers with commas
  const formatNumberForDisplay = (value) => {
    if (!value) return "";
    const numericValue = value.toString().replace(/,/g, '');
    if (isNaN(numericValue)) return value;
    return parseInt(numericValue).toLocaleString();
  };

  const handleInputChange = (field, value) => {
    // For numeric fields, store the raw value but display formatted
    if (['quantity', 'price', 'cost'].includes(field)) {
      // Remove commas and convert to number for storage
      const numericValue = value.replace(/,/g, '');
      setFormData((prev) => ({ ...prev, [field]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
    
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleReceiptInfoChange = (field, value) => {
    setReceiptInfo((prev) => ({ ...prev, [field]: value }));
    if (receiptErrors[field]) {
      setReceiptErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Item name is required";
    }

    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
    }

    if (!formData.quantity || parseFloat(formData.quantity.replace(/,/g, '')) <= 0) {
      newErrors.quantity = "Valid quantity is required";
    }

    if (!formData.price || parseFloat(formData.price.replace(/,/g, '')) <= 0) {
      newErrors.price = "Valid selling price is required";
    }

    if (!formData.cost || parseFloat(formData.cost.replace(/,/g, '')) <= 0) {
      newErrors.cost = "Valid cost price is required";
    }

    if (parseFloat(formData.price.replace(/,/g, '')) < parseFloat(formData.cost.replace(/,/g, ''))) {
      newErrors.price = "Selling price should be higher than cost price";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateReceiptInfo = () => {
    const newErrors = {};

    if (!receiptInfo.invoiceNumber.trim()) {
      newErrors.invoiceNumber = "Invoice number is required";
    }

    if (!receiptInfo.supplier.trim()) {
      newErrors.supplier = "Supplier name is required";
    }

    setReceiptErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

     const handleAddItem = () => {
     if (validateForm()) {
       const newItem = {
         id: Date.now(),
         ...formData,
         quantity: parseInt(formData.quantity.replace(/,/g, '')),
         price: parseInt(formData.price.replace(/,/g, '')),
         cost: parseInt(formData.cost.replace(/,/g, '')),
       };
      
      setTempItems([...tempItems, newItem]);
      
      // Reset form for next item
      setFormData({
        name: "",
        category: "",
        quantity: "",
        price: "",
        cost: "",
        invoiceNumber: "",
        supplier: "",
        supplierPhone: "",
        supplierEmail: "",
      });
      
      setErrors({});
    }
  };

  const handleRemoveItem = (itemId) => {
    setTempItems(tempItems.filter(item => item.id !== itemId));
  };

  const handleClearAll = () => {
    setTempItems([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (multiItemMode) {
      // In multi-item mode, validate receipt info and save all temporary items
      if (!validateReceiptInfo()) {
        return;
      }
      
      if (tempItems.length === 0) {
        alert("Please add at least one item before saving.");
        return;
      }

      // Apply receipt info to all items
      const itemsWithReceiptInfo = tempItems.map(item => ({
        ...item,
        invoiceNumber: receiptInfo.invoiceNumber,
        supplier: receiptInfo.supplier,
        supplierPhone: receiptInfo.supplierPhone,
        supplierEmail: receiptInfo.supplierEmail,
      }));

      onSave(itemsWithReceiptInfo);
    } else {
             // Single item mode - original behavior
       if (validateForm()) {
         const stockData = {
           ...formData,
           quantity: parseInt(formData.quantity.replace(/,/g, '')),
           price: parseInt(formData.price.replace(/,/g, '')),
           cost: parseInt(formData.cost.replace(/,/g, '')),
         };
         onSave(stockData);
       }
    }
  };

  const calculateTotalValue = () => {
    return tempItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTotalCost = () => {
    return tempItems.reduce((total, item) => total + (item.cost * item.quantity), 0);
  };

  const calculateTotalProfit = () => {
    return calculateTotalValue() - calculateTotalCost();
  };

  return (
    <div className="space-y-6">
      {/* Multi-item mode header */}
      {multiItemMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-blue-800">Multi-Item Stock Addition</h3>
              <p className="text-sm text-blue-600">Add multiple items to stock before saving</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-600">Items added: {tempItems.length}</p>
              <p className="text-lg font-bold text-blue-800">
                Total Value: UGX {calculateTotalValue().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Receipt/Invoice Information (Multi-item mode only) */}
      {multiItemMode && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Receipt/Invoice Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Number *
              </label>
              <input
                type="text"
                value={receiptInfo.invoiceNumber}
                onChange={(e) => handleReceiptInfoChange("invoiceNumber", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  receiptErrors.invoiceNumber ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter invoice number"
              />
              {receiptErrors.invoiceNumber && (
                <p className="text-red-500 text-sm mt-1">{receiptErrors.invoiceNumber}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier Name *
              </label>
              <input
                type="text"
                value={receiptInfo.supplier}
                onChange={(e) => handleReceiptInfoChange("supplier", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  receiptErrors.supplier ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter supplier name"
              />
              {receiptErrors.supplier && (
                <p className="text-red-500 text-sm mt-1">{receiptErrors.supplier}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier Phone
              </label>
              <input
                type="tel"
                value={receiptInfo.supplierPhone}
                onChange={(e) => handleReceiptInfoChange("supplierPhone", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter supplier phone"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier Email
              </label>
              <input
                type="email"
                value={receiptInfo.supplierEmail}
                onChange={(e) => handleReceiptInfoChange("supplierEmail", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter supplier email"
              />
            </div>
          </div>
        </div>
      )}

      {/* Current Items List (Multi-item mode only) */}
      {multiItemMode && tempItems.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Current Items ({tempItems.length})</h3>
            <button
              type="button"
              onClick={handleClearAll}
              className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              <Trash2 size={14} />
              Clear All
            </button>
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {tempItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-lg border">
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.category}</p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity} | Cost: UGX {item.cost.toLocaleString()} | Price: UGX {item.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">UGX {(item.price * item.quantity).toLocaleString()}</p>
                      <p className="text-sm text-gray-500">Profit: UGX {((item.price - item.cost) * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  className="ml-3 p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          
          {/* Summary */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Total Cost:</p>
                <p className="font-bold text-gray-800">UGX {calculateTotalCost().toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Total Value:</p>
                <p className="font-bold text-green-600">UGX {calculateTotalValue().toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Total Profit:</p>
                <p className="font-bold text-blue-600">UGX {calculateTotalProfit().toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Item Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter item name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <Dropdown
                options={categories}
                value={formData.category}
                onChange={(value) => handleInputChange("category", value)}
                placeholder="Select category"
                searchable={true}
                error={!!errors.category}
              />
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}
            </div>
          </div>
        </div>

        {/* Stock & Pricing */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Stock & Pricing
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
                             <input
                 type="text"
                 value={formatNumberForDisplay(formData.quantity)}
                 onChange={(e) => handleInputChange("quantity", e.target.value)}
                 className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                   errors.quantity ? "border-red-500" : "border-gray-300"
                 }`}
                 placeholder="Enter quantity"
               />
              {errors.quantity && (
                <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selling Price (UGX) *
              </label>
                             <input
                 type="text"
                 value={formatNumberForDisplay(formData.price)}
                 onChange={(e) => handleInputChange("price", e.target.value)}
                 className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                   errors.price ? "border-red-500" : "border-gray-300"
                 }`}
                 placeholder="Enter selling price"
               />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost Price (UGX) *
              </label>
                             <input
                 type="text"
                 value={formatNumberForDisplay(formData.cost)}
                 onChange={(e) => handleInputChange("cost", e.target.value)}
                 className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                   errors.cost ? "border-red-500" : "border-gray-300"
                 }`}
                 placeholder="Enter cost price"
               />
              {errors.cost && (
                <p className="text-red-500 text-sm mt-1">{errors.cost}</p>
              )}
            </div>
          </div>

                     {/* Profit Calculation */}
           {formData.price && formData.cost && parseFloat(formData.price.replace(/,/g, '')) > 0 && parseFloat(formData.cost.replace(/,/g, '')) > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Profit per unit:
                </span>
                                 <span
                   className={`text-lg font-bold ${
                     parseFloat(formData.price.replace(/,/g, '')) - parseFloat(formData.cost.replace(/,/g, '')) >= 0
                       ? "text-green-600"
                       : "text-red-600"
                   }`}
                 >
                   UGX {(parseFloat(formData.price.replace(/,/g, '')) - parseFloat(formData.cost.replace(/,/g, ''))).toLocaleString()}
                 </span>
               </div>
               <div className="flex justify-between items-center mt-1">
                 <span className="text-sm font-medium text-gray-700">
                   Total profit:
                 </span>
                 <span
                   className={`text-lg font-bold ${
                     (parseFloat(formData.price.replace(/,/g, '')) - parseFloat(formData.cost.replace(/,/g, ''))) * parseFloat(formData.quantity.replace(/,/g, '')) >= 0
                       ? "text-green-600"
                       : "text-red-600"
                   }`}
                 >
                   UGX{" "}
                   {(
                     (parseFloat(formData.price.replace(/,/g, '')) - parseFloat(formData.cost.replace(/,/g, ''))) *
                     parseFloat(formData.quantity.replace(/,/g, ''))
                   ).toLocaleString()}
                 </span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          
          {multiItemMode ? (
            <>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus size={16} />
                Add Item
              </button>
              <button
                type="submit"
                disabled={tempItems.length === 0}
                className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                Save All Items ({tempItems.length})
              </button>
            </>
          ) : (
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Save size={16} />
              {existingItem ? "Update Stock" : "Add Stock"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default StockForm;

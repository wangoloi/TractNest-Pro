import React, { useState } from "react";
import { Package, Save } from "lucide-react";
import Dropdown from "./Dropdown";

const StockForm = ({ onSave, onCancel, existingItem = null }) => {
  const [formData, setFormData] = useState({
    name: existingItem?.name || "",
    category: existingItem?.category || "",
    quantity: existingItem?.quantity || 0,
    price: existingItem?.price || 0,
    cost: existingItem?.cost || 0,
    invoiceNumber: existingItem?.invoiceNumber || "",
    supplier: existingItem?.supplier || "",
    supplierPhone: existingItem?.supplierPhone || "",
    supplierEmail: existingItem?.supplierEmail || "",
  });

  const [errors, setErrors] = useState({});

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

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
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

    if (!formData.quantity || formData.quantity < 0) {
      newErrors.quantity = "Valid quantity is required";
    }

    if (!formData.price || formData.price < 0) {
      newErrors.price = "Valid selling price is required";
    }

    if (!formData.cost || formData.cost < 0) {
      newErrors.cost = "Valid cost price is required";
    }

    if (formData.price < formData.cost) {
      newErrors.price = "Selling price should be higher than cost price";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const stockData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        price: parseInt(formData.price),
        cost: parseInt(formData.cost),
      };
      onSave(stockData);
    }
  };

  return (
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
              Invoice Number
            </label>
            <input
              type="text"
              value={formData.invoiceNumber}
              onChange={(e) =>
                handleInputChange("invoiceNumber", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter invoice number (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity *
            </label>
            <input
              type="number"
              min="0"
              value={formData.quantity}
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selling Price (UGX) *
            </label>
            <input
              type="number"
              min="0"
              value={formData.price}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cost Price (UGX) *
            </label>
            <input
              type="number"
              min="0"
              value={formData.cost}
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
        {formData.price && formData.cost && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Profit per unit:
              </span>
              <span
                className={`text-lg font-bold ${
                  formData.price - formData.cost >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                UGX {(formData.price - formData.cost).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm font-medium text-gray-700">
                Total profit:
              </span>
              <span
                className={`text-lg font-bold ${
                  (formData.price - formData.cost) * formData.quantity >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                UGX{" "}
                {(
                  (formData.price - formData.cost) *
                  formData.quantity
                ).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Supplier Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Supplier Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supplier Name
            </label>
            <input
              type="text"
              value={formData.supplier}
              onChange={(e) => handleInputChange("supplier", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter supplier name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supplier Phone
            </label>
            <input
              type="tel"
              value={formData.supplierPhone}
              onChange={(e) =>
                handleInputChange("supplierPhone", e.target.value)
              }
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
              value={formData.supplierEmail}
              onChange={(e) =>
                handleInputChange("supplierEmail", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter supplier email"
            />
          </div>
        </div>
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
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Save size={16} />
          {existingItem ? "Update Stock" : "Add Stock"}
        </button>
      </div>
    </form>
  );
};

export default StockForm;

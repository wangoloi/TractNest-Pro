import React, { useState } from "react";
import { Plus, Trash2, ShoppingCart } from "lucide-react";
import Dropdown from "./Dropdown";

const SaleForm = ({
  onSave,
  onCancel,
  inventory = [],
  existingSale = null,
}) => {
  // Generate sequential receipt number
  const generateReceiptNumber = () => {
    // Get existing sales from localStorage or use empty array
    const existingSales = JSON.parse(localStorage.getItem("sales") || "[]");

    // Get today's date
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const dateString = `${year}${month}${day}`;

    // Filter sales for today
    const todaySales = existingSales.filter((sale) => {
      const saleDate = new Date(sale.date);
      const saleDateString = `${saleDate.getFullYear()}${String(
        saleDate.getMonth() + 1
      ).padStart(2, "0")}${String(saleDate.getDate()).padStart(2, "0")}`;
      return saleDateString === dateString;
    });

    // Get the next sequence number
    const nextSequence = todaySales.length + 1;
    const sequence = String(nextSequence).padStart(4, "0");

    return `${sequence}`;
  };

  const [formData, setFormData] = useState({
    receiptNumber: existingSale?.receiptNumber || generateReceiptNumber(),
    customerName: existingSale?.customerName || "",
    customerPhone: existingSale?.customerPhone || "",
    customerEmail: existingSale?.customerEmail || "",
    paymentMethod: existingSale?.paymentMethod || "cash",
    items: existingSale?.items || [
      { name: "", quantity: 1, price: 0, total: 0 },
    ],
    notes: existingSale?.notes || "",
  });

  const [errors, setErrors] = useState({});

  const paymentMethods = [
    { value: "cash", label: "Cash" },
    { value: "mobile_money", label: "Mobile Money" },
    { value: "card", label: "Card" },
    { value: "bank_transfer", label: "Bank Transfer" },
  ];

  // Convert inventory to dropdown options
  const inventoryOptions = inventory.map((item) => ({
    value: item.name,
    label: `${item.name} - UGX ${item.price.toLocaleString()} (${
      item.quantity
    } in stock)`,
    price: item.price,
    availableQuantity: item.quantity,
  }));

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // If item name changed, auto-fill price from inventory
    if (field === "name") {
      const selectedItem = inventory.find((item) => item.name === value);
      if (selectedItem) {
        updatedItems[index].price = selectedItem.price;
        updatedItems[index].total =
          updatedItems[index].quantity * selectedItem.price;
      }
    }

    // Calculate total for this item
    if (field === "quantity" || field === "price") {
      const quantity =
        field === "quantity" ? value : updatedItems[index].quantity;
      const price = field === "price" ? value : updatedItems[index].price;
      updatedItems[index].total = quantity * price;
    }

    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { name: "", quantity: 1, price: 0, total: 0 }],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.receiptNumber.trim()) {
      newErrors.receiptNumber = "Receipt number is required";
    }

    if (!formData.customerName.trim()) {
      newErrors.customerName = "Customer name is required";
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = "Customer phone is required";
    }

    formData.items.forEach((item, index) => {
      if (!item.name.trim()) {
        newErrors[`item${index}Name`] = "Item name is required";
      }
      if (!item.quantity || item.quantity <= 0) {
        newErrors[`item${index}Quantity`] = "Valid quantity is required";
      }
      if (!item.price || item.price <= 0) {
        newErrors[`item${index}Price`] = "Valid price is required";
      }

      // Check stock availability
      const inventoryItem = inventory.find((inv) => inv.name === item.name);
      if (inventoryItem && item.quantity > inventoryItem.quantity) {
        newErrors[
          `item${index}Quantity`
        ] = `Only ${inventoryItem.quantity} available in stock`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const saleData = {
        ...formData,
        total: calculateTotal(),
        date: existingSale?.date || new Date().toISOString(),
        status: existingSale?.status || "completed",
      };
      onSave(saleData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Receipt Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Receipt Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Receipt Number *
            </label>
            <input
              type="text"
              value={formData.receiptNumber}
              onChange={(e) =>
                handleInputChange("receiptNumber", e.target.value)
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.receiptNumber ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter receipt number"
            />
            {errors.receiptNumber && (
              <p className="text-red-500 text-sm mt-1">
                {errors.receiptNumber}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <Dropdown
              options={paymentMethods}
              value={formData.paymentMethod}
              onChange={(value) => handleInputChange("paymentMethod", value)}
              placeholder="Select payment method"
              searchable={false}
            />
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Customer Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name *
            </label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) =>
                handleInputChange("customerName", e.target.value)
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.customerName ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter customer name"
            />
            {errors.customerName && (
              <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              value={formData.customerPhone}
              onChange={(e) =>
                handleInputChange("customerPhone", e.target.value)
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.customerPhone ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter phone number"
            />
            {errors.customerPhone && (
              <p className="text-red-500 text-sm mt-1">
                {errors.customerPhone}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={formData.customerEmail}
              onChange={(e) =>
                handleInputChange("customerEmail", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter email address"
            />
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Items</h3>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus size={16} />
            Add Item
          </button>
        </div>

        <div className="space-y-4">
          {formData.items.map((item, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg border border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name *
                  </label>
                  <Dropdown
                    options={inventoryOptions}
                    value={item.name}
                    onChange={(value) => handleItemChange(index, "name", value)}
                    placeholder="Select item from inventory"
                    searchable={true}
                    error={!!errors[`item${index}Name`]}
                  />
                  {errors[`item${index}Name`] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[`item${index}Name`]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "quantity",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors[`item${index}Quantity`]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Qty"
                  />
                  {errors[`item${index}Quantity`] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[`item${index}Quantity`]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (UGX) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={item.price}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "price",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors[`item${index}Price`]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Price"
                  />
                  {errors[`item${index}Price`] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[`item${index}Price`]}
                    </p>
                  )}
                </div>

                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total (UGX)
                    </label>
                    <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                      {item.total.toLocaleString()}
                    </div>
                  </div>

                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange("notes", e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Add any additional notes..."
        />
      </div>

      {/* Total */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">
            Total Amount:
          </span>
          <span className="text-2xl font-bold text-blue-600">
            UGX {calculateTotal().toLocaleString()}
          </span>
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
          className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <ShoppingCart size={16} />
          {existingSale ? "Update Sale" : "Complete Sale"}
        </button>
      </div>
    </form>
  );
};

export default SaleForm;

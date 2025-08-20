import React, { useState, useEffect } from 'react';
import { Search, Printer } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatNumber } from '../../utils/formatNumber';
import { normalizeName } from '../../utils/normalizeName';

const StockingPlus = ({
  stockItems,
  setStockItems,
  receipts,
  setReceipts,
  totalStockAmount,
  setTotalStockAmount,
}) => {

  // Receipt info states
  const [receiptNumber, setReceiptNumber] = useState('');
  const [receiptDate, setReceiptDate] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyContact, setCompanyContact] = useState('');
  
  // Item entry states
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  
  // Receipt's total
  const [receiptTotal, setReceiptTotal] = useState(0);
  
  // For editing items
  const [editItemId, setEditItemId] = useState(null);
  const [editItemName, setEditItemName] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editUnitPrice, setEditUnitPrice] = useState('');

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Generate receipt number on component mount
  useEffect(() => {
    // Get the last receipt number from localStorage or set default
    const lastReceiptNumber = localStorage.getItem('lastReceiptNumber') || '000';
    const nextNumber = String(parseInt(lastReceiptNumber) + 1).padStart(3, '0');
    setReceiptNumber(`REC-${nextNumber}`);
  }, []);

  const handleAddItem = () => {
    if (!itemName || !quantity || !unitPrice) return;

    const qty = parseFloat(quantity);
    const price = parseFloat(unitPrice);
    const amount = qty * price;

    const newItem = {
      id: Date.now(),
      name: itemName,
      qty,
      price,
      amount,
    };
    setStockItems([...stockItems, newItem]);

    const newTotal = parseFloat(receiptTotal) + amount;
    setReceiptTotal(newTotal);

    setItemName('');
    setQuantity('');
    setUnitPrice('');
  };

  const handleSaveReceipt = () => {
    if (!receiptNumber || !receiptDate || !companyName) {
      alert('Please fill in all required receipt details.');
      return;
    }
    if (stockItems.length === 0) {
      alert('Please add at least one item before saving the receipt.');
      return;
    }

    const newReceipt = {
      id: receiptNumber,
      date: receiptDate,
      company: companyName,
      contact: companyContact,
      items: [...stockItems],
      total: receiptTotal,
    };
    setReceipts([...receipts, newReceipt]);

    // Update grand total
    const newGrandTotal = parseFloat(totalStockAmount) + receiptTotal;
    setTotalStockAmount(newGrandTotal);

    // Generate new receipt number for next receipt
    // Get the last receipt number from localStorage and increment
    const lastReceiptNumber = localStorage.getItem('lastReceiptNumber') || '000';
    const nextNumber = String(parseInt(lastReceiptNumber) + 1).padStart(3, '0');
    localStorage.setItem('lastReceiptNumber', nextNumber);
    
    // Generate new receipt number for next receipt
    const nextNextNumber = String(parseInt(nextNumber) + 1).padStart(3, '0');
    setReceiptNumber(`REC-${nextNextNumber}`);

    // Reset receipt info and items
    setReceiptDate('');
    setCompanyName('');
    setCompanyContact('');
    setStockItems([]);
    setReceiptTotal(0);
  };

  // Handle delete item
  const handleDeleteItem = (id) => {
    const itemToDelete = stockItems.find(item => item.id === id);
    if (!itemToDelete) return;
    setStockItems(stockItems.filter(item => item.id !== id));
    setReceiptTotal(prev => prev - itemToDelete.amount);
  };

  // Handle start editing an item
  const handleEditItem = (item) => {
    setEditItemId(item.id);
    setEditItemName(item.name);
    setEditQuantity(item.qty);
    setEditUnitPrice(item.price);
  };

  // Handle save edited item
  const handleSaveEdit = () => {
    if (!editItemName || !editQuantity || !editUnitPrice) return;
    const qty = parseFloat(editQuantity);
    const price = parseFloat(editUnitPrice);
    const amount = qty * price;

    setStockItems(
      stockItems.map(item => 
        item.id === editItemId ? { ...item, name: editItemName, qty, price, amount } : item
      )
    );
    // Recalculate receipt total
    const newTotal = stockItems.reduce((sum, item) => 
      item.id === editItemId ? sum - item.amount + amount : sum + item.amount
    , 0);
    setReceiptTotal(newTotal);
    setEditItemId(null);
  };

  // Filter items based on search term
  const filteredItems = stockItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle print functionality
  const handlePrint = () => {
    // Create a new jsPDF instance
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Stocking Receipt', 105, 20, { align: 'center' });
    
    // Add receipt details
    doc.setFontSize(12);
    doc.text(`Receipt Number: ${receiptNumber}`, 20, 35);
    doc.text(`Date: ${receiptDate}`, 20, 45);
    doc.text(`Company: ${companyName}`, 20, 55);
    if (companyContact) {
      doc.text(`Contact: ${companyContact}`, 20, 65);
    }
    
    // Add items table
    if (stockItems.length > 0) {
      const itemsData = stockItems.map(item => [
        item.name,
        item.qty.toString(),
        `UGX ${formatNumber(item.price)}`,
        `UGX ${formatNumber(item.amount)}`
      ]);
      
      autoTable(doc, {
        startY: 75,
        head: [['Item Name', 'Quantity', 'Unit Price', 'Amount']],
        body: itemsData,
        theme: 'grid',
        styles: {
          fontSize: 10
        },
        headStyles: {
          fillColor: [72, 187, 120] // Green color
        }
      });
      
      // Add total
      const finalY = doc.lastAutoTable.finalY || 75;
      doc.setFontSize(14);
      doc.text(`Total: UGX ${formatNumber(receiptTotal)}`, 150, finalY + 15);
    } else {
      doc.text('No items added to this receipt.', 20, 85);
    }
    
    // Save the PDF
    doc.save(`receipt-${receiptNumber}.pdf`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Stocking Plus</h2>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
        >
          <Printer size={16} className="mr-2" />
          Print Receipt
        </button>
      </div>
      
      {/* Receipt Details */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Receipt Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Number</label>
            <input
              type="text"
              placeholder="Receipt Number"
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md input focus:outline-none focus:ring-0 focus:border-green-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              placeholder="Date"
              value={receiptDate}
              onChange={(e) => setReceiptDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md input focus:outline-none focus:ring-0 focus:border-green-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input
              type="text"
              placeholder="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md input focus:outline-none focus:ring-0 focus:border-green-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact (optional)</label>
            <input
              type="text"
              placeholder="Contact"
              value={companyContact}
              onChange={(e) => setCompanyContact(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md input focus:outline-none focus:ring-0 focus:border-green-500 transition-all"
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={handleSaveReceipt} 
              className="w-full py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Save Receipt
            </button>
          </div>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-gray-400" size={20} />
          </div>
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md input focus:outline-none focus:ring-0 focus:border-green-500 transition-all"
          />
        </div>
      </div>
      
      {/* Item Entry */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Items</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  {/* If this item is being edited, show input fields */}
                  {editItemId === item.id ? (
                    <>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="text"
                          value={editItemName}
                          onChange={(e) => setEditItemName(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md input focus:outline-none focus:ring-0 focus:border-green-500 transition-all"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="number"
                          value={editQuantity}
                          onChange={(e) => setEditQuantity(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md input focus:outline-none focus:ring-0 focus:border-green-500 transition-all"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="number"
                          value={editUnitPrice}
                          onChange={(e) => setEditUnitPrice(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md input focus:outline-none focus:ring-0 focus:border-green-500 transition-all"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">UGX { formatNumber(parseFloat(editQuantity) * parseFloat(editUnitPrice)) }</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button 
                          onClick={handleSaveEdit} 
                          className="mr-2 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => setEditItemId(null)} 
                          className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.qty}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">UGX {formatNumber(item.price)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">UGX {formatNumber(item.amount)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <button 
                          onClick={() => handleEditItem(item)} 
                          className="mr-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteItem(item.id)} 
                          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Add Item */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Add New Item</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
            <input
              type="text"
              placeholder="Item Name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md input focus:outline-none focus:ring-0 focus:border-green-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md input focus:outline-none focus:ring-0 focus:border-green-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
            <input
              type="number"
              placeholder="Unit Price"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md input focus:outline-none focus:ring-0 focus:border-green-500 transition-all"
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={handleAddItem} 
              className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Add Stock Item
            </button>
          </div>
        </div>
      </div>
      
      {/* Totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800">Receipt Total</h3>
          <p className="text-2xl font-bold text-blue-600">UGX {formatNumber(receiptTotal)}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800">Grand Total Stocked Amount</h3>
          <p className="text-2xl font-bold text-green-600">UGX {formatNumber(totalStockAmount)}</p>
        </div>
      </div>
    </div>
  );
};

export default StockingPlus;
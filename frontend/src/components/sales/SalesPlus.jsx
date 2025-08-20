import React, { useState, useEffect } from 'react';
import { Search, Printer } from 'lucide-react';
import RemainingStockSummary from '../stocking/RemainingStockSummary';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatNumber } from '../../utils/formatNumber';
import api from '@utils/api';

const SalesPlus = ({
  salesRecords,
  setSalesRecords,
  totalSales,
  setTotalSales,
  stockData,
  stockItems,
  setStockItems,
}) => {

  // Sale info states
  const [saleDate, setSaleDate] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  
  // Item entry states
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  
  // Sale's items and total
  const [saleItems, setSaleItems] = useState([]);
  const [saleTotal, setSaleTotal] = useState(0);
  const [saleProfit, setSaleProfit] = useState(0);

  // For editing items
  const [editItemId, setEditItemId] = useState(null);
  const [editItemName, setEditItemName] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editUnitPrice, setEditUnitPrice] = useState('');

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [showStockSummary, setShowStockSummary] = useState(false);

  // Generate invoice number on component mount
  useEffect(() => {
    // Get the last invoice number from localStorage or set default
    const lastInvoiceNumber = localStorage.getItem('lastInvoiceNumber') || '000';
    const nextNumber = String(parseInt(lastInvoiceNumber) + 1).padStart(3, '0');
    setInvoiceNumber(`INV-${nextNumber}`);
  }, []);

  // Get available items for sale (items with quantity > 0)
  const availableItems = stockItems.filter(item => item.qty > 0);

  // Filter items based on search term
  const filteredItems = availableItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleItemSelect = (e) => {
    const itemName = e.target.value;
    setSelectedItem(itemName);
    if (itemName && stockData[itemName]) {
      setUnitPrice(stockData[itemName]);
    }
  };

  const handleItemSelectFromSummary = (itemName) => {
    setSelectedItem(itemName);
    if (itemName && stockData[itemName]) {
      setUnitPrice(stockData[itemName]);
      setSearchTerm(''); // Clear search after selection
    }
  };

  const handleAddItem = () => {
    if (!selectedItem || !quantity || !unitPrice) return;

    const qty = parseFloat(quantity);
    const price = parseFloat(unitPrice);
    const amount = qty * price;
    
    // Calculate profit (using 20% as a default profit margin for demo)
    const profit = amount * 0.2;

    const newItem = {
      id: Date.now(),
      name: selectedItem,
      qty,
      price,
      amount,
      profit,
    };
    setSaleItems([...saleItems, newItem]);

    const newTotal = parseFloat(saleTotal) + amount;
    const newProfit = parseFloat(saleProfit) + profit;
    setSaleTotal(newTotal);
    setSaleProfit(newProfit);

    setSelectedItem('');
    setQuantity('');
    setUnitPrice('');
    setSearchTerm(''); // Clear search after selection
  };

  const handleSaveSale = async () => {
    if (!saleDate || !customerName) {
      alert('Please fill in all required sale details.');
      return;
    }
    if (saleItems.length === 0) {
      alert('Please add at least one item before saving the sale.');
      return;
    }

    const payload = {
      invoiceNo: invoiceNumber,
      date: saleDate,
      customer: customerName,
      items: saleItems.map(it => ({ name: it.name, qty: it.qty, price: it.price }))
    };
    const { data } = await api.post('/api/invoices', payload);
    setSalesRecords([...salesRecords, data]);
    try {
      const invRes = await api.get('/api/inventory');
      setStockItems(invRes.data || []);
    } catch (_) {}

    // Update total sales
    const newTotalSales = {
      amount: totalSales.amount + saleTotal,
      profit: totalSales.profit + saleProfit,
    };
    setTotalSales(newTotalSales);

    // Update stock items (reduce quantities)
    const updatedStockItems = [...stockItems];
    saleItems.forEach(saleItem => {
      const stockItemIndex = updatedStockItems.findIndex(item => item.name === saleItem.name);
      if (stockItemIndex !== -1) {
        updatedStockItems[stockItemIndex].qty -= saleItem.qty;
        updatedStockItems[stockItemIndex].amount = 
          updatedStockItems[stockItemIndex].qty * updatedStockItems[stockItemIndex].price;
      }
    });
    setStockItems(updatedStockItems);

    // Generate new invoice number for next sale
    // Get the last invoice number from localStorage and increment
    const lastInvoiceNumber = localStorage.getItem('lastInvoiceNumber') || '000';
    const nextNumber = String(parseInt(lastInvoiceNumber) + 1).padStart(3, '0');
    localStorage.setItem('lastInvoiceNumber', nextNumber);
    
    // Generate new invoice number for next sale
    const nextNextNumber = String(parseInt(nextNumber) + 1).padStart(3, '0');
    setInvoiceNumber(`INV-${nextNextNumber}`);

    // Reset sale info and items
    setSaleDate('');
    setCustomerName('');
    setSaleItems([]);
    setSaleTotal(0);
    setSaleProfit(0);
  };

  // Handle delete item
  const handleDeleteItem = (id) => {
    const itemToDelete = saleItems.find(item => item.id === id);
    if (!itemToDelete) return;
    setSaleItems(saleItems.filter(item => item.id !== id));
    setSaleTotal(prev => prev - itemToDelete.amount);
    setSaleProfit(prev => prev - itemToDelete.profit);
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
    const profit = amount * 0.2; // 20% profit margin

    setSaleItems(
      saleItems.map(item => 
        item.id === editItemId ? { ...item, name: editItemName, qty, price, amount, profit } : item
      )
    );
    
    // Recalculate sale total and profit
    const newTotal = saleItems.reduce((sum, item) => 
      item.id === editItemId ? sum - item.amount + amount : sum + item.amount
    , 0);
    const newProfit = saleItems.reduce((sum, item) => 
      item.id === editItemId ? sum - item.profit + profit : sum + item.profit
    , 0);
    setSaleTotal(newTotal);
    setSaleProfit(newProfit);
    setEditItemId(null);
  };

  // Handle print functionality
  const handlePrint = () => {
    // Create a new jsPDF instance
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Sales Invoice', 105, 20, { align: 'center' });
    
    // Add invoice details
    doc.setFontSize(12);
    doc.text(`Invoice Number: ${invoiceNumber}`, 20, 35);
    doc.text(`Date: ${saleDate}`, 20, 45);
    doc.text(`Customer: ${customerName}`, 20, 55);
    
    // Add items table
    if (saleItems.length > 0) {
      const itemsData = saleItems.map(item => [
        item.name,
        item.qty.toString(),
        `UGX ${formatNumber(item.price)}`,
        `UGX ${formatNumber(item.amount)}`,
        `UGX ${formatNumber(item.profit)}`
      ]);
      
      autoTable(doc, {
        startY: 65,
        head: [['Item Name', 'Quantity', 'Unit Price', 'Amount', 'Profit']],
        body: itemsData,
        theme: 'grid',
        styles: {
          fontSize: 10
        },
        headStyles: {
          fillColor: [72, 187, 120] // Green color
        }
      });
      
      // Add totals
      const finalY = doc.lastAutoTable.finalY || 65;
      doc.setFontSize(14);
      doc.text(`Total: UGX ${formatNumber(saleTotal)}`, 150, finalY + 15);
      doc.text(`Profit: UGX ${formatNumber(saleProfit)}`, 150, finalY + 25);
    } else {
      doc.text('No items added to this sale.', 20, 75);
    }
    
    // Save the PDF
    doc.save(`invoice-${invoiceNumber}.pdf`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Sales Plus</h2>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
        >
          <Printer size={16} className="mr-2" />
          Print Invoice
        </button>
      </div>
      
      {/* Sale Details */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Sale Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
            <input
              type="text"
              value={invoiceNumber}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-md input bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md input focus:outline-none focus:ring-0 focus:border-green-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
            <input
              type="text"
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md input focus:outline-none focus:ring-0 focus:border-green-500 transition-all"
            />
          </div>
        </div>
        <div className="mt-4">
          <button 
            onClick={handleSaveSale} 
            className="w-full py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            Save Sale
          </button>
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {saleItems.map((item) => (
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
                      <td className="px-4 py-3 whitespace-nowrap">UGX {formatNumber(parseFloat(editQuantity) * parseFloat(editUnitPrice))}</td>
                      <td className="px-4 py-3 whitespace-nowrap">UGX {formatNumber((parseFloat(editQuantity) * parseFloat(editUnitPrice)) * 0.2)}</td>
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
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">UGX {formatNumber(item.profit)}</td>
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
            <div className="relative">
              <select
                value={selectedItem}
                onChange={handleItemSelect}
                className="w-full p-2 border border-gray-300 rounded-md appearance-none bg-white select focus:outline-none focus:ring-0 focus:border-green-500 transition-all"
              >
                <option value="">Select Item</option>
                {filteredItems.map(item => (
                  <option key={item.id} value={item.name}>
                    {item.name} - Available: {item.qty} units
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
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
              Add Sale Item
            </button>
          </div>
        </div>
      </div>
      
      {/* Remaining Stock Summary */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Remaining Stock</h3>
          <button
            onClick={() => setShowStockSummary(!showStockSummary)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            {showStockSummary ? 'Hide Summary' : 'Show Summary'}
          </button>
        </div>
        
        {showStockSummary && (
          <RemainingStockSummary 
            stockItems={stockItems} 
            onItemSelect={handleItemSelectFromSummary}
          />
        )}
      </div>
      
      {/* Totals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800">Sale Total</h3>
          <p className="text-2xl font-bold text-blue-600">UGX {formatNumber(saleTotal)}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800">Sale Profit</h3>
          <p className="text-2xl font-bold text-green-600">UGX {formatNumber(saleProfit)}</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800">Total Sales</h3>
          <p className="text-lg font-bold text-purple-600">Amount: UGX {formatNumber(totalSales.amount)}</p>
          <p className="text-lg font-bold text-purple-600">Profit: UGX {formatNumber(totalSales.profit)}</p>
        </div>
      </div>
    </div>
  );
};

export default SalesPlus;

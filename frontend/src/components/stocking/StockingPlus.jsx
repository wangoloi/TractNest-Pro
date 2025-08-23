import React, { useState, useEffect } from 'react';
import { Search, Printer, Save, AlertCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatNumber } from '../../utils/formatNumber';

import api from '@utils/api';
import { toast } from 'react-toastify';

const StockingPlus = ({
  stockItems,
  setStockItems,

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
  const [isSaving, setIsSaving] = useState(false);

  // Generate receipt number on component mount
  useEffect(() => {
    // Get the last receipt number from localStorage or set default
    const lastReceiptNumber = localStorage.getItem('lastReceiptNumber') || '000';
    const nextNumber = String(parseInt(lastReceiptNumber) + 1).padStart(3, '0');
    setReceiptNumber(`REC-${nextNumber}`);
  }, []);

  const handleAddItem = () => {
    if (!itemName.trim()) {
      toast.error('Please enter an item name');
      return;
    }
    if (!quantity || parseFloat(quantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }
    if (!unitPrice || parseFloat(unitPrice) <= 0) {
      toast.error('Please enter a valid unit price');
      return;
    }

    const qty = parseFloat(quantity);
    const price = parseFloat(unitPrice);
    const amount = qty * price;

    // Check if item already exists in current receipt
    const existingItem = stockItems.find(item => 
      item.name.toLowerCase() === itemName.trim().toLowerCase()
    );

    if (existingItem) {
      toast.error('Item already exists in this receipt. Please edit the existing item instead.');
      return;
    }

    const newItem = {
      id: Date.now(),
      name: itemName.trim(),
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
    
    toast.success('Item added to receipt');
  };

  const handleSaveReceipt = async () => {
    if (!receiptNumber || !receiptDate || !companyName) {
      toast.error('Please fill in all required receipt details.');
      return;
    }
    if (stockItems.length === 0) {
      toast.error('Please add at least one item before saving the receipt.');
      return;
    }

    setIsSaving(true);
    try {
             // First, save the receipt
       const receiptPayload = {
         receiptNo: receiptNumber,
         date: receiptDate,
         company: companyName,
         contact: companyContact,
         items: stockItems.map(it => ({ name: it.name, qty: it.qty, price: it.price }))
       };
       
       console.log('📋 Saving receipt payload:', receiptPayload);
       try {
         const { data: receiptData } = await api.post('/api/receipts', receiptPayload);
         console.log('✅ Receipt saved successfully:', receiptData);
         // Add the new receipt to the receipts list
         setReceipts(prevReceipts => [...prevReceipts, receiptData]);
       } catch (receiptError) {
         console.error('❌ Receipt save failed:', receiptError);
         console.error('❌ Receipt error details:', {
           message: receiptError.message,
           response: receiptError.response?.data,
           status: receiptError.response?.status
         });
         throw new Error(`Receipt save failed: ${receiptError.response?.data?.error || receiptError.message}`);
       }

      // Then, save each item to inventory database
      const inventoryPromises = stockItems.map(async (item) => {
        try {
                     // First, check if item already exists in inventory
           console.log('🔍 Checking for existing item:', item.name);
           const existingItems = await api.get('/api/inventory');
           const existingItem = existingItems.data.find(existing => 
             existing.name.toLowerCase() === item.name.toLowerCase()
           );
           console.log('🔍 Existing item found:', existingItem ? 'Yes' : 'No');

          if (existingItem) {
                                      // Update existing item quantity
             const newQuantity = existingItem.quantity + item.qty;
             const updatePayload = {
               quantity: Number(newQuantity),
               cost_price: Number(item.price), // Update cost price
               selling_price: Number(item.price * 1.2) // Update selling price
             };
             console.log('📦 Updating existing inventory item:', existingItem.id, updatePayload);
             const { data: updatedItem } = await api.put(`/api/inventory/${existingItem.id}`, updatePayload);
             console.log('✅ Existing inventory item updated:', updatedItem);
             return updatedItem;
          } else {
                                      // Create new inventory item
             const inventoryPayload = {
               name: item.name,
               quantity: Number(item.qty),
               unit: 'units',
               cost_price: Number(item.price),
               selling_price: Number(item.price * 1.2), // 20% markup
               category: 'General',
               supplier: companyName,
               status: 'active'
             };
             
             console.log('📦 Creating new inventory item:', inventoryPayload);
             const { data: inventoryData } = await api.post('/api/inventory', inventoryPayload);
             console.log('✅ New inventory item created:', inventoryData);
             return inventoryData;
          }
                 } catch (error) {
           console.error('❌ Failed to save inventory item:', item.name, error);
           console.error('❌ Error details:', {
             message: error.message,
             response: error.response?.data,
             status: error.response?.status,
             stack: error.stack
           });
           throw error;
         }
      });

      await Promise.all(inventoryPromises);
      console.log('✅ All inventory items saved successfully');

      // Update grand total
      const newGrandTotal = parseFloat(totalStockAmount) + receiptTotal;
      setTotalStockAmount(newGrandTotal);

      // Generate new receipt number for next receipt
      const lastReceiptNumber = localStorage.getItem('lastReceiptNumber') || '000';
      const nextNumber = String(parseInt(lastReceiptNumber) + 1).padStart(3, '0');
      localStorage.setItem('lastReceiptNumber', nextNumber);
      
      const nextNextNumber = String(parseInt(nextNumber) + 1).padStart(3, '0');
      setReceiptNumber(`REC-${nextNextNumber}`);

      // Reset receipt info and items
      setReceiptDate('');
      setCompanyName('');
      setCompanyContact('');
      setStockItems([]);
      setReceiptTotal(0);

             // Show success message
       toast.success('Receipt and inventory items saved successfully!');

     } catch (error) {
       console.error('❌ Error saving receipt and inventory:', error);
       console.error('❌ Full error details:', {
         message: error.message,
         response: error.response?.data,
         status: error.response?.status,
         stack: error.stack
       });
       toast.error(`Error saving receipt and inventory: ${error.response?.data?.error || error.message}`);
     } finally {
       setIsSaving(false);
     }
   };

  // Handle delete item
  const handleDeleteItem = (id) => {
    const itemToDelete = stockItems.find(item => item.id === id);
    if (!itemToDelete) return;
    
    if (window.confirm(`Are you sure you want to delete "${itemToDelete.name}"?`)) {
      setStockItems(stockItems.filter(item => item.id !== id));
      setReceiptTotal(prev => prev - itemToDelete.amount);
      toast.success('Item removed from receipt');
    }
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
    if (!editItemName.trim()) {
      toast.error('Please enter an item name');
      return;
    }
    if (!editQuantity || parseFloat(editQuantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }
    if (!editUnitPrice || parseFloat(editUnitPrice) <= 0) {
      toast.error('Please enter a valid unit price');
      return;
    }

    const qty = parseFloat(editQuantity);
    const price = parseFloat(editUnitPrice);
    const amount = qty * price;

    // Check if new name conflicts with other items
    const nameConflict = stockItems.find(item => 
      item.id !== editItemId && 
      item.name.toLowerCase() === editItemName.trim().toLowerCase()
    );

    if (nameConflict) {
      toast.error('Item name already exists in this receipt');
      return;
    }

    setStockItems(
      stockItems.map(item => 
        item.id === editItemId ? { ...item, name: editItemName.trim(), qty, price, amount } : item
      )
    );
    
    // Recalculate receipt total
    const newTotal = stockItems.reduce((sum, item) => 
      item.id === editItemId ? sum - item.amount + amount : sum + item.amount
    , 0);
    setReceiptTotal(newTotal);
    setEditItemId(null);
    
    toast.success('Item updated successfully');
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
         <div className="flex justify-between items-center mb-4">
           <h3 className="text-xl font-semibold">Receipt Details</h3>
           {isSaving && (
             <div className="flex items-center gap-2 text-blue-600">
               <AlertCircle size={16} />
               <span className="text-sm">Saving to database...</span>
             </div>
           )}
         </div>
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
               disabled={isSaving}
               className="w-full py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
             >
               {isSaving ? (
                 <>
                   <Save className="animate-spin" size={16} />
                   Saving...
                 </>
               ) : (
                 <>
                   <Save size={16} />
                   Save Receipt
                 </>
               )}
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
      
             {/* Summary */}
       {stockItems.length > 0 && (
         <div className="mb-8 p-6 bg-yellow-50 rounded-lg border border-yellow-200">
           <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center gap-2">
             <AlertCircle size={20} />
             Save Summary
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
             <div>
               <p className="text-yellow-700 font-medium">Items to Save:</p>
               <p className="text-yellow-800 font-bold">{stockItems.length} items</p>
             </div>
             <div>
               <p className="text-yellow-700 font-medium">Receipt Total:</p>
               <p className="text-yellow-800 font-bold">UGX {formatNumber(receiptTotal)}</p>
             </div>
             <div>
               <p className="text-yellow-700 font-medium">Database Actions:</p>
               <p className="text-yellow-800 font-bold">Save receipt + Update inventory</p>
             </div>
           </div>
         </div>
       )}

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

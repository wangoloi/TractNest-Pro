import React, { useState } from 'react';
import { Search, Printer } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatNumber } from '../../utils/formatNumber';
import { normalizeName } from '../../utils/normalizeName';


const MyStock = ({ stockItems, receipts, totalStockAmount, setReceipts }) => {
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showStockSummary, setShowStockSummary] = useState(false);
  const [editCompany, setEditCompany] = useState('');
  const [editItems, setEditItems] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const receiptsWithId = receipts.map((r, index) => ({
    ...r,
    id: r.id || `receipt-${index}-${r.date}`,
  }));

  const sortedReceipts = receiptsWithId.slice().sort((a, b) => new Date(b.date) - new Date(a.date));

  // Filter receipts based on search term
  const filteredReceipts = sortedReceipts.filter(receipt => 
    receipt.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDoubleClick = (receipt) => {
    setSelectedReceipt(receipt);
    setEditCompany(receipt.company);
    setEditItems(receipt.items);
    setIsEditing(false);
  };

  const handleBack = () => {
    setSelectedReceipt(null);
  };

  const toggleStockSummary = () => {
    setShowStockSummary(!showStockSummary);
  };


  // Merge items by name, ignoring case and plural/singular variations
  const mergedItems = () => {
    const itemMap = {};
    const nameMap = {};

    // Use current stockItems instead of calculating from receipts
    if (stockItems && stockItems.length > 0) {
      stockItems.forEach((item) => {
        // Only include items with quantity > 0
        const itemQty = item.qty || item.quantity || 0;
        const itemAmount = item.amount || (item.selling_price * itemQty) || 0;
        
        if (itemQty > 0) {
          const normalized = normalizeName(item.name);
          if (itemMap[normalized]) {
            itemMap[normalized].qty += itemQty;
            itemMap[normalized].totalAmount += itemAmount;
            if (!nameMap[normalized]) {
              nameMap[normalized] = item.name;
            }
          } else {
            itemMap[normalized] = {
              name: item.name,
              qty: itemQty,
              totalAmount: itemAmount,
            };
            nameMap[normalized] = item.name;
          }
        }
      });
    } else {
      // Fallback to original method if stockItems is not available or empty
      receiptsWithId.forEach((receipt) => {
        if (receipt.items) {
          receipt.items.forEach((item) => {
            const normalized = normalizeName(item.name);
            if (itemMap[normalized]) {
              itemMap[normalized].qty += item.qty;
              itemMap[normalized].totalAmount += item.amount;
              if (!nameMap[normalized]) {
                nameMap[normalized] = item.name;
              }
            } else {
              itemMap[normalized] = {
                name: item.name,
                qty: item.qty,
                totalAmount: item.amount,
              };
              nameMap[normalized] = item.name;
            }
          });
        }
      });
    }

    return Object.keys(itemMap).map((key) => ({
      name: nameMap[key],
      qty: itemMap[key].qty,
      totalAmount: itemMap[key].totalAmount,
    }));
  };

  const mergedStockItems = mergedItems();

  const handleDelete = () => {
    if (!selectedReceipt) {
      alert('No receipt selected.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this receipt?')) {
      const newReceipts = receiptsWithId.filter(r => r.id !== selectedReceipt.id);
      setReceipts(newReceipts);
      setSelectedReceipt(null);
    }
  };

  const handleSave = () => {
    const total = editItems.reduce((sum, item) => sum + item.amount, 0);
    const updatedReceipts = receiptsWithId.map(r =>
      r.id === selectedReceipt.id
        ? { ...r, company: editCompany, items: [...editItems], total }
        : r
    );
    setReceipts(updatedReceipts);
    setIsEditing(false);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...editItems];
    if (field === 'name') {
      newItems[index].name = value;
    } else if (field === 'qty') {
      newItems[index].qty = parseInt(value, 10) || 0;
    } else if (field === 'price') {
      newItems[index].price = parseFloat(value) || 0;
    }
    newItems[index].amount = newItems[index].qty * newItems[index].price;
    setEditItems(newItems);
  };

  // Handle print functionality
  const handlePrint = () => {
    if (!selectedReceipt) return;
    
    // Create a new jsPDF instance
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Stock Receipt', 105, 20, { align: 'center' });
    
    // Add receipt details
    doc.setFontSize(12);
    doc.text(`Receipt Number: ${selectedReceipt.id}`, 20, 35);
    doc.text(`Date: ${new Date(selectedReceipt.date).toLocaleDateString()}`, 20, 45);
    doc.text(`Company: ${selectedReceipt.company}`, 20, 55);
    
    // Add items table
    if (selectedReceipt.items && selectedReceipt.items.length > 0) {
      const itemsData = selectedReceipt.items.map(item => [
        item.name,
        item.qty.toString(),
        `UGX ${formatNumber(item.price)}`,
        `UGX ${formatNumber(item.amount)}`
      ]);
      
      autoTable(doc, {
        startY: 65,
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
      const finalY = doc.lastAutoTable.finalY || 65;
      doc.setFontSize(14);
      doc.text(`Total: UGX ${formatNumber(selectedReceipt.total)}`, 150, finalY + 15);
    } else {
      doc.text('No items in this receipt.', 20, 75);
    }
    
    // Save the PDF
    doc.save(`receipt-${selectedReceipt.id}.pdf`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      {/* Top-right "Summary" button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Stock (Remaining Stock)</h2>
        <div className="flex gap-2">
          <button
            onClick={toggleStockSummary}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {showStockSummary ? 'Hide Stock Summary' : 'Show Stock Summary'}
          </button>
          {selectedReceipt && (
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
            >
              <Printer size={16} className="mr-2" />
              Print Receipt
            </button>
          )}
        </div>
      </div>
      
      <p className="text-lg mb-6">Total Stock Value: <span className="font-semibold">UGX {formatNumber(totalStockAmount)}</span></p>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-gray-400" size={20} />
          </div>
          <input
            type="text"
            placeholder="Search receipts by company or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md input"
          />
        </div>
      </div>

      {showStockSummary && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-lg font-semibold mb-3">Remaining Stock Items</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mergedStockItems.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.qty}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">UGX {formatNumber(item.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!selectedReceipt ? (
        <div>
          <h3 className="text-xl font-semibold mb-4">Receipts</h3>
          {filteredReceipts.length > 0 ? (
            <div className="space-y-4">
              {filteredReceipts.map((receipt) => (
                <div
                  key={receipt.id}
                  className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  onDoubleClick={() => handleDoubleClick(receipt)}
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{new Date(receipt.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Receipt Number</p>
                      <p className="font-medium">{receipt.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Company Name</p>
                      <p className="font-medium">{receipt.company}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="font-medium">UGX {formatNumber(receipt.total)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No receipts available.</p>
            </div>
          )}
        </div>
      ) : (
        // Receipt detail with editing
        <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Back to Receipts
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Delete Receipt
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isEditing 
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                  : 'bg-yellow-400 hover:bg-yellow-500 text-gray-800'
              }`}
            >
              {isEditing ? 'Cancel Edit' : 'Edit'}
            </button>
          </div>
          
          <h4 className="text-xl font-semibold mb-4">Receipt Details</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">{new Date(selectedReceipt.date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Receipt Number</p>
              <p className="font-medium">{selectedReceipt.id}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Company Name</p>
              {isEditing ? (
                <input
                  type="text"
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md input"
                />
              ) : (
                <p className="font-medium">{selectedReceipt.company}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="font-medium text-lg">UGX {formatNumber(editItems.reduce((sum, item) => sum + item.amount, 0))}</p>
            </div>
          </div>

          {isEditing ? (
            <div>
              <h5 className="text-lg font-semibold mb-3">Items in this receipt:</h5>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {editItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md input"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <input
                            type="number"
                            value={item.qty}
                            onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md input"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md input"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">UGX {formatNumber(item.amount)}</td>
                        <td className="px-4 py-3 whitespace-nowrap"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                onClick={handleSave}
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Save Changes
              </button>
            </div>
          ) : (
            <div>
              <h5 className="text-lg font-semibold mb-3">Items in this receipt:</h5>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {editItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.qty}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">UGX {formatNumber(item.price)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">UGX {formatNumber(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyStock;

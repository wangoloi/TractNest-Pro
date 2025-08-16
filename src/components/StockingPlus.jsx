import React, { useState } from 'react';


const StockingPlus = ({
  stockItems,
  setStockItems,
  receipts,
  setReceipts,
  totalStockAmount,
  setTotalStockAmount,
}) => {
   function formatNumber(num) {
    return new Intl.NumberFormat(`en-US`, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num);
      };

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

    // Reset receipt info and items
    setReceiptNumber('');
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

  return (
    <div className="card" style={{ flex: 1, border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
      <h2>Stocking Plus</h2>
      
      {/* Receipt Details */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Receipt Details</h3>
        <input
          type="text"
          placeholder="Receipt Number"
          value={receiptNumber}
          onChange={(e) => setReceiptNumber(e.target.value)}
          style={{ marginRight: '10px', padding: '8px' }}
        />
        <input
          type="date"
          placeholder="Date"
          value={receiptDate}
          onChange={(e) => setReceiptDate(e.target.value)}
          style={{ marginRight: '10px', padding: '8px' }}
        />
        <input
          type="text"
          placeholder="Company Name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          style={{ marginRight: '10px', padding: '8px' }}
        />
        <input
          type="text"
          placeholder="Contact (optional)"
          value={companyContact}
          onChange={(e) => setCompanyContact(e.target.value)}
          style={{ padding: '8px' }}
        />
        <button onClick={handleSaveReceipt} style={{ marginLeft: '20px', padding: '8px 16px' }}>Save Receipt</button>
      </div>
      
      {/* Item Entry */}
      <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>Item Name</th>
              <th style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>Quantity</th>
              <th style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>Unit Price</th>
              <th style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>Amount</th>
              <th style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stockItems.map((item) => (
              <tr key={item.id}>
                {/* If this item is being edited, show input fields */}
                {editItemId === item.id ? (
                  <>
                    <td style={{ padding: '8px' }}>
                      <input
                        type="text"
                        value={editItemName}
                        onChange={(e) => setEditItemName(e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <input
                        type="number"
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <input
                        type="number"
                        value={editUnitPrice}
                        onChange={(e) => setEditUnitPrice(e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </td>
                    <td style={{ padding: '8px' }}>UGX { formatNumber(parseFloat(editQuantity) * parseFloat(editUnitPrice)) }</td>
                    <td style={{ padding: '8px' }}>
                      <button onClick={handleSaveEdit} style={{ marginRight: '8px' }}>Save</button>
                      <button onClick={() => setEditItemId(null)}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ padding: '8px' }}>{item.name}</td>
                    <td style={{ padding: '8px' }}>{item.qty}</td>
                    <td style={{ padding: '8px' }}>UGX {formatNumber(item.price)}</td>
                    <td style={{ padding: '8px' }}>UGX {formatNumber(item.amount)}</td>
                    <td style={{ padding: '8px' }}>
                      <button onClick={() => handleEditItem(item)} style={{ marginRight: '8px' }}>Edit</button>
                      <button onClick={() => handleDeleteItem(item.id)}>Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Add Item */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Item Name"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          style={{ padding: '8px', flex: 1 }}
        />
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          style={{ padding: '8px', width: '100px' }}
        />
        <input
          type="number"
          placeholder="Unit Price"
          value={unitPrice}
          onChange={(e) => setUnitPrice(e.target.value)}
          style={{ padding: '8px', width: '100px' }}
        />
        <button onClick={handleAddItem} style={{ padding: '8px 16px' }}>Add Stock Item</button>
      </div>
      
      {/* Total for current receipt */}
      <h3>Receipt Total: UGX{formatNumber(receiptTotal)}</h3>
      
      {/* Grand total across all receipts */}
      <h3>Grand Total Stocked Amount: UGX {formatNumber(totalStockAmount)}</h3>
    </div>
  );
};

export default StockingPlus;
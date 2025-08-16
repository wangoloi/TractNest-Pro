import React, { useState } from 'react';

// Helper function to normalize item names
const normalizeName = (name) => {
  const lowerName = name.toLowerCase().trim();
  if (lowerName.endsWith('es')) {
    // Remove 'es' for words like 'boxes', 'buses'
    return lowerName.slice(0, -2);
  } else if (lowerName.endsWith('s')) {
    // Remove 's' for words like 'apples', 'bananas'
    return lowerName.slice(0, -1);
  }
  return lowerName;
};

const MyStock = ({ stockItems, receipts, totalStockAmount, setReceipts }) => {
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showStockSummary, setShowStockSummary] = useState(false);
  const [viewItems, setViewItems] = useState(null);
  const [editCompany, setEditCompany] = useState('');
  const [editItems, setEditItems] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const receiptsWithId = receipts.map((r, index) => ({
    ...r,
    id: r.id || `receipt-${index}-${r.date}`,
  }));

  const sortedReceipts = receiptsWithId.slice().sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleDoubleClick = (receipt) => {
    setSelectedReceipt(receipt);
    setViewItems(receipt.items);
    setEditCompany(receipt.company);
    setEditItems(receipt.items);
    setIsEditing(false);
  };

  const handleBack = () => {
    setSelectedReceipt(null);
    setViewItems(null);
  };

  const toggleStockSummary = () => {
    setShowStockSummary(!showStockSummary);
  };

  function formatNumber(num) {
    return new Intl.NumberFormat(`en-US`, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num);
 };

  // Merge items by name, ignoring case and plural/singular variations
  const mergedItems = () => {
    const itemMap = {};
    const nameMap = {};

    // Use current stockItems instead of calculating from receipts
    if (stockItems && stockItems.length > 0) {
      stockItems.forEach((item) => {
        // Only include items with quantity > 0
        if (item.qty > 0) {
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

  const handleCancel = () => {
    setEditCompany(selectedReceipt.company);
    setEditItems(selectedReceipt.items);
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

  return (
    <div style={{ position: 'relative', border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
      {/* Top-right "Summary" button */}
      <button
        onClick={toggleStockSummary}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          padding: '6px 12px',
          backgroundColor: '#17a2b8',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        {showStockSummary ? 'Hide Stock Summary' : 'Show Stock Summary'}
      </button>

      <h2>My Stock (Remaining Stock)</h2>
      <p>Total Stock Value: UGX {formatNumber(totalStockAmount)}</p>

      {showStockSummary && (
        <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
          <h4>Remaining Stock Items</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>Item Name</th>
                <th style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>Total Quantity</th>
              </tr>
            </thead>
            <tbody>
              {mergedStockItems.map((item, index) => (
                <tr key={index}>
                  <td style={{ padding: '8px' }}>{item.name}</td>
                  <td style={{ padding: '8px' }}>{item.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!selectedReceipt ? (
        <>
          <h3>Receipts</h3>
          {receipts.length > 0 ? (
            sortedReceipts.map((receipt) => (
              <div
                key={receipt.id}
                style={{
                  marginBottom: '10px',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
                onDoubleClick={() => handleDoubleClick(receipt)}
              >
                <p><strong>Date:</strong> {new Date(receipt.date).toLocaleDateString()}</p>
                <p><strong>Receipt Number:</strong> {receipt.id}</p>
                <p><strong>Company Name:</strong> {receipt.company}</p>
                <p><strong>Total Amount:</strong> UGX {formatNumber(receipt.total)}</p>
              </div>
            ))
          ) : (
            <p>No receipts available.</p>
          )}
        </>
      ) : (
        // Receipt detail with editing
        <div
          style={{
            marginTop: '20px',
            padding: '10px',
            border: '1px solid #888',
            borderRadius: '4px',
            backgroundColor: '#f0f0f0',
          }}
        >
          <button
            onClick={handleBack}
            style={{
              padding: '6px 12px',
              marginBottom: '10px',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px',
            }}
          >
            Back to Receipts
          </button>
          <button
            onClick={handleDelete}
            style={{
              padding: '6px 12px',
              marginBottom: '10px',
              backgroundColor: '#dc3545',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Delete Receipt
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            style={{
              padding: '6px 12px',
              marginBottom: '10px',
              backgroundColor: '#ffc107',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginLeft: '10px',
            }}
          >
            {isEditing ? 'Cancel Edit' : 'Edit'}
          </button>
          <h4>Receipt Details</h4>
          <p><strong>Date:</strong> {new Date(selectedReceipt.date).toLocaleDateString()}</p>
          <p><strong>Receipt Number:</strong> {selectedReceipt.id}</p>
          <p>
            <strong>Company Name:</strong>
            {isEditing ? (
              <input
                type="text"
                value={editCompany}
                onChange={(e) => setEditCompany(e.target.value)}
                style={{ width: '200px' }}
              />
            ) : (
              selectedReceipt.company
            )}
          </p>

          <p>
            <strong>Total Amount:</strong> UGX {formatNumber(editItems.reduce((sum, item) => sum + item.amount, 0))}
          </p>

          {isEditing ? (
            <>
              <h5>Items in this receipt:</h5>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>Item Name</th>
                    <th style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>Qty</th>
                    <th style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>Unit Price</th>
                    <th style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {editItems.map((item, index) => (
                    <tr key={index}>
                      <td style={{ padding: '8px' }}>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                        />
                      </td>
                      <td style={{ padding: '8px' }}>
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                        />
                      </td>
                      <td style={{ padding: '8px' }}>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                        />
                      </td>
                      <td style={{ padding: '8px' }}>UGX {formatNumber(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                onClick={handleSave}
                style={{
                  marginTop: '10px',
                  padding: '6px 12px',
                  backgroundColor: '#28a745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Save Changes
              </button>
            </>
          ) : (
            <>
              <h5>Items in this receipt:</h5>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>Item Name</th>
                    <th style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>Qty</th>
                    <th style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>Unit Price</th>
                    <th style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {editItems.map((item, index) => (
                    <tr key={index}>
                      <td style={{ padding: '8px' }}>{item.name}</td>
                      <td style={{ padding: '8px' }}>{item.qty}</td>
                      <td style={{ padding: '8px' }}>UGX {formatNumber(item.price)}</td>
                      <td style={{ padding: '8px' }}>UGX {formatNumber(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MyStock;
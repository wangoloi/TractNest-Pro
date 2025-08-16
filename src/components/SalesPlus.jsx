import React, { useState, useEffect } from 'react';

// Utility function for number formatting
const formatNumber = (num) => {
  return new Intl.NumberFormat(`en-US`, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

const SalesPlus = ({ salesRecords, setSalesRecords, totalSales, setTotalSales, stockData, stockItems, setStockItems }) => {
  const [receiptNumber, setReceiptNumber] = useState('');
  const [saleDate, setSaleDate] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [contact1, setContact1] = useState('');
  const [contact2, setContact2] = useState('');

  const [saleItems, setSaleItems] = useState([]);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');

  // Generate receipt number on component mount
  useEffect(() => {
    generateReceiptNumber();
    // Set current date as default
    const today = new Date().toISOString().split('T')[0];
    setSaleDate(today);
  }, []);

  const generateReceiptNumber = () => {
    // Get last used receipt number from localStorage
    const lastNumberStr = localStorage.getItem('lastReceiptNumber');
    const lastNumber = lastNumberStr ? parseInt(lastNumberStr, 10) : 0;
    const newNumber = lastNumber + 1;

    // Format as REC-0001, REC-0002, etc.
    const formattedNumber = `REC-${String(newNumber).padStart(4, '0')}`;

    // Update state and storage
    setReceiptNumber(formattedNumber);
    localStorage.setItem('lastReceiptNumber', newNumber.toString());

    return formattedNumber;
  };

  const handleAddSaleItem = () => {
    if (!itemName || !quantity || !unitPrice) {
      alert('Please fill all fields for sale item');
      return;
    }

    const qty = parseFloat(quantity);
    const price = parseFloat(unitPrice);
    const stockPrice = stockData ? stockData[itemName] : undefined;

    if (stockPrice === undefined) {
      alert(`Stock price for ${itemName} not found.`);
      return;
    }

    const profit = (price - stockPrice) * qty;
    const amount = qty * price;

    const newItem = {
      id: Date.now(),
      name: itemName,
      qty,
      price,
      amount,
      profit,
    };

    setSaleItems([...saleItems, newItem]);
    setItemName('');
    setQuantity('');
    setUnitPrice('');
  };

  const handleSaveSale = () => {
    if (!receiptNumber || !saleDate || !customerName || saleItems.length === 0) {
      alert('Please fill all required fields and add at least one sale item');
      return;
    }

    // Create individual sales records
    const individualSales = saleItems.map(item => ({
      id: `${receiptNumber}-${item.id}`,
      date: saleDate,
      customer: customerName,
      contact1: contact1,
      contact2: contact2,
      productName: item.name,
      quantity: item.qty,
      salePrice: item.price,
      total: item.amount,
      totalProfit: item.profit,
    }));

    const totalAmount = saleItems.reduce((sum, item) => sum + item.amount, 0);
    const totalProfit = saleItems.reduce((sum, item) => sum + item.profit, 0);

    // Save the sales records
    setSalesRecords([...salesRecords, ...individualSales]);

    // Update stock items
    if (setStockItems && stockItems) {
      const updatedStockItems = [...stockItems];
      saleItems.forEach(saleItem => {
        const stockItemIndex = updatedStockItems.findIndex(item => item.name === saleItem.name);
        if (stockItemIndex !== -1) {
          const currentQty = updatedStockItems[stockItemIndex].qty;
          const newQty = currentQty - saleItem.qty;
          updatedStockItems[stockItemIndex].qty = Math.max(newQty, 0);
        }
      });
      setStockItems(updatedStockItems);
    }

    // Update totals
    const newAmount = (parseFloat(totalSales.amount) || 0) + totalAmount;
    const newProfit = (parseFloat(totalSales.profit) || 0) + totalProfit;
    setTotalSales({ amount: newAmount, profit: newProfit });

    // Reset form and generate new receipt number
    setSaleItems([]);
    setCustomerName('');
    setContact1('');
    setContact2('');
    generateReceiptNumber();
  };

  return (
    <div className="card" style={{ flex: 1, border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
      <h2>Sales Plus</h2>

      {/* Sale Details */}
      <div style={{ marginBottom: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
        <div>
          <label>Receipt Number</label>
          <input
            type="text"
            placeholder="Receipt Number"
            value={receiptNumber}
            readOnly
            style={{ backgroundColor: '#f5f5f5' }}
          />
        </div>
        <div>
          <label>Date</label>
          <input
            type="date"
            value={saleDate}
            onChange={(e) => setSaleDate(e.target.value)}
          />
        </div>
        <div>
          <label>Customer Name*</label>
          <input
            type="text"
            placeholder="Required"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Contact 1</label>
          <input
            type="text"
            placeholder="Optional"
            value={contact1}
            onChange={(e) => setContact1(e.target.value)}
          />
        </div>
        <div>
          <label>Contact 2</label>
          <input
            type="text"
            placeholder="Optional"
            value={contact2}
            onChange={(e) => setContact2(e.target.value)}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleSaveSale}
        style={{ margin: '10px 0', padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white' }}
      >
        Save Sale
      </button>

      {/* Sale Items Table */}
      <div style={{ maxHeight: '300px', overflowY: 'auto', margin: '20px 0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Item Name</th>
              <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Quantity</th>
              <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Unit Price</th>
              <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Amount</th>
              <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Profit</th>
            </tr>
          </thead>
          <tbody>
            {saleItems.map((item) => (
              <tr key={item.id}>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{item.name}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee', textAlign: 'right' }}>{item.qty}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee', textAlign: 'right' }}>UGX {formatNumber(item.price)}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee', textAlign: 'right' }}>UGX {formatNumber(item.amount)}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee', textAlign: 'right' }}>UGX {formatNumber(item.profit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Sale Item */}
      <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
        <div>
          <label>Item Name</label>
          <input
            type="text"
            placeholder="Required"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Quantity</label>
          <input
            type="number"
            placeholder="Required"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
            step="0.01"
            required
          />
        </div>
        <div>
          <label>Unit Price</label>
          <input
            type="number"
            placeholder="Required"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            min="0"
            step="0.01"
            required
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleAddSaleItem}
        style={{ padding: '10px 20px', margin: '10px 0', backgroundColor: '#2196F3', color: 'white' }}
      >
        Add Sale Item
      </button>

      {/* Totals */}
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
        <h3>Current Sale Total: UGX {formatNumber(saleItems.reduce((sum, item) => sum + item.amount, 0))}</h3>
        <h3>Current Sale Profit: UGX {formatNumber(saleItems.reduce((sum, item) => sum + item.profit, 0))}</h3>
        <h3>All-Time Sales Amount: UGX {formatNumber(totalSales.amount || 0)}</h3>
        <h3>All-Time Profits: UGX {formatNumber(totalSales.profit || 0)}</h3>
      </div>
    </div>
  );
};

export default SalesPlus;
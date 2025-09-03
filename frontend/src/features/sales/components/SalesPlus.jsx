import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Search, 
  Printer, 
  Plus, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Package,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  User,
  Calendar,
  FileText,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatNumber, formatAppCurrency } from '../../../lib/utils/formatNumber';

import api from '../../../lib/utils/api';

const SalesPlus = () => {
  // Data states
  const [salesRecords, setSalesRecords] = useState([]);
  const [totalSales, setTotalSales] = useState({ amount: 0, profit: 0 });
  const [stockItems, setStockItems] = useState([]);
  // Sale info states
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  
  // Item entry states
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // Sale's items and total
  const [saleItems, setSaleItems] = useState([]);
  const [saleTotal, setSaleTotal] = useState(0);
  const [saleProfit, setSaleProfit] = useState(0);
  const [saleTax, setSaleTax] = useState(0);
  const [saleDiscount, setSaleDiscount] = useState(0);

  // For editing items
  const [editItemId, setEditItemId] = useState(null);
  const [editItemName, setEditItemName] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editUnitPrice, setEditUnitPrice] = useState('');

  // UI states
  const [isSaving, setIsSaving] = useState(false);
  const [selectedItemDetails, setSelectedItemDetails] = useState(null);
  const [availableInventory, setAvailableInventory] = useState([]);
  const [showAllItems, setShowAllItems] = useState(false);
  const [browseFilter, setBrowseFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const searchRef = useRef(null);

  const generateInvoiceNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    setInvoiceNumber(`INV-${timestamp}-${random}`);
  };

  const fetchAvailableInventory = useCallback(async () => {
    try {
      // Use the main inventory data that's already being managed by the parent
      // This ensures consistency with the stocking system
      console.log('Fetching available inventory from stockItems:', stockItems);
      setAvailableInventory(stockItems || []);
    } catch (error) {
      console.error('Failed to fetch available inventory:', error);
      setAvailableInventory([]);
    }
  }, [stockItems]);

  // Fetch initial data on component mount
  useEffect(() => {
    generateInvoiceNumber();
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // Mock data for sales records
      const mockSalesRecords = [
        {
          id: 1,
          invoice_number: 'INV-1703123456789-123',
          customer_name: 'John Smith',
          customer_email: 'john@example.com',
          customer_phone: '+1234567890',
          sale_date: '2024-01-20',
          total_amount: 2500,
          profit: 750,
          items: [
            { name: 'Laptop Pro', quantity: 1, unit_price: 1200, total: 1200 },
            { name: 'Wireless Headphones', quantity: 2, unit_price: 150, total: 300 }
          ]
        },
        {
          id: 2,
          invoice_number: 'INV-1703123456788-456',
          customer_name: 'Jane Doe',
          customer_email: 'jane@example.com',
          customer_phone: '+1234567891',
          sale_date: '2024-01-19',
          total_amount: 1800,
          profit: 540,
          items: [
            { name: 'Smartphone X', quantity: 1, unit_price: 800, total: 800 },
            { name: 'Tablet Air', quantity: 1, unit_price: 500, total: 500 }
          ]
        }
      ];

      // Mock data for stock items
      const mockStockItems = [
        { id: 1, name: 'Laptop Pro', qty: 15, selling_price: 1200, cost_price: 900 },
        { id: 2, name: 'Smartphone X', qty: 25, selling_price: 800, cost_price: 600 },
        { id: 3, name: 'Tablet Air', qty: 8, selling_price: 500, cost_price: 350 },
        { id: 4, name: 'Wireless Headphones', qty: 30, selling_price: 150, cost_price: 90 },
        { id: 5, name: 'Gaming Mouse', qty: 12, selling_price: 80, cost_price: 45 }
      ];
      
      setSalesRecords(mockSalesRecords);
      setStockItems(mockStockItems);
      
      // Calculate total sales
      const totalAmount = mockSalesRecords.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
      const totalProfit = mockSalesRecords.reduce((sum, sale) => sum + (sale.profit || 0), 0);
      setTotalSales({ amount: totalAmount, profit: totalProfit });
      
    } catch (error) {
      console.error('Error loading mock data:', error);
      setSalesRecords([]);
      setStockItems([]);
      setTotalSales({ amount: 0, profit: 0 });
    }
  };

  // Refresh available inventory when stockItems changes
  useEffect(() => {
    console.log('stockItems changed, refreshing available inventory:', stockItems);
    fetchAvailableInventory();
  }, [fetchAvailableInventory, stockItems]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const refreshInventory = async () => {
    setIsRefreshing(true);
    try {
      const invRes = await api.get('/api/inventory');
      setStockItems(invRes.data || []);
      setAvailableInventory(invRes.data || []);
      toast.success('Inventory refreshed successfully!');
    } catch (error) {
      console.error('Failed to refresh inventory:', error);
      toast.error('Failed to refresh inventory');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Get available items for sale (items with quantity > 0)
  const availableItems = availableInventory.filter(item => item.quantity > 0);

  // Enhanced filtering with multiple search criteria
  const filteredItems = availableItems.filter(item => {
    if (!searchTerm) return false;
    
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = item.name.toLowerCase().includes(searchLower);
    const skuMatch = item.sku && item.sku.toLowerCase().includes(searchLower);
    const categoryMatch = item.category && item.category.toLowerCase().includes(searchLower);
    const descriptionMatch = item.description && item.description.toLowerCase().includes(searchLower);
    
    return nameMatch || skuMatch || categoryMatch || descriptionMatch;
  }).slice(0, 15); // Increased limit for better selection

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSearchResults(value.length > 0);
    
    if (value.length === 0) {
      setSelectedItem('');
      setSelectedItemDetails(null);
      setUnitPrice('');
    }
  };

  const handleItemSelect = (item) => {
    setSelectedItem(item.name);
    setSelectedItemDetails(item);
    setUnitPrice(item.selling_price || item.cost_price || 0);
    setQuantity('');
    setSearchTerm(item.name);
    setShowSearchResults(false);
    
    toast.success(`Selected: ${item.name} (${item.quantity} available)`);
  };

  const validateQuantity = (qty, availableQty) => {
    const quantity = parseFloat(qty);
    if (quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return false;
    }
    if (quantity > availableQty) {
      toast.error(`Only ${availableQty} units available`);
      return false;
    }
    return true;
  };

  const handleAddItem = () => {
    if (!selectedItem || !quantity || !unitPrice) {
      toast.error('Please fill in all item details');
      return;
    }

    if (!selectedItemDetails) {
      toast.error('Please select a valid item from the search results');
      return;
    }

    const qty = parseFloat(quantity);
    const price = parseFloat(unitPrice);
    
    if (!validateQuantity(qty, selectedItemDetails.quantity)) {
      return;
    }

    const amount = qty * price;
    const costPrice = selectedItemDetails.cost_price || 0;
    const profit = amount - (qty * costPrice);

    const newItem = {
      id: Date.now(),
      itemId: selectedItemDetails.id,
      name: selectedItem,
      qty,
      price,
      amount,
      profit,
      availableQty: selectedItemDetails.quantity,
      costPrice: costPrice
    };

    setSaleItems([...saleItems, newItem]);
    updateTotals([...saleItems, newItem]);

    // Reset form
    setSelectedItem('');
    setSelectedItemDetails(null);
    setQuantity('');
    setUnitPrice('');
    setSearchTerm('');
    setShowSearchResults(false);

    toast.success('Item added to sale');
  };

  const updateTotals = (items) => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const totalProfit = items.reduce((sum, item) => sum + item.profit, 0);
    const taxAmount = subtotal * 0.18; // 18% tax
    const discountAmount = subtotal * 0.05; // 5% discount
    const finalTotal = subtotal + taxAmount - discountAmount;

    setSaleTotal(finalTotal);
    setSaleProfit(totalProfit);
    setSaleTax(taxAmount);
    setSaleDiscount(discountAmount);
  };

  const handleSaveSale = async () => {
    if (!saleDate || !customerName) {
      toast.error('Please fill in all required sale details');
      return;
    }
    if (saleItems.length === 0) {
      toast.error('Please add at least one item before saving the sale');
      return;
    }

    setIsSaving(true);
    try {
      // Create individual sales for each item
      const createdSales = [];
      
      for (const item of saleItems) {
        const payload = {
          itemId: item.itemId,
          quantity: item.qty,
          unitPrice: item.price
        };

        const { data } = await api.post('/api/sales', payload);
        createdSales.push(data);
      }

      // Add all created sales to the records
      setSalesRecords([...createdSales, ...salesRecords]);

      // Update total sales
      const newTotalSales = {
        amount: totalSales.amount + saleTotal,
        profit: totalSales.profit + saleProfit,
      };
      setTotalSales(newTotalSales);

      // Refresh inventory data
      try {
        const invRes = await api.get('/api/inventory');
        setStockItems(invRes.data || []);
        // Also update local available inventory immediately
        setAvailableInventory(invRes.data || []);
      } catch (error) {
        console.error('Failed to refresh inventory:', error);
      }

      // Reset form
      resetSaleForm();
      
      toast.success('Sale saved successfully!');
      
      // Generate new invoice number
      generateInvoiceNumber();

    } catch (error) {
      console.error('Error saving sale:', error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Failed to save sale. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const resetSaleForm = () => {
    setSaleDate(new Date().toISOString().split('T')[0]);
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setSaleItems([]);
    setSaleTotal(0);
    setSaleProfit(0);
    setSaleTax(0);
    setSaleDiscount(0);
    setSelectedItem('');
    setSelectedItemDetails(null);
    setQuantity('');
    setUnitPrice('');
    setSearchTerm('');
    setShowSearchResults(false);
  };

  const handleDeleteItem = (id) => {
    const itemToDelete = saleItems.find(item => item.id === id);
    if (!itemToDelete) return;
    
    const updatedItems = saleItems.filter(item => item.id !== id);
    setSaleItems(updatedItems);
    updateTotals(updatedItems);
    
    toast.success('Item removed from sale');
  };

  const handleEditItem = (item) => {
    setEditItemId(item.id);
    setEditItemName(item.name);
    setEditQuantity(item.qty);
    setEditUnitPrice(item.price);
  };

  const handleSaveEdit = () => {
    if (!editItemName || !editQuantity || !editUnitPrice) {
      toast.error('Please fill in all item details');
      return;
    }

    const qty = parseFloat(editQuantity);
    const price = parseFloat(editUnitPrice);
    const amount = qty * price;
    const profit = amount * 0.2; // 20% profit margin

    const updatedItems = saleItems.map(item => 
      item.id === editItemId 
        ? { ...item, name: editItemName, qty, price, amount, profit } 
        : item
    );

    setSaleItems(updatedItems);
    updateTotals(updatedItems);
    setEditItemId(null);
    
    toast.success('Item updated successfully');
  };

  const handlePrint = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(24);
    doc.setTextColor(34, 197, 94); // Green color
    doc.text('TrackNest Pro', 105, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Sales Invoice', 105, 35, { align: 'center' });
    
    // Invoice details
    doc.setFontSize(10);
    doc.text(`Invoice Number: ${invoiceNumber}`, 20, 50);
    doc.text(`Date: ${saleDate}`, 20, 60);
    doc.text(`Customer: ${customerName}`, 20, 70);
    if (customerEmail) doc.text(`Email: ${customerEmail}`, 20, 80);
    if (customerPhone) doc.text(`Phone: ${customerPhone}`, 20, 90);
    
    // Items table
    if (saleItems.length > 0) {
      const itemsData = saleItems.map(item => [
        item.name,
        item.qty.toString(),
                        `${formatAppCurrency(item.price)}`,
                `${formatAppCurrency(item.amount)}`,
                `${formatAppCurrency(item.profit)}`
      ]);
      
      autoTable(doc, {
        startY: 100,
        head: [['Item Name', 'Quantity', 'Unit Price', 'Amount', 'Profit']],
        body: itemsData,
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [34, 197, 94] }
      });
      
      // Totals
      const finalY = doc.lastAutoTable.finalY || 100;
      doc.setFontSize(12);
      doc.text(`Subtotal: ${formatAppCurrency(saleTotal - saleTax + saleDiscount)}`, 150, finalY + 15);
      doc.text(`Tax (18%): ${formatAppCurrency(saleTax)}`, 150, finalY + 25);
      doc.text(`Discount (5%): -${formatAppCurrency(saleDiscount)}`, 150, finalY + 35);
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(`Total: ${formatAppCurrency(saleTotal)}`, 150, finalY + 50);
      doc.text(`Profit: ${formatAppCurrency(saleProfit)}`, 150, finalY + 60);
    }
    
    doc.save(`invoice-${invoiceNumber}.pdf`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <ShoppingCart className="text-green-600" size={24} />
              Sales Plus
            </h2>
            <p className="text-gray-600 mt-1">Create and manage sales invoices</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              disabled={saleItems.length === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer size={16} />
              Print Invoice
            </button>
            <button
              onClick={resetSaleForm}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <RefreshCw size={16} />
              New Sale
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Sale Details */}
        <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="text-green-600" size={20} />
            Sale Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
              <input
                type="text"
                value={invoiceNumber}
                readOnly
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
              <input
                type="text"
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Email</label>
              <input
                type="email"
                placeholder="customer@email.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Phone</label>
            <input
              type="tel"
              placeholder="+1234567890"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
            />
          </div>
        </div>

        {/* Item Search and Selection */}
        <div className="mb-8 p-6 bg-gray-50 rounded-xl">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Package className="text-blue-600" size={20} />
            Add Items
          </h3>
          
                     {/* Stock Overview */}
           <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
             <div className="flex items-center justify-between mb-2">
               <h4 className="font-medium text-blue-900">Available Stock Overview</h4>
               <div className="flex items-center gap-2">
                 <span className="text-sm text-blue-600 font-medium">
                   {availableItems.length} items available
                 </span>
                 <button
                   onClick={refreshInventory}
                   disabled={isRefreshing}
                   className="p-1 text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
                   title="Refresh inventory"
                 >
                   <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                 </button>
               </div>
             </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {availableItems.filter(item => item.quantity > 10).length}
                </div>
                <div className="text-gray-600">Well Stocked</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-600">
                  {availableItems.filter(item => item.quantity > 0 && item.quantity <= 10).length}
                </div>
                <div className="text-gray-600">Low Stock</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">
                  {availableItems.filter(item => item.quantity === 0).length}
                </div>
                <div className="text-gray-600">Out of Stock</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  ${formatNumber(availableItems.reduce((sum, item) => sum + (item.quantity * (item.selling_price || item.cost_price)), 0))}
                </div>
                <div className="text-gray-600">Total Value</div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6" ref={searchRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Items</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-gray-400" size={20} />
              </div>
              <input
                type="text"
                placeholder="Search by name, SKU, category, or description..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setShowSearchResults(false);
                    setSelectedItem('');
                    setSelectedItemDetails(null);
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="text-gray-400 hover:text-gray-600" size={20} />
                </button>
              )}
            </div>
            
                         {/* Browse All Items Button */}
             <div className="mt-2 flex gap-2">
               <button
                 onClick={() => setShowAllItems(true)}
                 className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2"
               >
                 <Package size={16} />
                 Browse All Available Items ({availableItems.length})
               </button>
               <button
                 onClick={refreshInventory}
                 disabled={isRefreshing}
                 className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
               >
                 <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                 Sync Inventory
               </button>
             </div>

            {/* Enhanced Search Results Dropdown */}
            {showSearchResults && filteredItems.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                <div className="p-2 bg-gray-50 border-b border-gray-200">
                  <p className="text-sm text-gray-600 font-medium">
                    Found {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} • Click to select
                  </p>
                </div>
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleItemSelect(item)}
                    className="p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900">{item.name}</p>
                          {item.sku && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              {item.sku}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          {item.category && (
                            <p>Category: {item.category}</p>
                          )}
                          {item.description && (
                            <p className="text-gray-500 truncate max-w-xs">
                              {item.description}
                            </p>
                          )}
                          <p>Cost: ${formatNumber(item.cost_price)} | Selling: ${formatNumber(item.selling_price || item.cost_price)}</p>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          item.quantity > 10 
                            ? 'bg-green-100 text-green-800' 
                            : item.quantity > 0 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.quantity} in stock
                        </div>
                        <p className="text-lg font-bold text-green-600 mt-1">
                          ${formatNumber(item.selling_price || item.cost_price)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showSearchResults && filteredItems.length === 0 && searchTerm && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
                <p className="mb-2">No items found matching "{searchTerm}"</p>
                <button
                  onClick={() => {
                    setShowAllItems(true);
                    setShowSearchResults(false);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  Browse All Available Items
                </button>
              </div>
            )}
          </div>
          
          {/* Debug Information - Remove this in production */}
          {import.meta.env.DEV && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">Debug Info:</h4>
              <div className="text-xs text-yellow-700 space-y-1">
                <p>StockItems from parent: {stockItems?.length || 0} items</p>
                <p>AvailableInventory local: {availableInventory?.length || 0} items</p>
                <p>AvailableItems filtered: {availableItems?.length || 0} items</p>
                <p>Last refresh: {new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          )}

          {/* Enhanced Selected Item Details */}
          {selectedItemDetails && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-600" size={24} />
                  <div>
                    <h4 className="font-semibold text-green-800 text-lg">{selectedItemDetails.name}</h4>
                    {selectedItemDetails.sku && (
                      <p className="text-sm text-gray-600">SKU: {selectedItemDetails.sku}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedItemDetails.quantity > 10 
                      ? 'bg-green-100 text-green-800' 
                      : selectedItemDetails.quantity > 0 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedItemDetails.quantity} units available
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Category</p>
                  <p className="font-medium text-gray-800">{selectedItemDetails.category || 'General'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Cost Price</p>
                  <p className="font-medium text-red-600">${formatNumber(selectedItemDetails.cost_price)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Selling Price</p>
                  <p className="font-medium text-green-600">${formatNumber(selectedItemDetails.selling_price || selectedItemDetails.cost_price)}</p>
                </div>
              </div>
              
              {selectedItemDetails.description && (
                <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Description:</p>
                  <p className="text-sm text-gray-800">{selectedItemDetails.description}</p>
                </div>
              )}
            </div>
          )}

          {/* Item Entry Form */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                placeholder="Qty"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                max={selectedItemDetails?.quantity || 999}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
              <input
                type="number"
                placeholder="Price"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                step="0.01"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
              <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 font-medium">
                ${formatNumber((parseFloat(quantity) || 0) * (parseFloat(unitPrice) || 0))}
              </div>
            </div>
            <div className="flex items-end">
              <button 
                onClick={handleAddItem}
                disabled={!selectedItem || !quantity || !unitPrice}
                className="w-full py-3 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16} />
                Add Item
              </button>
            </div>
          </div>
        </div>

        {/* Sale Items Table */}
        {saleItems.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ShoppingCart className="text-purple-600" size={20} />
              Sale Items ({saleItems.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
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
                    <tr key={item.id} className="hover:bg-gray-50">
                      {editItemId === item.id ? (
                        <>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={editItemName}
                              onChange={(e) => setEditItemName(e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={editQuantity}
                              onChange={(e) => setEditQuantity(e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={editUnitPrice}
                              onChange={(e) => setEditUnitPrice(e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                          </td>
                          <td className="px-4 py-3 font-medium">${formatNumber(parseFloat(editQuantity) * parseFloat(editUnitPrice))}</td>
                          <td className="px-4 py-3 font-medium">${formatNumber((parseFloat(editQuantity) * parseFloat(editUnitPrice)) * 0.2)}</td>
                          <td className="px-4 py-3">
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
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{item.qty}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">${formatNumber(item.price)}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">${formatNumber(item.amount)}</td>
                          <td className="px-4 py-3 text-sm font-medium text-green-600">${formatNumber(item.profit)}</td>
                          <td className="px-4 py-3 text-sm">
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
        )}

        {/* Sale Summary */}
        {saleItems.length > 0 && (
          <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="text-purple-600" size={20} />
              Sale Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-lg border border-purple-200">
                <h4 className="text-sm font-medium text-gray-600">Subtotal</h4>
                <p className="text-2xl font-bold text-purple-600">{formatAppCurrency(saleTotal - saleTax + saleDiscount)}</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-purple-200">
                <h4 className="text-sm font-medium text-gray-600">Tax (18%)</h4>
                <p className="text-2xl font-bold text-red-600">{formatAppCurrency(saleTax)}</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-purple-200">
                <h4 className="text-sm font-medium text-gray-600">Discount (5%)</h4>
                <p className="text-2xl font-bold text-green-600">-{formatAppCurrency(saleDiscount)}</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-purple-200">
                <h4 className="text-sm font-medium text-gray-600">Total</h4>
                <p className="text-2xl font-bold text-purple-600">{formatAppCurrency(saleTotal)}</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="text-sm font-medium text-gray-600">Estimated Profit</h4>
              <p className="text-2xl font-bold text-green-600">{formatAppCurrency(saleProfit)}</p>
            </div>
          </div>
        )}

        {/* Save Sale Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSaveSale}
            disabled={isSaving || saleItems.length === 0 || !customerName}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-lg font-semibold"
          >
            {isSaving ? (
              <>
                <RefreshCw className="animate-spin" size={20} />
                Saving Sale...
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                Save Sale
              </>
            )}
          </button>
        </div>

        {/* Overall Sales Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <DollarSign className="text-blue-600" size={20} />
              Total Sales
            </h3>
            <p className="text-2xl font-bold text-blue-600">{formatAppCurrency(totalSales.amount)}</p>
          </div>
          <div className="p-6 bg-green-50 rounded-xl border border-green-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="text-green-600" size={20} />
              Total Profit
            </h3>
            <p className="text-2xl font-bold text-green-600">{formatAppCurrency(totalSales.profit)}</p>
          </div>
          <div className="p-6 bg-purple-50 rounded-xl border border-purple-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FileText className="text-purple-600" size={20} />
              Total Invoices
            </h3>
            <p className="text-2xl font-bold text-purple-600">{salesRecords.length}</p>
          </div>
        </div>
      </div>

      {/* Browse All Items Modal */}
      {showAllItems && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Package className="text-blue-600" size={24} />
                  Browse All Available Items
                </h3>
                <button
                  onClick={() => setShowAllItems(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-gray-600 mt-2">
                Click on any item to add it to your sale. Showing {availableItems.length} available items.
              </p>
            </div>
            
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setBrowseFilter('all')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    browseFilter === 'all' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  All Items ({availableItems.length})
                </button>
                <button
                  onClick={() => setBrowseFilter('well-stocked')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    browseFilter === 'well-stocked' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Well Stocked ({availableItems.filter(item => item.quantity > 10).length})
                </button>
                <button
                  onClick={() => setBrowseFilter('low-stock')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    browseFilter === 'low-stock' 
                      ? 'bg-yellow-500 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Low Stock ({availableItems.filter(item => item.quantity > 0 && item.quantity <= 10).length})
                </button>
              </div>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                                {availableItems
                  .filter(item => {
                    if (browseFilter === 'all') return true;
                    if (browseFilter === 'well-stocked') return item.quantity > 10;
                    if (browseFilter === 'low-stock') return item.quantity > 0 && item.quantity <= 10;
                    return true;
                  })
                  .map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      handleItemSelect(item);
                      setShowAllItems(false);
                    }}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md cursor-pointer transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.quantity > 10 
                          ? 'bg-green-100 text-green-800' 
                          : item.quantity > 0 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.quantity} in stock
                      </div>
                    </div>
                    
                    {item.sku && (
                      <p className="text-sm text-gray-500 mb-1">SKU: {item.sku}</p>
                    )}
                    
                    {item.category && (
                      <p className="text-sm text-gray-500 mb-1">Category: {item.category}</p>
                    )}
                    
                    {item.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        <p>Cost: ${formatNumber(item.cost_price)}</p>
                        <p className="font-semibold text-green-600">
                          Selling: ${formatNumber(item.selling_price || item.cost_price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          ${formatNumber(item.selling_price || item.cost_price)}
                        </div>
                        <div className="text-xs text-gray-500">per unit</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Total items: {availableItems.length} | 
                  Total value: ${formatNumber(availableItems.reduce((sum, item) => sum + (item.quantity * (item.selling_price || item.cost_price)), 0))}
                </p>
                <button
                  onClick={() => setShowAllItems(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesPlus;

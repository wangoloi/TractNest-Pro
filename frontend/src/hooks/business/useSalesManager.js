import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { mockSales, mockInventory } from '../../data/mock/salesData';
import { calculateStats, generateReceiptHTML } from '../../utils/helpers/salesHelpers';

export const useSalesManager = () => {
  const [sales, setSales] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('sales'); // 'sales' or 'inventory'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setSales(mockSales);
      setInventory(mockInventory);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleNewSale = (saleData) => {
    // Check inventory availability and update stock
    const updatedInventory = [...inventory];
    let hasInsufficientStock = false;
    const insufficientItems = [];

    for (const saleItem of saleData.items) {
      const inventoryItem = updatedInventory.find(inv => inv.name === saleItem.name);
      
      if (inventoryItem) {
        if (inventoryItem.quantity < saleItem.quantity) {
          hasInsufficientStock = true;
          insufficientItems.push(`${saleItem.name} (Available: ${inventoryItem.quantity}, Requested: ${saleItem.quantity})`);
        } else {
          // Reduce stock quantity
          inventoryItem.quantity -= saleItem.quantity;
          // Update status based on new quantity
          inventoryItem.status = inventoryItem.quantity > 10 ? 'in-stock' : inventoryItem.quantity > 0 ? 'low-stock' : 'out-of-stock';
        }
      } else {
        // Item not found in inventory - create it with negative quantity to indicate it was sold without being in stock
        updatedInventory.push({
          id: Date.now() + Math.random(),
          name: saleItem.name,
          quantity: -saleItem.quantity, // Negative to indicate sold without stock
          price: saleItem.price,
          cost: 0,
          status: 'out-of-stock',
          category: 'Unknown',
          supplier: '',
          supplierPhone: '',
          supplierEmail: '',
          dateAdded: new Date().toISOString()
        });
      }
    }

    if (hasInsufficientStock) {
      toast.error(`Insufficient stock for: ${insufficientItems.join(', ')}`);
      return;
    }

    const sale = {
      id: Date.now(),
      ...saleData,
      profit: saleData.items.reduce((sum, item) => {
        const inventoryItem = inventory.find(inv => inv.name === item.name);
        const cost = inventoryItem ? inventoryItem.cost : 0;
        return sum + ((item.price - cost) * item.quantity);
      }, 0)
    };

    // Update inventory
    setInventory(updatedInventory);
    setSales([sale, ...sales]);
    toast.success('Sale completed successfully! Stock updated.');
  };

  const handleNewStock = (stockData) => {
    // Check if item already exists in inventory
    const existingItemIndex = inventory.findIndex(item => item.name === stockData.name);
    
    if (existingItemIndex !== -1) {
      // Update existing item
      const updatedInventory = [...inventory];
      const existingItem = updatedInventory[existingItemIndex];
      
      // Add new quantity to existing stock
      existingItem.quantity += stockData.quantity;
      
      // Update other details if provided
      if (stockData.category) existingItem.category = stockData.category;
      if (stockData.sellingPrice) existingItem.price = stockData.sellingPrice;
      if (stockData.costPrice) existingItem.cost = stockData.costPrice;
      if (stockData.supplier) existingItem.supplier = stockData.supplier;
      if (stockData.supplierPhone) existingItem.supplierPhone = stockData.supplierPhone;
      if (stockData.supplierEmail) existingItem.supplierEmail = stockData.supplierEmail;
      
      // Update status based on new total quantity
      existingItem.status = existingItem.quantity > 10 ? 'in-stock' : existingItem.quantity > 0 ? 'low-stock' : 'out-of-stock';
      
      setInventory(updatedInventory);
      toast.success(`Stock updated successfully! ${stockData.quantity} units added to ${stockData.name}. Total: ${existingItem.quantity}`);
    } else {
      // Add new item
      const stockItem = {
        id: Date.now(),
        ...stockData,
        status: stockData.quantity > 10 ? 'in-stock' : stockData.quantity > 0 ? 'low-stock' : 'out-of-stock',
        dateAdded: new Date().toISOString()
      };

      setInventory([stockItem, ...inventory]);
      toast.success(`New stock item added successfully! ${stockData.quantity} units of ${stockData.name}`);
    }
  };

  const printReceipt = (sale) => {
    const printWindow = window.open('', '_blank');
    const receipt = generateReceiptHTML(sale);
    printWindow.document.write(receipt);
    printWindow.document.close();
    printWindow.print();
  };

  const stats = calculateStats(sales, inventory);

  return {
    sales,
    inventory,
    loading,
    view,
    setView,
    stats,
    handleNewSale,
    handleNewStock,
    printReceipt
  };
};

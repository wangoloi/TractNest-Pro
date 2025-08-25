import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { mockSales, mockInventory } from '../../data/mock/salesData';
import { generateReceiptNumber, calculateSaleTotal } from '../../utils/helpers/salesHelpers';

export const useUserSalesManager = () => {
  const [sales, setSales] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      setLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setSales(mockSales);
        setInventory(mockInventory);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleNewSale = (saleData) => {
    try {
      const newSale = {
        id: Date.now().toString(),
        receiptNumber: generateReceiptNumber(),
        date: new Date().toISOString(),
        customerName: saleData.customerName,
        items: saleData.items,
        total: calculateSaleTotal(saleData.items),
        notes: saleData.notes || ''
      };

      // Update sales
      setSales(prevSales => [newSale, ...prevSales]);

      // Update inventory - reduce quantities
      setInventory(prevInventory => 
        prevInventory.map(item => {
          const soldItem = saleData.items.find(saleItem => saleItem.name === item.name);
          if (soldItem) {
            return {
              ...item,
              quantity: Math.max(0, item.quantity - soldItem.quantity)
            };
          }
          return item;
        })
      );

      toast.success('Sale completed successfully!');
      return newSale;
    } catch (error) {
      console.error('Error creating sale:', error);
      toast.error('Failed to create sale');
      throw error;
    }
  };

  // Calculate statistics
  const stats = {
    todaySales: sales
      .filter(sale => {
        const today = new Date().toISOString().split('T')[0];
        const saleDate = new Date(sale.date).toISOString().split('T')[0];
        return saleDate === today;
      })
      .reduce((sum, sale) => sum + sale.total, 0),
    availableItems: inventory.filter(item => item.quantity > 0).length,
    lowStockItems: inventory.filter(item => item.quantity <= 5 && item.quantity > 0).length
  };

  // Get low stock items (quantity <= 5)
  const lowStockItems = inventory.filter(item => item.quantity <= 5 && item.quantity > 0);

  // Get today's sales
  const todaySales = sales.filter(sale => {
    const today = new Date().toISOString().split('T')[0];
    const saleDate = new Date(sale.date).toISOString().split('T')[0];
    return saleDate === today;
  });

  return {
    sales,
    inventory,
    loading,
    stats,
    handleNewSale,
    lowStockItems,
    todaySales
  };
};

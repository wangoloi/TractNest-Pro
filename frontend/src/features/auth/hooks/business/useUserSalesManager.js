import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { mockSales, mockInventory } from "../../../data/mock/salesData";

export const useUserSalesManager = () => {
  const [sales, setSales] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSales(mockSales);
      setInventory(mockInventory);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
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
      const inventoryItem = updatedInventory.find(
        (inv) => inv.name === saleItem.name
      );

      if (inventoryItem) {
        if (inventoryItem.quantity < saleItem.quantity) {
          hasInsufficientStock = true;
          insufficientItems.push(
            `${saleItem.name} (Available: ${inventoryItem.quantity}, Requested: ${saleItem.quantity})`
          );
        } else {
          // Reduce stock quantity
          inventoryItem.quantity -= saleItem.quantity;
          // Update status based on new quantity
          inventoryItem.status =
            inventoryItem.quantity > 10
              ? "in-stock"
              : inventoryItem.quantity > 0
              ? "low-stock"
              : "out-of-stock";
        }
      } else {
        // Item not found in inventory - create it with negative quantity to indicate it was sold without being in stock
        updatedInventory.push({
          id: Date.now() + Math.random(),
          name: saleItem.name,
          quantity: -saleItem.quantity, // Negative to indicate sold without stock
          price: saleItem.price,
          cost: 0,
          status: "out-of-stock",
          category: "Unknown",
          supplier: "",
          supplierPhone: "",
          supplierEmail: "",
          dateAdded: new Date().toISOString(),
        });
      }
    }

    if (hasInsufficientStock) {
      toast.error(`Insufficient stock for: ${insufficientItems.join(", ")}`);
      return;
    }

    const sale = {
      id: Date.now(),
      ...saleData,
      profit: saleData.items.reduce((sum, item) => {
        const inventoryItem = inventory.find((inv) => inv.name === item.name);
        const cost = inventoryItem ? inventoryItem.cost : 0;
        return sum + (item.price - cost) * item.quantity;
      }, 0),
    };

    // Update inventory
    setInventory(updatedInventory);
    setSales([sale, ...sales]);
    toast.success("Sale completed successfully! Stock updated.");
  };

  // Calculate statistics
  const stats = {
    todaySales: sales
      .filter((sale) => {
        const today = new Date().toDateString();
        const saleDate = new Date(sale.date).toDateString();
        return today === saleDate;
      })
      .reduce((sum, sale) => sum + sale.total, 0),
    availableItems: inventory.filter((item) => item.quantity > 0).length,
  };

  // Get low stock items (quantity <= 5)
  const lowStockItems = inventory.filter((item) => item.quantity <= 5);

  // Get today's sales
  const todaySales = sales.filter((sale) => {
    const today = new Date().toDateString();
    const saleDate = new Date(sale.date).toDateString();
    return today === saleDate;
  });

  return {
    sales,
    inventory,
    loading,
    stats,
    handleNewSale,
    lowStockItems,
    todaySales,
  };
};

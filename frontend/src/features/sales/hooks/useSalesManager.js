import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { mockSales, mockInventory } from "../../../data/mock/salesData";

export const useSalesManager = () => {
  const [sales, setSales] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("sales"); // 'sales' or 'inventory'

  // Generate auto-incremented receipt number
  const generateReceiptNumber = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const timestamp = Date.now();
    const sequence = String(timestamp % 10000).padStart(4, "0");
    return `RCP-${year}${month}${day}-${sequence}`;
  };

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
    // Check if this is an update or new sale
    const existingSaleIndex = sales.findIndex(
      (sale) => sale.id === saleData.id
    );

    if (existingSaleIndex !== -1) {
      // Update existing sale
      const updatedSales = [...sales];
      updatedSales[existingSaleIndex] = {
        ...updatedSales[existingSaleIndex],
        ...saleData,
        profit: saleData.items.reduce((sum, item) => {
          const inventoryItem = inventory.find((inv) => inv.name === item.name);
          const cost = inventoryItem ? inventoryItem.cost : 0;
          return sum + (item.price - cost) * item.quantity;
        }, 0),
      };
      setSales(updatedSales);
      toast.success("Sale updated successfully!");
    } else {
      // Create new sale
      const sale = {
        id: Date.now(),
        ...saleData,
        profit: saleData.items.reduce((sum, item) => {
          const inventoryItem = inventory.find((inv) => inv.name === item.name);
          const cost = inventoryItem ? inventoryItem.cost : 0;
          return sum + (item.price - cost) * item.quantity;
        }, 0),
      };

      // Update inventory based on sale
      updateInventoryFromSale(saleData.items);
      setSales([sale, ...sales]);
      toast.success("Sale completed successfully! Stock updated.");
    }
  };

  const updateInventoryFromSale = (saleItems) => {
    const updatedInventory = [...inventory];
    let hasInsufficientStock = false;
    const insufficientItems = [];

    for (const saleItem of saleItems) {
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
      return false;
    }

    setInventory(updatedInventory);
    return true;
  };

  const handleDeleteSale = (sale) => {
    if (
      window.confirm(
        `Are you sure you want to delete sale "${sale.receiptNumber}"?`
      )
    ) {
      // Remove the sale
      const updatedSales = sales.filter((s) => s.id !== sale.id);
      setSales(updatedSales);

      // Restore inventory (reverse the sale)
      const updatedInventory = [...inventory];
      for (const saleItem of sale.items) {
        const inventoryItem = updatedInventory.find(
          (inv) => inv.name === saleItem.name
        );
        if (inventoryItem) {
          inventoryItem.quantity += saleItem.quantity;
          inventoryItem.status =
            inventoryItem.quantity > 10
              ? "in-stock"
              : inventoryItem.quantity > 0
              ? "low-stock"
              : "out-of-stock";
        }
      }
      setInventory(updatedInventory);

      toast.success("Sale deleted successfully! Stock restored.");
    }
  };

  const handleNewStock = (stockData) => {
    // Check if item already exists in inventory
    const existingItemIndex = inventory.findIndex(
      (item) => item.name === stockData.name
    );

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
      if (stockData.supplierPhone)
        existingItem.supplierPhone = stockData.supplierPhone;
      if (stockData.supplierEmail)
        existingItem.supplierEmail = stockData.supplierEmail;

      // Update status based on new total quantity
      existingItem.status =
        existingItem.quantity > 10
          ? "in-stock"
          : existingItem.quantity > 0
          ? "low-stock"
          : "out-of-stock";

      setInventory(updatedInventory);
      toast.success(
        `Stock updated successfully! ${stockData.quantity} units added to ${stockData.name}. Total: ${existingItem.quantity}`
      );
    } else {
      // Add new item
      const stockItem = {
        id: Date.now(),
        ...stockData,
        status:
          stockData.quantity > 10
            ? "in-stock"
            : stockData.quantity > 0
            ? "low-stock"
            : "out-of-stock",
        dateAdded: new Date().toISOString(),
      };

      setInventory([stockItem, ...inventory]);
      toast.success(
        `New stock item added successfully! ${stockData.quantity} units of ${stockData.name}`
      );
    }
  };

  const handleDeleteStock = (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      const updatedInventory = inventory.filter((i) => i.id !== item.id);
      setInventory(updatedInventory);
      toast.success(`Stock item "${item.name}" deleted successfully!`);
    }
  };

  const printReceipt = (sale) => {
    const printWindow = window.open("", "_blank");
    const receipt = generateReceiptHTML(sale);
    printWindow.document.write(receipt);
    printWindow.document.close();
    printWindow.print();
  };

  // Calculate statistics
  const stats = {
    totalSales: sales.reduce((sum, sale) => sum + sale.total, 0),
    totalProfit: sales.reduce((sum, sale) => sum + sale.profit, 0),
    totalItems: inventory.length,
    todaySales: sales
      .filter((sale) => {
        const today = new Date().toDateString();
        const saleDate = new Date(sale.date).toDateString();
        return today === saleDate;
      })
      .reduce((sum, sale) => sum + sale.total, 0),
  };

  return {
    sales,
    inventory,
    loading,
    view,
    setView,
    stats,
    handleNewSale,
    handleNewStock,
    handleDeleteSale,
    handleDeleteStock,
    printReceipt,
  };
};

// Helper function to generate receipt HTML
const generateReceiptHTML = (sale) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt - ${sale.receiptNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .receipt { max-width: 400px; margin: 0 auto; border: 1px solid #ccc; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
        .item { display: flex; justify-content: space-between; margin: 5px 0; }
        .total { border-top: 1px solid #000; padding-top: 10px; margin-top: 20px; font-weight: bold; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <h2>TrackNest Pro</h2>
          <p>Receipt #${sale.receiptNumber}</p>
          <p>${new Date(sale.date).toLocaleDateString()}</p>
        </div>
        
        <div>
          <p><strong>Customer:</strong> ${sale.customerName}</p>
          <p><strong>Phone:</strong> ${sale.customerPhone || "N/A"}</p>
        </div>
        
        <div style="margin: 20px 0;">
          ${sale.items
            .map(
              (item) => `
            <div class="item">
              <span>${item.name} x ${item.quantity}</span>
              <span>UGX ${item.total.toLocaleString()}</span>
            </div>
          `
            )
            .join("")}
        </div>
        
        <div class="total">
          <div class="item">
            <span>Total</span>
            <span>UGX ${sale.total.toLocaleString()}</span>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>TrackNest Pro - Business Management System</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

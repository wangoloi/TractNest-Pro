import { z } from 'zod';
import { listSales, createSale, deleteSale } from './repository.js';
import * as inventoryRepository from '../inventory/repository.js';

const saleSchema = z.object({
  itemId: z.number().int().positive(),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
});

export async function listRecords() {
  return listSales();
}

export async function createRecord(payload, organizationId = 1, createdBy = 1) {
  const data = saleSchema.parse(payload);
  
  // First, get the inventory item to check availability and get details
  const inventoryItem = await inventoryRepository.getInventoryById(data.itemId, organizationId);
  
  if (!inventoryItem) {
    const error = new Error('Inventory item not found');
    error.status = 404;
    throw error;
  }
  
  // Check if we have enough stock
  if (inventoryItem.quantity < data.quantity) {
    const error = new Error(`Insufficient stock. Available: ${inventoryItem.quantity}, Requested: ${data.quantity}`);
    error.status = 400;
    throw error;
  }
  
  // Calculate total price and profit
  const totalPrice = Number((data.quantity * data.unitPrice).toFixed(2));
  const profit = Number((data.quantity * (data.unitPrice - inventoryItem.cost_price)).toFixed(2));
  
  // Create the sale transaction
  const sale = await createSale({
    itemId: data.itemId,
    itemName: inventoryItem.name,
    quantity: data.quantity,
    unitPrice: data.unitPrice,
    totalPrice,
    profit,
    organizationId,
    createdBy
  });
  
  // Update inventory quantity (reduce stock)
  const newQuantity = inventoryItem.quantity - data.quantity;
  await inventoryRepository.updateStockQuantity(data.itemId, newQuantity, organizationId);
  
  return sale;
}

export async function removeRecord(id) {
  return deleteSale(id);
}

// New function to get available inventory items for sales
export async function getAvailableInventory(organizationId = 1) {
  return inventoryRepository.listInventory(organizationId);
}




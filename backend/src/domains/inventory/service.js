import { z } from 'zod';
import * as repository from './repository.js';

const inventorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  quantity: z.number().min(0, 'Quantity must be non-negative'),
  unit: z.string().min(1, 'Unit is required'),
  cost_price: z.number().min(0, 'Cost price must be non-negative'),
  selling_price: z.number().min(0, 'Selling price must be non-negative'),
  reorder_level: z.number().min(0, 'Reorder level must be non-negative').optional(),
  supplier: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(['active', 'inactive', 'discontinued']).optional()
});

export async function listInventory(organizationId) {
  return repository.listInventory(organizationId);
}

export async function getInventoryById(id, organizationId) {
  return repository.getInventoryById(id, organizationId);
}

export async function createInventoryItem(data, organizationId, createdBy) {
  const validatedData = inventorySchema.parse(data);
  return repository.createInventoryItem(validatedData, organizationId, createdBy);
}

export async function updateInventoryItem(id, data, organizationId) {
  const validatedData = inventorySchema.partial().parse(data);
  const success = await repository.updateInventoryItem(id, validatedData, organizationId);
  
  if (!success) {
    const error = new Error('Inventory item not found');
    error.status = 404;
    throw error;
  }
  
  return repository.getInventoryById(id, organizationId);
}

export async function deleteInventoryItem(id, organizationId) {
  const success = await repository.deleteInventoryItem(id, organizationId);
  
  if (!success) {
    const error = new Error('Inventory item not found');
    error.status = 404;
    throw error;
  }
  
  return { id };
}

export async function getLowStockItems(organizationId, threshold = 10) {
  return repository.getLowStockItems(organizationId, threshold);
}

export async function updateStockQuantity(id, quantity, organizationId) {
  const success = await repository.updateStockQuantity(id, quantity, organizationId);
  
  if (!success) {
    const error = new Error('Inventory item not found');
    error.status = 404;
    throw error;
  }
  
  return repository.getInventoryById(id, organizationId);
}




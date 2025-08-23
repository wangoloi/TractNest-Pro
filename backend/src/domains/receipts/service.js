import { z } from 'zod';
import * as repository from './repository.js';

const receiptItemSchema = z.object({
  inventory_item_id: z.number().optional(),
  item_name: z.string().min(1, 'Item name is required'),
  sku: z.string().optional(),
  quantity: z.number().positive('Quantity must be positive'),
  unit_price: z.number().min(0, 'Unit price must be non-negative'),
  cost_price: z.number().min(0, 'Cost price must be non-negative'),
  total_price: z.number().min(0, 'Total price must be non-negative'),
  notes: z.string().optional()
});

const receiptSchema = z.object({
  supplier_name: z.string().min(1, 'Supplier name is required'),
  supplier_contact: z.string().optional(),
  supplier_email: z.string().email().optional(),
  supplier_phone: z.string().optional(),
  subtotal: z.number().min(0, 'Subtotal must be non-negative'),
  tax_amount: z.number().min(0, 'Tax amount must be non-negative'),
  discount_amount: z.number().min(0, 'Discount amount must be non-negative'),
  total_amount: z.number().min(0, 'Total amount must be non-negative'),
  notes: z.string().optional(),
  items: z.array(receiptItemSchema).min(1, 'At least one item is required')
});

export async function listReceipts(organizationId) {
  return repository.listReceipts(organizationId);
}

export async function getReceiptById(id, organizationId) {
  return repository.getReceiptById(id, organizationId);
}

export async function createReceipt(receiptData, organizationId, createdBy) {
  const validatedData = receiptSchema.parse(receiptData);
  return repository.createReceipt(validatedData, organizationId, createdBy);
}

export async function updateReceipt(id, receiptData, organizationId) {
  const validatedData = receiptSchema.partial().parse(receiptData);
  return repository.updateReceipt(id, validatedData, organizationId);
}

export async function deleteReceipt(id, organizationId) {
  return repository.deleteReceipt(id, organizationId);
}



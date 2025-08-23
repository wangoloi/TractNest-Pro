import { z } from 'zod';
import * as repository from './repository.js';

const invoiceItemSchema = z.object({
  inventory_item_id: z.number().optional(),
  item_name: z.string().min(1, 'Item name is required'),
  sku: z.string().optional(),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  unit_price: z.number().min(0, 'Unit price must be non-negative'),
  cost_price: z.number().min(0, 'Cost price must be non-negative'),
  total_price: z.number().min(0, 'Total price must be non-negative'),
  profit: z.number().min(0, 'Profit must be non-negative'),
  notes: z.string().optional()
});

const invoiceSchema = z.object({
  customer_name: z.string().min(1, 'Customer name is required'),
  customer_email: z.string().email().optional(),
  customer_phone: z.string().optional(),
  customer_address: z.string().optional(),
  subtotal: z.number().min(0, 'Subtotal must be non-negative'),
  tax_amount: z.number().min(0, 'Tax amount must be non-negative'),
  discount_amount: z.number().min(0, 'Discount amount must be non-negative'),
  total_amount: z.number().min(0, 'Total amount must be non-negative'),
  total_profit: z.number().min(0, 'Total profit must be non-negative'),
  payment_method: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required')
});

export async function listInvoices(organizationId, filters = {}) {
  return repository.listInvoices(organizationId, filters);
}

export async function getInvoiceById(id, organizationId) {
  const invoice = await repository.getInvoiceById(id, organizationId);
  
  if (!invoice) {
    const error = new Error('Invoice not found');
    error.status = 404;
    throw error;
  }
  
  return invoice;
}

export async function createInvoice(data, organizationId, createdBy) {
  const validatedData = invoiceSchema.parse(data);
  return repository.createInvoice(validatedData, organizationId, createdBy);
}

export async function updateInvoice(id, data, organizationId) {
  const validatedData = invoiceSchema.partial().parse(data);
  const success = await repository.updateInvoice(id, validatedData, organizationId);
  
  if (!success) {
    const error = new Error('Invoice not found');
    error.status = 404;
    throw error;
  }
  
  return repository.getInvoiceById(id, organizationId);
}

export async function deleteInvoice(id, organizationId) {
  const success = await repository.deleteInvoice(id, organizationId);
  
  if (!success) {
    const error = new Error('Invoice not found');
    error.status = 404;
    throw error;
  }
  
  return { id };
}

export async function updatePaymentStatus(id, paymentStatus, organizationId) {
  const validStatuses = ['pending', 'partial', 'paid', 'overdue'];
  
  if (!validStatuses.includes(paymentStatus)) {
    const error = new Error('Invalid payment status');
    error.status = 400;
    throw error;
  }
  
  const success = await repository.updatePaymentStatus(id, paymentStatus, organizationId);
  
  if (!success) {
    const error = new Error('Invoice not found');
    error.status = 404;
    throw error;
  }
  
  return repository.getInvoiceById(id, organizationId);
}

export async function getInvoiceStats(organizationId) {
  return repository.getInvoiceStats(organizationId);
}

export async function getRecentInvoices(organizationId, limit = 10) {
  return repository.getRecentInvoices(organizationId, limit);
}

export async function calculateInvoiceTotals(items) {
  const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  const taxAmount = subtotal * 0.05; // 5% tax rate
  const discountAmount = 0; // No discount by default
  const totalAmount = subtotal + taxAmount - discountAmount;
  const totalProfit = items.reduce((sum, item) => sum + item.profit, 0);
  
  return {
    subtotal,
    tax_amount: taxAmount,
    discount_amount: discountAmount,
    total_amount: totalAmount,
    total_profit: totalProfit
  };
}



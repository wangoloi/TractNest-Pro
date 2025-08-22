import { z } from 'zod';
import {
  createCustomer,
  listCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  searchCustomers
} from './repository.js';

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  whatsapp: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  customer_type: z.enum(['individual', 'business']).default('individual'),
  status: z.enum(['active', 'inactive']).default('active')
});

export async function createNewCustomer(payload, organizationId, createdBy) {
  const data = customerSchema.parse(payload);
  return createCustomer(data, organizationId, createdBy);
}

export async function getAllCustomers(organizationId) {
  return listCustomers(organizationId);
}

export async function getCustomer(id, organizationId) {
  return getCustomerById(id, organizationId);
}

export async function updateCustomerData(id, payload, organizationId) {
  const data = customerSchema.parse(payload);
  const success = await updateCustomer(id, data, organizationId);
  if (!success) {
    throw new Error('Customer not found or update failed');
  }
  return getCustomerById(id, organizationId);
}

export async function removeCustomer(id, organizationId) {
  const success = await deleteCustomer(id, organizationId);
  if (!success) {
    throw new Error('Customer not found or delete failed');
  }
  return { id };
}

export async function searchCustomersByName(searchTerm, organizationId) {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return listCustomers(organizationId);
  }
  return searchCustomers(searchTerm.trim(), organizationId);
}

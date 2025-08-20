import { z } from 'zod';
import { listSales, createSale, deleteSale } from './repository.js';

const saleSchema = z.object({
  itemId: z.number().int().positive(),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
});

export async function listRecords() {
  return listSales();
}

export async function createRecord(payload) {
  const data = saleSchema.parse(payload);
  const totalPrice = Number((data.quantity * data.unitPrice).toFixed(2));
  return createSale({ ...data, totalPrice });
}

export async function removeRecord(id) {
  return deleteSale(id);
}




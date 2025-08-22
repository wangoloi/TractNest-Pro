import { z } from 'zod';
import {
  createReceipt,
  addReceiptItem,
  listReceipts,
  findInventoryItemByName,
  insertInventoryItem,
  incrementInventoryQuantity,
} from './repository.js';

const receiptSchema = z.object({
  receiptNo: z.string().min(1),
  date: z.string().min(1),
  company: z.string().min(1),
  contact: z.string().optional(),
  items: z.array(z.object({ 
    name: z.string().min(1), 
    qty: z.union([z.number().positive(), z.string().transform(val => Number(val))]), 
    price: z.union([z.number().nonnegative(), z.string().transform(val => Number(val))]) 
  })),
});

export async function listAllReceipts(organizationId = 1) {
  return listReceipts(organizationId);
}

export async function createNewReceipt(payload, organizationId = 1, createdBy = 1) {
  const data = receiptSchema.parse(payload);
  const total = data.items.reduce((sum, it) => sum + it.qty * it.price, 0);
  const receiptId = await createReceipt({ receiptNo: data.receiptNo, date: data.date, company: data.company, contact: data.contact, total, organizationId, createdBy });
  for (const it of data.items) {
    const amount = it.qty * it.price;
    await addReceiptItem(receiptId, { name: it.name, qty: it.qty, unitPrice: it.price, amount });
    const existing = await findInventoryItemByName(it.name, organizationId);
    if (existing) {
      await incrementInventoryQuantity(existing.id, it.qty, it.price);
    } else {
      await insertInventoryItem({ name: it.name, qty: it.qty, unit: 'units', price: it.price, organizationId });
    }
  }
  const [created] = await listReceipts(organizationId);
  return created;
}



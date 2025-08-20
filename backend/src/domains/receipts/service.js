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
  items: z.array(z.object({ name: z.string().min(1), qty: z.number().positive(), price: z.number().nonnegative() })),
});

export async function listAllReceipts() {
  return listReceipts();
}

export async function createNewReceipt(payload) {
  const data = receiptSchema.parse(payload);
  const total = data.items.reduce((sum, it) => sum + it.qty * it.price, 0);
  const receiptId = await createReceipt({ receiptNo: data.receiptNo, date: data.date, company: data.company, contact: data.contact, total });
  for (const it of data.items) {
    const amount = it.qty * it.price;
    await addReceiptItem(receiptId, { name: it.name, qty: it.qty, unitPrice: it.price, amount });
    const existing = await findInventoryItemByName(it.name);
    if (existing) {
      await incrementInventoryQuantity(existing.id, it.qty, it.price);
    } else {
      await insertInventoryItem({ name: it.name, qty: it.qty, unit: 'units', price: it.price });
    }
  }
  const [created] = await listReceipts();
  return created;
}



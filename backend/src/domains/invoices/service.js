import { z } from 'zod';
import { listInvoices, createInvoice, addInvoiceItem, decrementInventoryQuantityByName } from './repository.js';

const invoiceSchema = z.object({
  invoiceNo: z.string().min(1),
  date: z.string().min(1),
  customer: z.string().min(1),
  items: z.array(z.object({ name: z.string().min(1), qty: z.number().positive(), price: z.number().nonnegative() })),
});

export async function listAllInvoices() {
  return listInvoices();
}

export async function createNewInvoice(payload) {
  const data = invoiceSchema.parse(payload);
  const total = data.items.reduce((s, it) => s + it.qty * it.price, 0);
  const profit = data.items.reduce((s, it) => s + (it.qty * it.price * 0.2), 0);
  const invoiceId = await createInvoice({ invoiceNo: data.invoiceNo, date: data.date, customer: data.customer, total, profit });
  for (const it of data.items) {
    const amount = it.qty * it.price;
    const itemProfit = amount * 0.2;
    await addInvoiceItem(invoiceId, { name: it.name, qty: it.qty, unitPrice: it.price, amount, profit: itemProfit });
    await decrementInventoryQuantityByName(it.name, it.qty);
  }
  const [created] = await listInvoices();
  return created;
}



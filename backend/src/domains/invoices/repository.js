import { query } from '../../infrastructure/database/mysql.js';

export async function listInvoices() {
  const invoices = await query('SELECT id, invoice_no AS invoiceNo, date, customer_name AS customer, total_amount AS total, total_profit AS profit, created_at AS createdAt FROM invoices ORDER BY created_at DESC');
  const ids = invoices.map(i => i.id);
  if (ids.length === 0) return [];
  const items = await query(`SELECT id, invoice_id AS invoiceId, item_name AS name, quantity AS qty, unit_price AS unitPrice, total_price AS amount, profit FROM invoice_items WHERE invoice_id IN (${ids.map(()=>'?').join(',')})`, ids);
  const map = new Map();
  invoices.forEach(i => map.set(i.id, { ...i, items: [] }));
  items.forEach(it => { map.get(it.invoiceId).items.push({ id: it.id, name: it.name, qty: Number(it.qty), price: Number(it.unitPrice), amount: Number(it.amount), profit: Number(it.profit) }); });
  return Array.from(map.values());
}

export async function createInvoice({ invoiceNo, date, customer, total, profit }) {
  const result = await query('INSERT INTO invoices (invoice_no, date, customer_name, total_amount, total_profit, organization_id, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)', [invoiceNo, date, customer, total, profit, 1, 1]);
  return result.insertId;
}

export async function addInvoiceItem(invoiceId, { name, qty, unitPrice, amount, profit }) {
  await query('INSERT INTO invoice_items (invoice_id, item_name, quantity, unit_price, total_price, profit) VALUES (?, ?, ?, ?, ?, ?)', [invoiceId, name, qty, unitPrice, amount, profit]);
}

export async function decrementInventoryQuantityByName(name, qty) {
  await query('UPDATE inventory_items SET quantity = GREATEST(quantity - ?, 0) WHERE name = ?', [qty, name]);
}



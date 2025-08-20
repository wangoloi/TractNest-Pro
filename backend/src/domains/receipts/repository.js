import { query } from '../../infrastructure/database/mysql.js';

export async function createReceipt({ receiptNo, date, company, contact, total }) {
  const result = await query(
    'INSERT INTO receipts (receipt_no, date, company, contact, total) VALUES (?, ?, ?, ?, ?)',
    [receiptNo, date, company, contact || null, total]
  );
  return result.insertId;
}

export async function addReceiptItem(receiptId, { name, qty, unitPrice, amount }) {
  await query(
    'INSERT INTO receipt_items (receipt_id, name, qty, unit_price, amount) VALUES (?, ?, ?, ?, ?)',
    [receiptId, name, qty, unitPrice, amount]
  );
}

export async function listReceipts() {
  const receipts = await query('SELECT id, receipt_no AS receiptNo, date, company, contact, total, created_at AS createdAt FROM receipts ORDER BY created_at DESC');
  const receiptIds = receipts.map(r => r.id);
  if (receiptIds.length === 0) return [];
  const items = await query(`SELECT id, receipt_id AS receiptId, name, qty, unit_price AS unitPrice, amount FROM receipt_items WHERE receipt_id IN (${receiptIds.map(()=>'?').join(',')})`, receiptIds);
  const map = new Map();
  receipts.forEach(r => map.set(r.id, { ...r, items: [] }));
  items.forEach(it => { map.get(it.receiptId).items.push({ id: it.id, name: it.name, qty: Number(it.qty), price: Number(it.unitPrice), amount: Number(it.amount) }); });
  return Array.from(map.values());
}

export async function findInventoryItemByName(name) {
  const rows = await query('SELECT id, name, quantity AS qty, unit, price FROM inventory_items WHERE name = ?', [name]);
  return rows[0] || null;
}

export async function insertInventoryItem({ name, qty, unit, price }) {
  const result = await query('INSERT INTO inventory_items (name, quantity, unit, price) VALUES (?, ?, ?, ?)', [name, qty, unit, price]);
  return result.insertId;
}

export async function incrementInventoryQuantity(id, qty, price) {
  await query('UPDATE inventory_items SET quantity = quantity + ?, price = ? WHERE id = ?', [qty, price, id]);
}

export async function deleteReceipt(id) {
  await query('DELETE FROM receipts WHERE id = ?', [id]);
  return { id };
}



import { query } from '../../infrastructure/database/mysql.js';

export async function createReceipt({ receiptNo, date, company, contact, total, organizationId = 1, createdBy = 1 }) {
  const result = await query(
    'INSERT INTO receipts (receipt_no, date, supplier_name, supplier_contact, total_amount, organization_id, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [receiptNo, date, company, contact || null, total, organizationId, createdBy]
  );
  return result.insertId;
}

export async function addReceiptItem(receiptId, { name, qty, unitPrice, amount }) {
  await query(
    'INSERT INTO receipt_items (receipt_id, item_name, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)',
    [receiptId, name, qty, unitPrice, amount]
  );
}

export async function listReceipts(organizationId = 1) {
  const receipts = await query('SELECT id, receipt_no AS receiptNo, date, supplier_name AS company, supplier_contact AS contact, total_amount AS total, created_at AS createdAt FROM receipts WHERE organization_id = ? ORDER BY created_at DESC', [organizationId]);
  const receiptIds = receipts.map(r => r.id);
  if (receiptIds.length === 0) return [];
  const items = await query(`SELECT id, receipt_id AS receiptId, item_name AS name, quantity AS qty, unit_price AS unitPrice, total_price AS amount FROM receipt_items WHERE receipt_id IN (${receiptIds.map(()=>'?').join(',')})`, receiptIds);
  const map = new Map();
  receipts.forEach(r => map.set(r.id, { ...r, items: [] }));
  items.forEach(it => { map.get(it.receiptId).items.push({ id: it.id, name: it.name, qty: Number(it.qty), price: Number(it.unitPrice), amount: Number(it.amount) }); });
  return Array.from(map.values());
}

export async function findInventoryItemByName(name, organizationId = 1) {
  const rows = await query('SELECT id, name, quantity AS qty, unit, selling_price AS price FROM inventory_items WHERE name = ? AND organization_id = ?', [name, organizationId]);
  return rows[0] || null;
}

export async function insertInventoryItem({ name, qty, unit, price, organizationId = 1 }) {
  const result = await query('INSERT INTO inventory_items (name, quantity, unit, selling_price, organization_id, created_by) VALUES (?, ?, ?, ?, ?, ?)', [name, qty, unit, price, organizationId, 1]);
  return result.insertId;
}

export async function incrementInventoryQuantity(id, qty, price) {
  await query('UPDATE inventory_items SET quantity = quantity + ?, selling_price = ? WHERE id = ?', [qty, price, id]);
}

export async function deleteReceipt(id) {
  await query('DELETE FROM receipts WHERE id = ?', [id]);
  return { id };
}



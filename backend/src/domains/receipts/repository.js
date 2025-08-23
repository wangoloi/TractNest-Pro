import { query } from '../../infrastructure/database/mysql.js';

export async function listReceipts(organizationId) {
  return query(`
    SELECT 
      id, receipt_no, supplier_name, supplier_contact, supplier_email, supplier_phone,
      subtotal, tax_amount, discount_amount, total_amount, notes, status,
      created_at AS createdAt, updated_at AS updatedAt
    FROM receipts 
    WHERE organization_id = ? 
    ORDER BY created_at DESC
  `, [organizationId]);
}

export async function getReceiptById(id, organizationId) {
  const rows = await query(`
    SELECT 
      id, receipt_no, supplier_name, supplier_contact, supplier_email, supplier_phone,
      subtotal, tax_amount, discount_amount, total_amount, notes, status,
      created_at AS createdAt, updated_at AS updatedAt
    FROM receipts 
    WHERE id = ? AND organization_id = ?
  `, [id, organizationId]);
  
  if (rows.length === 0) return null;
  
  const receipt = rows[0];
  
  // Get receipt items
  const items = await query(`
    SELECT 
      id, receipt_id, inventory_item_id, item_name, sku, quantity, 
      unit_price, cost_price, total_price, notes
    FROM receipt_items 
    WHERE receipt_id = ?
  `, [id]);
  
  return { ...receipt, items };
}

export async function createReceipt(receiptData, organizationId, createdBy) {
  const {
    supplier_name, supplier_contact, supplier_email, supplier_phone,
    subtotal, tax_amount, discount_amount, total_amount, notes, items
  } = receiptData;

  const result = await query(`
    INSERT INTO receipts (
      organization_id, supplier_name, supplier_contact, supplier_email, supplier_phone,
      subtotal, tax_amount, discount_amount, total_amount, notes, status, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
  `, [organizationId, supplier_name, supplier_contact, supplier_email, supplier_phone, 
      subtotal, tax_amount, discount_amount, total_amount, notes, createdBy]);

  const receiptId = result.insertId;

  if (items && items.length > 0) {
    for (const item of items) {
      await query(`
        INSERT INTO receipt_items (
          receipt_id, inventory_item_id, item_name, sku, quantity, 
          unit_price, cost_price, total_price, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [receiptId, item.inventory_item_id, item.item_name, item.sku, 
          item.quantity, item.unit_price, item.cost_price, item.total_price, item.notes]);

      // Update inventory quantity if item exists
      if (item.inventory_item_id) {
        await query(`
          UPDATE inventory_items 
          SET quantity = quantity + ? 
          WHERE id = ? AND organization_id = ?
        `, [item.quantity, item.inventory_item_id, organizationId]);
      }
    }
  }

  return getReceiptById(receiptId, organizationId);
}

export async function updateReceipt(id, receiptData, organizationId) {
  const {
    supplier_name, supplier_contact, supplier_email, supplier_phone,
    subtotal, tax_amount, discount_amount, total_amount, notes, status
  } = receiptData;

  const result = await query(`
    UPDATE receipts 
    SET supplier_name = ?, supplier_contact = ?, supplier_email = ?, supplier_phone = ?,
        subtotal = ?, tax_amount = ?, discount_amount = ?, total_amount = ?, notes = ?, status = ?
    WHERE id = ? AND organization_id = ?
  `, [supplier_name, supplier_contact, supplier_email, supplier_phone,
      subtotal, tax_amount, discount_amount, total_amount, notes, status, id, organizationId]);

  if (result.affectedRows === 0) return null;

  return getReceiptById(id, organizationId);
}

export async function deleteReceipt(id, organizationId) {
  const result = await query('DELETE FROM receipts WHERE id = ? AND organization_id = ?', [id, organizationId]);
  return result.affectedRows > 0;
}



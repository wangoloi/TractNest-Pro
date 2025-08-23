import { query } from '../../infrastructure/database/mysql.js';

export async function listInvoices(organizationId, filters = {}) {
  let sql = `
    SELECT 
      i.id, i.invoice_no, i.date, i.customer_name, i.customer_email, i.customer_phone,
      i.subtotal, i.tax_amount, i.discount_amount, i.total_amount, i.total_profit,
      i.payment_status, i.payment_method, i.notes, i.status, i.created_at, i.updated_at,
      u.username as created_by_name
    FROM invoices i
    LEFT JOIN users u ON i.created_by = u.id
    WHERE i.organization_id = ?
  `;
  
  const params = [organizationId];
  
  if (filters.status) {
    sql += ' AND i.status = ?';
    params.push(filters.status);
  }
  
  if (filters.payment_status) {
    sql += ' AND i.payment_status = ?';
    params.push(filters.payment_status);
  }
  
  if (filters.customer_name) {
    sql += ' AND i.customer_name LIKE ?';
    params.push(`%${filters.customer_name}%`);
  }
  
  sql += ' ORDER BY i.created_at DESC';
  
  return query(sql, params);
}

export async function getInvoiceById(id, organizationId) {
  const rows = await query(`
    SELECT 
      i.id, i.invoice_no, i.date, i.customer_name, i.customer_email, i.customer_phone, i.customer_address,
      i.subtotal, i.tax_amount, i.discount_amount, i.total_amount, i.total_profit,
      i.payment_status, i.payment_method, i.notes, i.status, i.created_at, i.updated_at,
      u.username as created_by_name
    FROM invoices i
    LEFT JOIN users u ON i.created_by = u.id
    WHERE i.id = ? AND i.organization_id = ?
  `, [id, organizationId]);
  
  if (rows.length === 0) return null;
  
  const invoice = rows[0];
  
  // Get invoice items
  const items = await query(`
    SELECT 
      ii.id, ii.inventory_item_id, ii.item_name, ii.sku, ii.quantity, 
      ii.unit_price, ii.cost_price, ii.total_price, ii.profit, ii.notes
    FROM invoice_items ii
    WHERE ii.invoice_id = ?
  `, [id]);
  
  invoice.items = items;
  
  return invoice;
}

export async function createInvoice(invoiceData, organizationId, createdBy) {
  const {
    customer_name, customer_email, customer_phone, customer_address,
    subtotal, tax_amount, discount_amount, total_amount, total_profit,
    payment_method, notes, items
  } = invoiceData;

  // Generate invoice number
  const invoiceNo = await generateInvoiceNumber(organizationId);

  const result = await query(`
    INSERT INTO invoices (
      organization_id, invoice_no, date, customer_name, customer_email, customer_phone, customer_address,
      subtotal, tax_amount, discount_amount, total_amount, total_profit,
      payment_status, payment_method, notes, status, created_by
    ) VALUES (?, ?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, 'draft', ?)
  `, [
    organizationId, invoiceNo, customer_name, customer_email, customer_phone, customer_address,
    subtotal, tax_amount, discount_amount, total_amount, total_profit,
    payment_method, notes, createdBy
  ]);

  const invoiceId = result.insertId;

  // Insert invoice items
  if (items && items.length > 0) {
    for (const item of items) {
      await query(`
        INSERT INTO invoice_items (
          invoice_id, inventory_item_id, item_name, sku, quantity, 
          unit_price, cost_price, total_price, profit, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        invoiceId, item.inventory_item_id, item.item_name, item.sku, item.quantity,
        item.unit_price, item.cost_price, item.total_price, item.profit, item.notes
      ]);

      // Update inventory quantity if item exists
      if (item.inventory_item_id) {
        await query(`
          UPDATE inventory_items 
          SET quantity = quantity - ? 
          WHERE id = ? AND organization_id = ?
        `, [item.quantity, item.inventory_item_id, organizationId]);
      }
    }
  }

  return getInvoiceById(invoiceId, organizationId);
}

export async function updateInvoice(id, updates, organizationId) {
  const result = await query(`
    UPDATE invoices 
    SET 
      customer_name = ?, customer_email = ?, customer_phone = ?, customer_address = ?,
      subtotal = ?, tax_amount = ?, discount_amount = ?, total_amount = ?, total_profit = ?,
      payment_status = ?, payment_method = ?, notes = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND organization_id = ?
  `, [
    updates.customer_name, updates.customer_email, updates.customer_phone, updates.customer_address,
    updates.subtotal, updates.tax_amount, updates.discount_amount, updates.total_amount, updates.total_profit,
    updates.payment_status, updates.payment_method, updates.notes, updates.status,
    id, organizationId
  ]);

  return result.affectedRows > 0;
}

export async function deleteInvoice(id, organizationId) {
  const result = await query(`
    DELETE FROM invoices 
    WHERE id = ? AND organization_id = ?
  `, [id, organizationId]);

  return result.affectedRows > 0;
}

export async function updatePaymentStatus(id, paymentStatus, organizationId) {
  const result = await query(`
    UPDATE invoices 
    SET payment_status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND organization_id = ?
  `, [paymentStatus, id, organizationId]);

  return result.affectedRows > 0;
}

async function generateInvoiceNumber(organizationId) {
  const [result] = await query(`
    SELECT COUNT(*) as count 
    FROM invoices 
    WHERE organization_id = ? AND YEAR(created_at) = YEAR(CURDATE())
  `, [organizationId]);

  const count = result.count + 1;
  const year = new Date().getFullYear();
  return `INV-${year}-${count.toString().padStart(4, '0')}`;
}

export async function getInvoiceStats(organizationId) {
  const [stats] = await query(`
    SELECT 
      COUNT(*) as total_invoices,
      SUM(total_amount) as total_sales,
      SUM(total_profit) as total_profit,
      AVG(total_amount) as avg_order_value,
      COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_invoices,
      COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_invoices
    FROM invoices 
    WHERE organization_id = ?
  `, [organizationId]);

  return stats;
}

export async function getRecentInvoices(organizationId, limit = 10) {
  return query(`
    SELECT 
      id, invoice_no, date, customer_name, total_amount, payment_status, status
    FROM invoices 
    WHERE organization_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `, [organizationId, limit]);
}



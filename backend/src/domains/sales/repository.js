import { query } from '../../infrastructure/database/mysql.js';

export async function listSales(organizationId = 1) {
  try {
    return await query(`
      SELECT 
        st.id, st.item_id AS itemId, st.item_name AS itemName, st.quantity, st.unit_price AS unitPrice, 
        st.total_price AS totalPrice, st.profit, st.created_at AS createdAt,
        st.organization_id AS organizationId
      FROM sales_transactions st
      WHERE st.organization_id = ?
      ORDER BY st.created_at DESC
    `, [organizationId]);
  } catch (error) {
    console.error('Sales query error:', error.message);
    // Return empty array if table doesn't exist or other errors
    return [];
  }
}

export async function createSale({ itemId, itemName, quantity, unitPrice, totalPrice, profit, organizationId, createdBy }) {
  const result = await query(
    'INSERT INTO sales_transactions (organization_id, item_id, item_name, quantity, unit_price, total_price, profit, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
    [organizationId, itemId, itemName, quantity, unitPrice, totalPrice, profit, createdBy]
  );
  const rows = await query(
    'SELECT id, item_id AS itemId, item_name AS itemName, quantity, unit_price AS unitPrice, total_price AS totalPrice, profit, transaction_date AS createdAt FROM sales_transactions WHERE id = ?', 
    [result.insertId]
  );
  return rows[0];
}

export async function deleteSale(id, organizationId = 1) {
  // First get the sale to restore inventory
  const sale = await query(
    'SELECT item_id, quantity FROM sales_transactions WHERE id = ? AND organization_id = ?',
    [id, organizationId]
  );
  
  if (sale.length > 0) {
    // Restore the inventory quantity
    await query(
      'UPDATE inventory_items SET quantity = quantity + ? WHERE id = ? AND organization_id = ?',
      [sale[0].quantity, sale[0].item_id, organizationId]
    );
  }
  
  await query('DELETE FROM sales_transactions WHERE id = ? AND organization_id = ?', [id, organizationId]);
  return { id };
}




import { query } from '../../infrastructure/database/mysql.js';

export async function listSales() {
  return query(`
    SELECT s.id, s.item_id AS itemId, s.quantity, s.unit_price AS unitPrice, s.total_price AS totalPrice, s.created_at AS createdAt,
           i.name AS itemName
    FROM sales s
    JOIN inventory_items i ON i.id = s.item_id
    ORDER BY s.created_at DESC
  `);
}

export async function createSale({ itemId, quantity, unitPrice, totalPrice }) {
  const result = await query('INSERT INTO sales (item_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?)', [itemId, quantity, unitPrice, totalPrice]);
  const rows = await query('SELECT id, item_id AS itemId, quantity, unit_price AS unitPrice, total_price AS totalPrice, created_at AS createdAt FROM sales WHERE id = ?', [result.insertId]);
  return rows[0];
}

export async function deleteSale(id) {
  await query('DELETE FROM sales WHERE id = ?', [id]);
  return { id };
}




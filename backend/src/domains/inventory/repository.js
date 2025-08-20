import { query } from '../../infrastructure/database/mysql.js';

export async function listInventory(organizationId) {
  return query(`
    SELECT 
      id, name, sku, description, category, quantity, unit, 
      cost_price, selling_price, reorder_level, supplier, location, status,
      created_at AS createdAt, updated_at AS updatedAt
    FROM inventory_items 
    WHERE organization_id = ? 
    ORDER BY created_at DESC
  `, [organizationId]);
}

export async function getInventoryById(id, organizationId) {
  const rows = await query(`
    SELECT 
      id, name, sku, description, category, quantity, unit, 
      cost_price, selling_price, reorder_level, supplier, location, status,
      created_at AS createdAt, updated_at AS updatedAt
    FROM inventory_items 
    WHERE id = ? AND organization_id = ?
  `, [id, organizationId]);
  return rows[0] || null;
}

export async function createInventoryItem(item, organizationId, createdBy) {
  const result = await query(`
    INSERT INTO inventory_items (
      organization_id, name, sku, description, category, quantity, unit,
      cost_price, selling_price, reorder_level, supplier, location, status, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    organizationId, item.name, item.sku, item.description, item.category,
    item.quantity, item.unit, item.cost_price, item.selling_price,
    item.reorder_level, item.supplier, item.location, item.status || 'active', createdBy
  ]);
  
  return { id: result.insertId, ...item };
}

export async function updateInventoryItem(id, updates, organizationId) {
  const result = await query(`
    UPDATE inventory_items 
    SET 
      name = ?, sku = ?, description = ?, category = ?, quantity = ?, unit = ?,
      cost_price = ?, selling_price = ?, reorder_level = ?, supplier = ?, 
      location = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND organization_id = ?
  `, [
    updates.name, updates.sku, updates.description, updates.category,
    updates.quantity, updates.unit, updates.cost_price, updates.selling_price,
    updates.reorder_level, updates.supplier, updates.location, updates.status,
    id, organizationId
  ]);
  
  return result.affectedRows > 0;
}

export async function deleteInventoryItem(id, organizationId) {
  const result = await query(`
    DELETE FROM inventory_items 
    WHERE id = ? AND organization_id = ?
  `, [id, organizationId]);
  
  return result.affectedRows > 0;
}

export async function getLowStockItems(organizationId, threshold = 10) {
  return query(`
    SELECT 
      id, name, sku, quantity, reorder_level, supplier
    FROM inventory_items 
    WHERE organization_id = ? AND quantity <= ?
    ORDER BY quantity ASC
  `, [organizationId, threshold]);
}

export async function updateStockQuantity(id, quantity, organizationId) {
  const result = await query(`
    UPDATE inventory_items 
    SET quantity = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND organization_id = ?
  `, [quantity, id, organizationId]);
  
  return result.affectedRows > 0;
}




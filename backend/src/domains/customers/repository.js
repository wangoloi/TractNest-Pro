import { query } from '../../infrastructure/database/mysql.js';

export async function createCustomer(customerData, organizationId, createdBy) {
  const result = await query(`
    INSERT INTO customers (
      organization_id, name, email, phone, whatsapp, address, 
      customer_type, status, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    organizationId, customerData.name, customerData.email, 
    customerData.phone, customerData.whatsapp, customerData.address,
    customerData.customer_type || 'individual', customerData.status || 'active', createdBy
  ]);
  
  return { id: result.insertId, ...customerData };
}

export async function listCustomers(organizationId) {
  return query(`
    SELECT 
      id, name, email, phone, whatsapp, address, customer_type, 
      status, created_at AS createdAt, updated_at AS updatedAt
    FROM customers 
    WHERE organization_id = ? 
    ORDER BY created_at DESC
  `, [organizationId]);
}

export async function getCustomerById(id, organizationId) {
  const rows = await query(`
    SELECT 
      id, name, email, phone, whatsapp, address, customer_type, 
      status, created_at AS createdAt, updated_at AS updatedAt
    FROM customers 
    WHERE id = ? AND organization_id = ?
  `, [id, organizationId]);
  
  return rows[0] || null;
}

export async function updateCustomer(id, updates, organizationId) {
  const result = await query(`
    UPDATE customers 
    SET 
      name = ?, email = ?, phone = ?, whatsapp = ?, address = ?,
      customer_type = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND organization_id = ?
  `, [
    updates.name, updates.email, updates.phone, updates.whatsapp,
    updates.address, updates.customer_type, updates.status, id, organizationId
  ]);
  
  return result.affectedRows > 0;
}

export async function deleteCustomer(id, organizationId) {
  const result = await query(`
    DELETE FROM customers 
    WHERE id = ? AND organization_id = ?
  `, [id, organizationId]);
  
  return result.affectedRows > 0;
}

export async function searchCustomers(searchTerm, organizationId) {
  return query(`
    SELECT 
      id, name, email, phone, whatsapp, address, customer_type, 
      status, created_at AS createdAt, updated_at AS updatedAt
    FROM customers 
    WHERE organization_id = ? 
    AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)
    ORDER BY name ASC
  `, [organizationId, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]);
}

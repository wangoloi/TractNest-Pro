import { query } from '../../infrastructure/database/mysql.js';

export async function createMessage(messageData, organizationId, userId) {
  const result = await query(`
    INSERT INTO customer_messages (
      organization_id, customer_id, user_id, subject, message, 
      message_type, status, priority
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    organizationId, messageData.customer_id || null, userId,
    messageData.subject, messageData.message, 
    messageData.message_type || 'support', 'new', messageData.priority || 'medium'
  ]);
  
  return { id: result.insertId, ...messageData };
}

export async function listMessages(organizationId, filters = {}) {
  let sql = `
    SELECT 
      cm.id, cm.subject, cm.message, cm.message_type, cm.status, cm.priority,
      cm.admin_response, cm.created_at AS createdAt, cm.updated_at AS updatedAt,
      c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone,
      u.first_name, u.last_name, u.email AS user_email
    FROM customer_messages cm
    LEFT JOIN customers c ON cm.customer_id = c.id
    LEFT JOIN users u ON cm.user_id = u.id
    WHERE cm.organization_id = ?
  `;
  
  const params = [organizationId];
  
  if (filters.status) {
    sql += ' AND cm.status = ?';
    params.push(filters.status);
  }
  
  if (filters.priority) {
    sql += ' AND cm.priority = ?';
    params.push(filters.priority);
  }
  
  if (filters.message_type) {
    sql += ' AND cm.message_type = ?';
    params.push(filters.message_type);
  }
  
  sql += ' ORDER BY cm.created_at DESC';
  
  return query(sql, params);
}

export async function getMessageById(id, organizationId) {
  const rows = await query(`
    SELECT 
      cm.id, cm.subject, cm.message, cm.message_type, cm.status, cm.priority,
      cm.admin_response, cm.created_at AS createdAt, cm.updated_at AS updatedAt,
      cm.resolved_at AS resolvedAt,
      c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone,
      u.first_name, u.last_name, u.email AS user_email,
      r.first_name AS resolver_first_name, r.last_name AS resolver_last_name
    FROM customer_messages cm
    LEFT JOIN customers c ON cm.customer_id = c.id
    LEFT JOIN users u ON cm.user_id = u.id
    LEFT JOIN users r ON cm.resolved_by = r.id
    WHERE cm.id = ? AND cm.organization_id = ?
  `, [id, organizationId]);
  
  return rows[0] || null;
}

export async function updateMessageStatus(id, updates, organizationId, resolvedBy = null) {
  const result = await query(`
    UPDATE customer_messages 
    SET 
      status = ?, admin_response = ?, resolved_by = ?, 
      resolved_at = CASE WHEN ? = 'resolved' THEN CURRENT_TIMESTAMP ELSE NULL END,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND organization_id = ?
  `, [
    updates.status, updates.admin_response || null, resolvedBy,
    updates.status, id, organizationId
  ]);
  
  return result.affectedRows > 0;
}

export async function deleteMessage(id, organizationId) {
  const result = await query(`
    DELETE FROM customer_messages 
    WHERE id = ? AND organization_id = ?
  `, [id, organizationId]);
  
  return result.affectedRows > 0;
}

export async function getMessageStats(organizationId) {
  const stats = await query(`
    SELECT 
      status,
      COUNT(*) as count
    FROM customer_messages 
    WHERE organization_id = ?
    GROUP BY status
  `, [organizationId]);
  
  return stats;
}

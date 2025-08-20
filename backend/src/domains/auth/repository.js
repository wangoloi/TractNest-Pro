import { query } from '../../infrastructure/database/mysql.js';

export async function findUserByUsername(username) {
  const rows = await query(`
    SELECT u.id, u.username, u.email, u.password_hash AS passwordHash, u.role, u.organization_id
    FROM users u 
    WHERE u.username = ?
  `, [username]);
  return rows[0] || null;
}

export async function createUser({ username, email, passwordHash, role = 'user', organizationId }) {
  const result = await query(
    'INSERT INTO users (username, email, password_hash, role, organization_id) VALUES (?, ?, ?, ?, ?)', 
    [username, email, passwordHash, role, organizationId]
  );
  return { id: result.insertId, username, email, role, organizationId };
}

export async function findUserById(id) {
  const rows = await query(`
    SELECT u.id, u.username, u.email, u.role, u.organization_id, o.name as organization_name
    FROM users u 
    JOIN organizations o ON u.organization_id = o.id
    WHERE u.id = ?
  `, [id]);
  return rows[0] || null;
}

export async function updateLastLogin(userId) {
  await query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [userId]);
}



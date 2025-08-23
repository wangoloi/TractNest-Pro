import { pool } from '../../infrastructure/database/mysql.js';

export async function findUserByUsername(username) {
  const [rows] = await pool.execute(
    'SELECT * FROM users WHERE username = ?',
    [username]
  );
  return rows[0];
}

export async function findUserById(id) {
  const [rows] = await pool.execute(
    'SELECT * FROM users WHERE id = ?',
    [id]
  );
  return rows[0];
}

export async function createUser({ username, email, passwordHash, organizationId, role = 'user', first_name, last_name }) {
  const [result] = await pool.execute(
    'INSERT INTO users (username, email, password_hash, role, organization_id, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [username, email, passwordHash, role, organizationId, first_name, last_name]
  );
  
  return {
    id: result.insertId,
    username,
    email,
    role,
    organization_id: organizationId,
    first_name,
    last_name
  };
}

export async function updateLastLogin(userId) {
  await pool.execute(
    'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
    [userId]
  );
}

export async function findUserByEmail(email) {
  const [rows] = await pool.execute(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  return rows[0];
}

export async function updatePassword(userId, passwordHash) {
  await pool.execute(
    'UPDATE users SET password_hash = ? WHERE id = ?',
    [passwordHash, userId]
  );
}



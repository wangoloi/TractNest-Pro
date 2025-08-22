import mysql from 'mysql2/promise';

let poolInstance;

export function getPool() {
  if (!poolInstance) {
    try {
      poolInstance = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root', // Try common password
        database: process.env.DB_NAME || 'tracknest',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
    } catch (error) {
      console.error('❌ Failed to create database pool:', error);
      throw error;
    }
  }
  return poolInstance;
}

// Get pool without database name (for creating database)
export function getPoolWithoutDB() {
  return mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root', // Try common password
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}

// Export pool directly for backward compatibility
export const pool = getPool();

export async function query(sql, params = []) {
  try {
    const [rows] = await getPool().execute(sql, params);
    return rows;
  } catch (error) {
    console.error('❌ Database query failed:', error);
    throw error;
  }
}

// Test database connection
export async function testConnection() {
  try {
    const connection = await getPool().getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}




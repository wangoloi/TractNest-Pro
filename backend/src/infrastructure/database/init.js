import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './mysql.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.execute(statement);
      }
    }
    
    console.log('✅ Database initialized successfully');
    
    // Verify initialization
    await verifyInitialization();
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

async function verifyInitialization() {
  try {
    // Check if default organization exists
    const [orgs] = await pool.execute('SELECT COUNT(*) as count FROM organizations');
    console.log(`📊 Organizations: ${orgs[0].count}`);
    
    // Check if default user exists
    const [users] = await pool.execute('SELECT COUNT(*) as count FROM users');
    console.log(`👥 Users: ${users[0].count}`);
    
    // Check if sample data exists
    const [inventory] = await pool.execute('SELECT COUNT(*) as count FROM inventory_items');
    console.log(`📦 Inventory Items: ${inventory[0].count}`);
    
    const [invoices] = await pool.execute('SELECT COUNT(*) as count FROM invoices');
    console.log(`🧾 Invoices: ${invoices[0].count}`);
    
    const [receipts] = await pool.execute('SELECT COUNT(*) as count FROM receipts');
    console.log(`📋 Receipts: ${receipts[0].count}`);
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

export async function resetDatabase() {
  try {
    console.log('🔄 Resetting database...');
    
    // Drop all tables in reverse order
    const tables = [
      'audit_logs',
      'organization_settings',
      'sales_transactions',
      'invoice_items',
      'invoices',
      'receipt_items',
      'receipts',
      'inventory_items',
      'users',
      'organizations'
    ];
    
    for (const table of tables) {
      await pool.execute(`DROP TABLE IF EXISTS ${table}`);
    }
    
    console.log('✅ Database reset successfully');
    
    // Reinitialize
    await initializeDatabase();
    
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    throw error;
  }
}

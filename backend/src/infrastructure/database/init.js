import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, testConnection, getPoolWithoutDB } from './mysql.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initializeDatabase() {
  try {
    console.log('🔄 Checking database initialization...');
    
    // First, try to create the database if it doesn't exist
    await createDatabaseIfNotExists();
    
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.log('⚠️  Database connection failed. Starting server without database initialization.');
      console.log('📝 Please ensure MySQL is running and configured properly.');
      return;
    }
    
    // Create tables one by one with proper error handling
    await createTables();
    
    console.log('✅ Database initialized successfully');
    
    // Verify initialization
    await verifyInitialization();
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    console.log('⚠️  Starting server without database initialization.');
    console.log('📝 Please check your MySQL configuration and ensure the database is accessible.');
  }
}

async function createTables() {
  const tables = [
    // Organizations table
    `CREATE TABLE IF NOT EXISTS organizations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(100) NOT NULL UNIQUE,
      domain VARCHAR(255) NULL,
      settings JSON,
      status ENUM('active', 'suspended', 'pending') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_org_slug (slug),
      INDEX idx_org_status (status)
    )`,
    
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      organization_id INT NOT NULL,
      username VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      role ENUM('owner', 'admin', 'manager', 'user') DEFAULT 'user',
      status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
      last_login TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      UNIQUE KEY unique_org_username (organization_id, username),
      UNIQUE KEY unique_org_email (organization_id, email),
      INDEX idx_user_org (organization_id),
      INDEX idx_user_status (status),
      INDEX idx_user_role (role)
    )`,
    
    // Inventory items table
    `CREATE TABLE IF NOT EXISTS inventory_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      organization_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      sku VARCHAR(100) NULL,
      description TEXT NULL,
      category VARCHAR(100) NULL,
      quantity DECIMAL(18,2) NOT NULL DEFAULT 0,
      unit VARCHAR(50) NOT NULL,
      cost_price DECIMAL(18,2) NOT NULL DEFAULT 0,
      selling_price DECIMAL(18,2) NOT NULL DEFAULT 0,
      reorder_level DECIMAL(18,2) DEFAULT 0,
      supplier VARCHAR(255) NULL,
      location VARCHAR(255) NULL,
      status ENUM('active', 'inactive', 'discontinued') DEFAULT 'active',
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id),
      INDEX idx_inv_org (organization_id),
      INDEX idx_inv_sku (sku),
      INDEX idx_inv_category (category),
      INDEX idx_inv_status (status),
      INDEX idx_inv_quantity (quantity)
    )`,
    
    // Receipts table
    `CREATE TABLE IF NOT EXISTS receipts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      organization_id INT NOT NULL,
      receipt_no VARCHAR(50) NOT NULL,
      date DATE NOT NULL,
      supplier_name VARCHAR(255) NOT NULL,
      supplier_contact VARCHAR(255) NULL,
      supplier_email VARCHAR(255) NULL,
      supplier_phone VARCHAR(50) NULL,
      total_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
      tax_amount DECIMAL(18,2) DEFAULT 0,
      discount_amount DECIMAL(18,2) DEFAULT 0,
      notes TEXT NULL,
      status ENUM('draft', 'received', 'cancelled') DEFAULT 'draft',
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id),
      UNIQUE KEY unique_org_receipt (organization_id, receipt_no),
      INDEX idx_receipt_org (organization_id),
      INDEX idx_receipt_date (date),
      INDEX idx_receipt_status (status),
      INDEX idx_receipt_supplier (supplier_name)
    )`,
    
    // Receipt items table
    `CREATE TABLE IF NOT EXISTS receipt_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      receipt_id INT NOT NULL,
      item_name VARCHAR(255) NOT NULL,
      quantity DECIMAL(18,2) NOT NULL,
      unit_price DECIMAL(18,2) NOT NULL,
      total_price DECIMAL(18,2) NOT NULL,
      notes TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (receipt_id) REFERENCES receipts(id) ON DELETE CASCADE,
      INDEX idx_receipt_item_receipt (receipt_id)
    )`,
    
    // Invoices table
    `CREATE TABLE IF NOT EXISTS invoices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      organization_id INT NOT NULL,
      invoice_no VARCHAR(50) NOT NULL,
      date DATE NOT NULL,
      customer_name VARCHAR(255) NOT NULL,
      customer_email VARCHAR(255) NULL,
      customer_phone VARCHAR(50) NULL,
      customer_address TEXT NULL,
      total_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
      total_profit DECIMAL(18,2) NOT NULL DEFAULT 0,
      tax_amount DECIMAL(18,2) DEFAULT 0,
      discount_amount DECIMAL(18,2) DEFAULT 0,
      payment_status ENUM('pending', 'paid', 'partial', 'cancelled') DEFAULT 'pending',
      payment_method VARCHAR(100) NULL,
      notes TEXT NULL,
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id),
      UNIQUE KEY unique_org_invoice (organization_id, invoice_no),
      INDEX idx_invoice_org (organization_id),
      INDEX idx_invoice_date (date),
      INDEX idx_invoice_customer (customer_name),
      INDEX idx_invoice_status (payment_status)
    )`,
    
    // Invoice items table
    `CREATE TABLE IF NOT EXISTS invoice_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      invoice_id INT NOT NULL,
      item_name VARCHAR(255) NOT NULL,
      quantity DECIMAL(18,2) NOT NULL,
      unit_price DECIMAL(18,2) NOT NULL,
      total_price DECIMAL(18,2) NOT NULL,
      profit DECIMAL(18,2) NOT NULL DEFAULT 0,
      notes TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
      INDEX idx_invoice_item_invoice (invoice_id)
    )`,
    
    // Sales transactions table
    `CREATE TABLE IF NOT EXISTS sales_transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      organization_id INT NOT NULL,
      invoice_id INT NULL,
      item_id INT NULL,
      item_name VARCHAR(255) NOT NULL,
      quantity DECIMAL(18,2) NOT NULL,
      unit_price DECIMAL(18,2) NOT NULL,
      total_price DECIMAL(18,2) NOT NULL,
      profit DECIMAL(18,2) NOT NULL DEFAULT 0,
      transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL,
      FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES users(id),
      INDEX idx_sales_org (organization_id),
      INDEX idx_sales_date (transaction_date),
      INDEX idx_sales_invoice (invoice_id),
      INDEX idx_sales_item (item_id)
    )`,
    
    // Customers table
    `CREATE TABLE IF NOT EXISTS customers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      organization_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NULL,
      phone VARCHAR(50) NULL,
      whatsapp VARCHAR(50) NULL,
      address TEXT NULL,
      customer_type ENUM('individual', 'business') DEFAULT 'individual',
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id),
      INDEX idx_customer_org (organization_id),
      INDEX idx_customer_name (name),
      INDEX idx_customer_email (email),
      INDEX idx_customer_status (status)
    )`,
    
    // Customer messages table
    `CREATE TABLE IF NOT EXISTS customer_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      organization_id INT NOT NULL,
      customer_id INT NULL,
      user_id INT NOT NULL,
      subject VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      message_type ENUM('support', 'notification', 'update', 'reminder', 'promotion') DEFAULT 'support',
      status ENUM('new', 'in_progress', 'resolved', 'closed') DEFAULT 'new',
      priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
      admin_response TEXT NULL,
      resolved_by INT NULL,
      resolved_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (resolved_by) REFERENCES users(id),
      INDEX idx_message_org (organization_id),
      INDEX idx_message_customer (customer_id),
      INDEX idx_message_status (status),
      INDEX idx_message_priority (priority),
      INDEX idx_message_type (message_type)
    )`
  ];
  
  for (const tableSQL of tables) {
    try {
      await pool.execute(tableSQL);
      // console.log('✅ Table created successfully');
    } catch (error) {
      if (error.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('⚠️  Table already exists, skipping...');
      } else {
        console.error('❌ Failed to create table:', error.message);
        throw error;
      }
    }
  }
  
  // Insert default data
  await insertDefaultData();
}

async function insertDefaultData() {
  try {
    // Insert default organization
    await pool.execute(`
      INSERT IGNORE INTO organizations (id, name, slug, status) VALUES 
      (1, 'Demo Organization', 'demo', 'active')
    `);
    console.log('✅ Default organization created');
    
    // Insert default admin users
    await pool.execute(`
      INSERT IGNORE INTO users (id, organization_id, username, email, password_hash, first_name, last_name, role, status) VALUES 
      (1, 1, 'admin', 'admin@tracknest.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'owner', 'active'),
      (2, 1, 'bachawa', 'bachawa@tracknest.com', '$2a$10$CDMl5vkIdt3BhK/5D2lmZ.mmFO1C5LyZ6tBPI2WAJkP.4Mp4po/jm', 'Bachawa', 'Admin', 'owner', 'active')
    `);
    console.log('✅ Default admin users created');
    
    // Insert sample inventory items
    await pool.execute(`
      INSERT IGNORE INTO inventory_items (organization_id, name, sku, description, category, quantity, unit, cost_price, selling_price, reorder_level, created_by) VALUES 
      (1, 'Laptop', 'LAP001', 'High-performance laptop', 'Electronics', 10, 'pcs', 800.00, 1200.00, 5, 1),
      (1, 'Mouse', 'MOU001', 'Wireless mouse', 'Electronics', 50, 'pcs', 15.00, 25.00, 10, 1),
      (1, 'Keyboard', 'KEY001', 'Mechanical keyboard', 'Electronics', 30, 'pcs', 40.00, 60.00, 8, 1),
      (1, 'Monitor', 'MON001', '24-inch monitor', 'Electronics', 15, 'pcs', 150.00, 220.00, 5, 1),
      (1, 'Headphones', 'HEA001', 'Noise-cancelling headphones', 'Electronics', 25, 'pcs', 80.00, 120.00, 8, 1)
    `);
    console.log('✅ Sample inventory items created');
    
    // Insert sample customers
    await pool.execute(`
      INSERT IGNORE INTO customers (organization_id, name, email, phone, whatsapp, address, customer_type, status, created_by) VALUES 
      (1, 'John Smith', 'john.smith@email.com', '+1234567890', '+1234567890', '123 Main St, New York, NY 10001', 'individual', 'active', 1),
      (1, 'Sarah Johnson', 'sarah.johnson@email.com', '+1987654321', '+1987654321', '456 Oak Ave, Los Angeles, CA 90210', 'individual', 'active', 1),
      (1, 'Tech Solutions Inc', 'contact@techsolutions.com', '+1555123456', '+1555123456', '789 Business Blvd, San Francisco, CA 94105', 'business', 'active', 1),
      (1, 'Maria Garcia', 'maria.garcia@email.com', '+1444333222', '+1444333222', '321 Pine St, Miami, FL 33101', 'individual', 'active', 1),
      (1, 'Global Enterprises', 'info@globalenterprises.com', '+1777888999', '+1777888999', '654 Corporate Dr, Chicago, IL 60601', 'business', 'active', 1)
    `);
    console.log('✅ Sample customers created');
    
  } catch (error) {
    console.error('❌ Failed to insert default data:', error.message);
  }
}

async function createDatabaseIfNotExists() {
  try {
    const poolWithoutDB = getPoolWithoutDB();
    const dbName = process.env.DB_NAME || 'tracknest';
    
    // Create database if it doesn't exist
    await poolWithoutDB.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✅ Database '${dbName}' created/verified successfully`);
    
    await poolWithoutDB.end();
  } catch (error) {
    console.error('❌ Failed to create database:', error);
    throw error;
  }
}

async function verifyInitialization() {
  try {
    // Check if default organization exists
    const [orgs] = await pool().execute('SELECT COUNT(*) as count FROM organizations');
    console.log(`📊 Organizations: ${orgs[0].count}`);
    
    // Check if default user exists
    const [users] = await pool().execute('SELECT COUNT(*) as count FROM users');
    console.log(`👥 Users: ${users[0].count}`);
    
    // Check if sample data exists
    const [inventory] = await pool().execute('SELECT COUNT(*) as count FROM inventory_items');
    console.log(`📦 Inventory Items: ${inventory[0].count}`);
    
    const [invoices] = await pool().execute('SELECT COUNT(*) as count FROM invoices');
    console.log(`🧾 Invoices: ${invoices[0].count}`);
    
    const [receipts] = await pool().execute('SELECT COUNT(*) as count FROM receipts');
    console.log(`📋 Receipts: ${receipts[0].count}`);
    
    const [customers] = await pool.execute('SELECT COUNT(*) as count FROM customers');
    console.log(`👥 Customers: ${customers[0].count}`);
    
    console.log('✅ Database verification completed successfully');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    console.log('⚠️  Some tables may not have been created properly. The application will continue to run.');
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
      await pool().execute(`DROP TABLE IF EXISTS ${table}`);
    }
    
    console.log('✅ Database reset successfully');
    
    // Reinitialize
    await initializeDatabase();
    
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    throw error;
  }
}

import bcrypt from 'bcrypt';

export async function createSchema(pool) {
  console.log('📋 Creating database schema...');

  // Create organizations table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS organizations (
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
    )
  `);

  // Create users table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      organization_id INT NOT NULL,
      username VARCHAR(50) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('admin', 'manager', 'user') DEFAULT 'user',
      status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
      last_login TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      INDEX idx_user_org (organization_id),
      INDEX idx_user_username (username),
      INDEX idx_user_email (email)
    )
  `);

  // Create inventory_items table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS inventory_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      organization_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      sku VARCHAR(100),
      description TEXT,
      category VARCHAR(100),
      quantity INT NOT NULL DEFAULT 0,
      unit VARCHAR(50) NOT NULL,
      cost_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      selling_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      reorder_level INT DEFAULT 10,
      supplier VARCHAR(255),
      location VARCHAR(255),
      status ENUM('active', 'inactive', 'discontinued') DEFAULT 'active',
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_inv_org (organization_id),
      INDEX idx_inv_sku (sku),
      INDEX idx_inv_category (category),
      INDEX idx_inv_status (status)
    )
  `);

  // Create receipts table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS receipts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      organization_id INT NOT NULL,
      receipt_no VARCHAR(50) NOT NULL,
      supplier_name VARCHAR(255) NOT NULL,
      supplier_contact VARCHAR(255),
      supplier_email VARCHAR(255),
      supplier_phone VARCHAR(50),
      subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      notes TEXT,
      status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_rec_org (organization_id),
      INDEX idx_rec_no (receipt_no),
      INDEX idx_rec_status (status)
    )
  `);

  // Create receipt_items table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS receipt_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      receipt_id INT NOT NULL,
      inventory_item_id INT,
      item_name VARCHAR(255) NOT NULL,
      sku VARCHAR(100),
      quantity INT NOT NULL,
      unit_price DECIMAL(10,2) NOT NULL,
      cost_price DECIMAL(10,2) NOT NULL,
      total_price DECIMAL(10,2) NOT NULL,
      notes TEXT,
      FOREIGN KEY (receipt_id) REFERENCES receipts(id) ON DELETE CASCADE,
      FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE SET NULL,
      INDEX idx_rec_item_receipt (receipt_id),
      INDEX idx_rec_item_inventory (inventory_item_id)
    )
  `);

  // Create invoices table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS invoices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      organization_id INT NOT NULL,
      invoice_no VARCHAR(50) NOT NULL,
      customer_name VARCHAR(255) NOT NULL,
      customer_email VARCHAR(255),
      customer_phone VARCHAR(50),
      customer_address TEXT,
      subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      total_profit DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      payment_status ENUM('pending', 'paid', 'partial', 'cancelled') DEFAULT 'pending',
      payment_method VARCHAR(100),
      notes TEXT,
      status ENUM('draft', 'sent', 'paid', 'cancelled') DEFAULT 'draft',
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_inv_org (organization_id),
      INDEX idx_inv_no (invoice_no),
      INDEX idx_inv_payment_status (payment_status),
      INDEX idx_inv_status (status)
    )
  `);

  // Create invoice_items table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS invoice_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      invoice_id INT NOT NULL,
      inventory_item_id INT,
      item_name VARCHAR(255) NOT NULL,
      sku VARCHAR(100),
      quantity INT NOT NULL,
      unit_price DECIMAL(10,2) NOT NULL,
      cost_price DECIMAL(10,2) NOT NULL,
      total_price DECIMAL(10,2) NOT NULL,
      profit DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      notes TEXT,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
      FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE SET NULL,
      INDEX idx_inv_item_invoice (invoice_id),
      INDEX idx_inv_item_inventory (inventory_item_id)
    )
  `);

  // Create sales_transactions table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS sales_transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      organization_id INT NOT NULL,
      invoice_id INT,
      inventory_item_id INT,
      quantity INT NOT NULL,
      unit_price DECIMAL(10,2) NOT NULL,
      total_amount DECIMAL(10,2) NOT NULL,
      profit DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_by INT,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL,
      FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_sales_org (organization_id),
      INDEX idx_sales_invoice (invoice_id),
      INDEX idx_sales_item (inventory_item_id),
      INDEX idx_sales_date (transaction_date)
    )
  `);

  // Create audit_logs table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      organization_id INT NOT NULL,
      user_id INT,
      action VARCHAR(100) NOT NULL,
      table_name VARCHAR(100),
      record_id INT,
      old_values JSON,
      new_values JSON,
      ip_address VARCHAR(45),
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_audit_org (organization_id),
      INDEX idx_audit_user (user_id),
      INDEX idx_audit_action (action),
      INDEX idx_audit_table (table_name),
      INDEX idx_audit_date (created_at)
    )
  `);

  // Create organization_settings table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS organization_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      organization_id INT NOT NULL,
      setting_key VARCHAR(100) NOT NULL,
      setting_value TEXT,
      setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      UNIQUE KEY unique_org_setting (organization_id, setting_key),
      INDEX idx_settings_org (organization_id)
    )
  `);

  console.log('✅ Database schema created successfully');
}

export async function insertSampleData(pool) {
  console.log('📊 Inserting sample data...');

  // Insert default organization
  const [orgResult] = await pool.execute(`
    INSERT INTO organizations (name, slug, domain, status) 
    VALUES ('TrackNest Demo', 'tracknest-demo', 'demo.tracknest.com', 'active')
    ON DUPLICATE KEY UPDATE id = id
  `);
  
  const organizationId = orgResult.insertId || 1;

  // Insert default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await pool.execute(`
    INSERT INTO users (organization_id, username, email, first_name, last_name, password_hash, role, status)
    VALUES (?, 'admin', 'admin@tracknest.com', 'Admin', 'User', ?, 'admin', 'active')
    ON DUPLICATE KEY UPDATE id = id
  `, [organizationId, hashedPassword]);

  // Insert sample inventory items
  const inventoryItems = [
    ['Laptop Dell XPS 13', 'LAP-DELL-XPS13', 'High-performance laptop for professionals', 'Electronics', 25, 'units', 899.99, 1299.99, 5, 'Dell Inc.', 'Warehouse A'],
    ['Wireless Mouse Logitech', 'MOUSE-LOG-WIRE', 'Ergonomic wireless mouse', 'Accessories', 50, 'units', 15.99, 29.99, 10, 'Logitech', 'Warehouse B'],
    ['Office Chair Ergonomic', 'CHAIR-ERG-001', 'Comfortable office chair with lumbar support', 'Furniture', 15, 'units', 199.99, 349.99, 3, 'OfficeMax', 'Warehouse C'],
    ['USB-C Cable Pack', 'CABLE-USB-C-5', '5-pack USB-C charging cables', 'Accessories', 100, 'units', 8.99, 19.99, 20, 'TechCorp', 'Warehouse A'],
    ['Monitor 27" 4K', 'MON-27-4K', '27-inch 4K Ultra HD monitor', 'Electronics', 10, 'units', 299.99, 499.99, 2, 'Samsung', 'Warehouse B']
  ];

  for (const item of inventoryItems) {
    await pool.execute(`
      INSERT INTO inventory_items (
        organization_id, name, sku, description, category, quantity, unit, 
        cost_price, selling_price, reorder_level, supplier, location, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      ON DUPLICATE KEY UPDATE id = id
    `, [organizationId, ...item]);
  }

  // Insert sample receipts
  const receipts = [
    ['REC-2024-001', 'Dell Inc.', 'John Smith', 'john@dell.com', '+1-555-0101', 899.99, 89.99, 0, 989.98, 'Initial laptop stock'],
    ['REC-2024-002', 'Logitech', 'Sarah Johnson', 'sarah@logitech.com', '+1-555-0102', 799.50, 79.95, 20, 859.45, 'Mouse inventory restock'],
    ['REC-2024-003', 'OfficeMax', 'Mike Wilson', 'mike@officemax.com', '+1-555-0103', 2999.85, 299.98, 0, 3299.83, 'Office furniture order']
  ];

  for (const receipt of receipts) {
    await pool.execute(`
      INSERT INTO receipts (
        organization_id, receipt_no, supplier_name, supplier_contact, supplier_email, supplier_phone,
        subtotal, tax_amount, discount_amount, total_amount, notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      ON DUPLICATE KEY UPDATE id = id
    `, [organizationId, ...receipt]);
  }

  // Insert sample invoices
  const invoices = [
    ['INV-2024-001', 'Acme Corp', 'contact@acme.com', '+1-555-0201', '123 Business St, City', 1299.99, 129.99, 0, 1429.98, 399.99, 'paid', 'credit_card', 'Laptop sale'],
    ['INV-2024-002', 'TechStart Inc', 'billing@techstart.com', '+1-555-0202', '456 Innovation Ave, Tech City', 59.98, 5.99, 5, 60.97, 14.99, 'pending', 'bank_transfer', 'Mouse order'],
    ['INV-2024-003', 'Office Solutions', 'orders@officesolutions.com', '+1-555-0203', '789 Corporate Blvd, Business District', 349.99, 34.99, 0, 384.98, 149.99, 'paid', 'cash', 'Office chair']
  ];

  for (const invoice of invoices) {
    await pool.execute(`
      INSERT INTO invoices (
        organization_id, invoice_no, customer_name, customer_email, customer_phone, customer_address,
        subtotal, tax_amount, discount_amount, total_amount, total_profit, payment_status, payment_method, notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      ON DUPLICATE KEY UPDATE id = id
    `, [organizationId, ...invoice]);
  }

  // Insert sample organization settings
  const settings = [
    ['company_name', 'TrackNest Demo', 'string'],
    ['currency', 'USD', 'string'],
    ['tax_rate', '10', 'number'],
    ['low_stock_threshold', '10', 'number'],
    ['auto_backup', 'true', 'boolean']
  ];

  for (const setting of settings) {
    await pool.execute(`
      INSERT INTO organization_settings (organization_id, setting_key, setting_value, setting_type)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
    `, [organizationId, ...setting]);
  }

  console.log('✅ Sample data inserted successfully');
}

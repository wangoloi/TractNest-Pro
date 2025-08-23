-- TrackNest Enterprise Multi-Tenant Database Schema
-- This schema supports multiple organizations with proper isolation
-- DROP DATABASE IF EXISTS tracknest;
CREATE DATABASE IF NOT EXISTS tracknest;
USE tracknest;
-- Organizations (Multi-tenant support)
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
);

-- Users with multi-tenant support
CREATE TABLE IF NOT EXISTS users (
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
);

-- Inventory Items with multi-tenant support
CREATE TABLE IF NOT EXISTS inventory_items (
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
);

-- Receipts (Stocking) with multi-tenant support
CREATE TABLE IF NOT EXISTS receipts (
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
);

-- Receipt Items
CREATE TABLE IF NOT EXISTS receipt_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  receipt_id INT NOT NULL,
  inventory_item_id INT NULL,
  item_name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NULL,
  quantity DECIMAL(18,2) NOT NULL,
  unit_price DECIMAL(18,2) NOT NULL,
  total_price DECIMAL(18,2) NOT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (receipt_id) REFERENCES receipts(id) ON DELETE CASCADE,
  FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE SET NULL,
  INDEX idx_receipt_item_receipt (receipt_id),
  INDEX idx_receipt_item_inventory (inventory_item_id)
);

-- Sales Invoices with multi-tenant support
CREATE TABLE IF NOT EXISTS invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  invoice_no VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NULL,
  customer_phone VARCHAR(50) NULL,
  customer_address TEXT NULL,
  subtotal DECIMAL(18,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(18,2) DEFAULT 0,
  discount_amount DECIMAL(18,2) DEFAULT 0,
  total_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
  total_profit DECIMAL(18,2) NOT NULL DEFAULT 0,
  payment_status ENUM('pending', 'partial', 'paid', 'overdue') DEFAULT 'pending',
  payment_method VARCHAR(100) NULL,
  notes TEXT NULL,
  status ENUM('draft', 'sent', 'paid', 'cancelled') DEFAULT 'draft',
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id),
  UNIQUE KEY unique_org_invoice (organization_id, invoice_no),
  INDEX idx_invoice_org (organization_id),
  INDEX idx_invoice_date (date),
  INDEX idx_invoice_customer (customer_name),
  INDEX idx_invoice_status (status),
  INDEX idx_invoice_payment (payment_status)
);

-- Invoice Items
CREATE TABLE IF NOT EXISTS invoice_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT NOT NULL,
  inventory_item_id INT NULL,
  item_name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NULL,
  quantity DECIMAL(18,2) NOT NULL,
  unit_price DECIMAL(18,2) NOT NULL,
  cost_price DECIMAL(18,2) NOT NULL,
  total_price DECIMAL(18,2) NOT NULL,
  profit DECIMAL(18,2) NOT NULL DEFAULT 0,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE SET NULL,
  INDEX idx_invoice_item_invoice (invoice_id),
  INDEX idx_invoice_item_inventory (inventory_item_id)
);

-- Sales Transactions (for tracking individual sales)
CREATE TABLE IF NOT EXISTS sales_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  invoice_id INT NULL,
  inventory_item_id INT NOT NULL,
  quantity DECIMAL(18,2) NOT NULL,
  unit_price DECIMAL(18,2) NOT NULL,
  total_price DECIMAL(18,2) NOT NULL,
  profit DECIMAL(18,2) NOT NULL DEFAULT 0,
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT NOT NULL,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL,
  FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_sales_org (organization_id),
  INDEX idx_sales_invoice (invoice_id),
  INDEX idx_sales_item (inventory_item_id),
  INDEX idx_sales_date (transaction_date)
);

-- Audit Log for tracking changes
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  user_id INT NULL,
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  record_id INT NOT NULL,
  old_values JSON NULL,
  new_values JSON NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_audit_org (organization_id),
  INDEX idx_audit_user (user_id),
  INDEX idx_audit_action (action),
  INDEX idx_audit_table (table_name),
  INDEX idx_audit_date (created_at)
);

-- Settings table for organization configurations
CREATE TABLE IF NOT EXISTS organization_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  setting_key VARCHAR(100) NOT NULL,
  setting_value JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  UNIQUE KEY unique_org_setting (organization_id, setting_key),
  INDEX idx_settings_org (organization_id)
);

-- Insert default organization
INSERT INTO organizations (name, slug, domain, status) VALUES 
('TrackNest Demo', 'demo', 'demo.tracknest.com', 'active');

-- Insert default admin user (password: admin123)
INSERT INTO users (organization_id, username, email, password_hash, first_name, last_name, role, status) VALUES 
(1, 'admin', 'admin@tracknest.com', '$2b$10$ryttjtSMXU1834dpWZCE6OWgZXmgbyRZFRnfZtrY34t/uOyLTnpei', 'Admin', 'User', 'owner', 'active');

-- Insert sample inventory items
INSERT INTO inventory_items (organization_id, name, sku, description, category, quantity, unit, cost_price, selling_price, reorder_level, supplier, location, created_by) VALUES
(1, 'Laptop Dell XPS 13', 'LAP-DELL-XPS13', 'High-performance laptop for business use', 'Electronics', 25, 'units', 800.00, 1200.00, 5, 'Dell Inc.', 'Warehouse A', 1),
(1, 'Wireless Mouse Logitech', 'ACC-LOG-MOUSE', 'Ergonomic wireless mouse', 'Accessories', 150, 'units', 15.00, 25.00, 20, 'Logitech', 'Warehouse B', 1),
(1, 'USB-C Cable', 'CAB-USB-C', 'High-speed USB-C charging cable', 'Cables', 300, 'units', 5.00, 12.00, 50, 'CableCo', 'Warehouse A', 1),
(1, 'Office Chair Ergonomic', 'FUR-CHAIR-ERG', 'Comfortable office chair with lumbar support', 'Furniture', 15, 'units', 200.00, 350.00, 3, 'OfficeFurniture Co.', 'Warehouse C', 1),
(1, 'Printer HP LaserJet', 'PRN-HP-LASER', 'Black and white laser printer', 'Printers', 8, 'units', 300.00, 450.00, 2, 'HP Inc.', 'Warehouse A', 1);

-- Insert sample receipts
INSERT INTO receipts (organization_id, receipt_no, date, supplier_name, supplier_contact, total_amount, status, created_by) VALUES
(1, 'REC-2024-001', '2024-01-15', 'Dell Inc.', 'John Smith', 20000.00, 'received', 1),
(1, 'REC-2024-002', '2024-01-20', 'Logitech', 'Sarah Johnson', 2250.00, 'received', 1);

-- Insert sample receipt items
INSERT INTO receipt_items (receipt_id, inventory_item_id, item_name, quantity, unit_price, total_price) VALUES
(1, 1, 'Laptop Dell XPS 13', 25, 800.00, 20000.00),
(2, 2, 'Wireless Mouse Logitech', 150, 15.00, 2250.00);

-- Insert sample invoices
INSERT INTO invoices (organization_id, invoice_no, date, customer_name, customer_email, subtotal, tax_amount, total_amount, total_profit, payment_status, status, created_by) VALUES
(1, 'INV-2024-001', '2024-01-25', 'Tech Solutions Ltd', 'contact@techsolutions.com', 2400.00, 120.00, 2520.00, 600.00, 'paid', 'paid', 1),
(1, 'INV-2024-002', '2024-01-28', 'Office Supplies Co', 'orders@officesupplies.com', 1800.00, 90.00, 1890.00, 450.00, 'pending', 'sent', 1);

-- Insert sample invoice items
INSERT INTO invoice_items (invoice_id, inventory_item_id, item_name, quantity, unit_price, cost_price, total_price, profit) VALUES
(1, 1, 'Laptop Dell XPS 13', 2, 1200.00, 800.00, 2400.00, 800.00),
(2, 4, 'Office Chair Ergonomic', 5, 350.00, 200.00, 1750.00, 750.00),
(2, 2, 'Wireless Mouse Logitech', 2, 25.00, 15.00, 50.00, 20.00);

-- Insert sample sales transactions
INSERT INTO sales_transactions (organization_id, invoice_id, inventory_item_id, quantity, unit_price, total_price, profit, created_by) VALUES
(1, 1, 1, 2, 1200.00, 2400.00, 800.00, 1),
(1, 2, 4, 5, 350.00, 1750.00, 750.00, 1),
(1, 2, 2, 2, 25.00, 50.00, 20.00, 1);

-- Insert default organization settings
INSERT INTO organization_settings (organization_id, setting_key, setting_value) VALUES
(1, 'currency', '"UGX"'),
(1, 'tax_rate', '5.0'),
(1, 'company_name', '"TrackNest Demo"'),
(1, 'company_address', '"123 Business Street, Kampala, Uganda"'),
(1, 'company_phone', '"+256 123 456 789"'),
(1, 'company_email', '"info@tracknest.com"'),
(1, 'invoice_prefix', '"INV"'),
(1, 'receipt_prefix', '"REC"'),
(1, 'low_stock_threshold', '10'),
(1, 'auto_backup', 'true');




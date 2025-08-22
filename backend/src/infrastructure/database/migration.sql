-- Migration to add item_id column to sales_transactions table
-- This enables proper linking between sales and inventory items

-- Add item_id column to sales_transactions table
ALTER TABLE sales_transactions 
ADD COLUMN item_id INT NULL AFTER organization_id,
ADD FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE SET NULL,
ADD INDEX idx_sales_item (item_id);

-- Update existing sales transactions to link with inventory items by name
-- This is a one-time migration for existing data
UPDATE sales_transactions st 
JOIN inventory_items ii ON st.item_name = ii.name AND st.organization_id = ii.organization_id
SET st.item_id = ii.id 
WHERE st.item_id IS NULL;

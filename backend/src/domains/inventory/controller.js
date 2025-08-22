import * as service from './service.js';

export async function listInventoryController(req, res) {
  try {
    const organizationId = req.user?.organization_id || 1;
    const items = await service.listInventory(organizationId);
    res.json(items);
  } catch (error) {
    console.error('Error listing inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
}

export async function getInventoryByIdController(req, res) {
  try {
    const organizationId = req.user?.organization_id || 1;
    const item = await service.getInventoryById(req.params.id, organizationId);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error getting inventory item:', error);
    res.status(500).json({ error: 'Failed to fetch inventory item' });
  }
}

export async function createInventoryItemController(req, res) {
  try {
    const organizationId = req.user?.organization_id || 1;
    const createdBy = req.user?.id || 1;
    const item = await service.createInventoryItem(req.body, organizationId, createdBy);
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(500).json({ error: 'Failed to create inventory item' });
  }
}

export async function updateInventoryItemController(req, res) {
  try {
    const organizationId = req.user?.organization_id || 1;
    const item = await service.updateInventoryItem(req.params.id, req.body, organizationId);
    res.json(item);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
}

export async function deleteInventoryItemController(req, res) {
  try {
    const organizationId = req.user?.organization_id || 1;
    await service.deleteInventoryItem(req.params.id, organizationId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
}

export async function getLowStockItemsController(req, res) {
  try {
    const organizationId = req.user?.organization_id || 1;
    const threshold = parseInt(req.query.threshold) || 10;
    const items = await service.getLowStockItems(organizationId, threshold);
    res.json(items);
  } catch (error) {
    console.error('Error getting low stock items:', error);
    res.status(500).json({ error: 'Failed to fetch low stock items' });
  }
}

export async function updateStockQuantityController(req, res) {
  try {
    const organizationId = req.user?.organization_id || 1;
    const { quantity } = req.body;
    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }
    
    const item = await service.updateStockQuantity(req.params.id, quantity, organizationId);
    res.json(item);
  } catch (error) {
    console.error('Error updating stock quantity:', error);
    res.status(500).json({ error: 'Failed to update stock quantity' });
  }
}




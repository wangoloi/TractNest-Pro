import * as service from './service.js';

export async function listInventoryController(req, res) {
  const items = await service.listInventory(req.user.organizationId);
  res.json(items);
}

export async function getInventoryByIdController(req, res) {
  const item = await service.getInventoryById(req.params.id, req.user.organizationId);
  if (!item) {
    return res.status(404).json({ message: 'Inventory item not found' });
  }
  res.json(item);
}

export async function createInventoryItemController(req, res) {
  const item = await service.createInventoryItem(req.body, req.user.organizationId, req.user.id);
  res.status(201).json(item);
}

export async function updateInventoryItemController(req, res) {
  const item = await service.updateInventoryItem(req.params.id, req.body, req.user.organizationId);
  res.json(item);
}

export async function deleteInventoryItemController(req, res) {
  await service.deleteInventoryItem(req.params.id, req.user.organizationId);
  res.status(204).send();
}

export async function getLowStockItemsController(req, res) {
  const threshold = parseInt(req.query.threshold) || 10;
  const items = await service.getLowStockItems(req.user.organizationId, threshold);
  res.json(items);
}

export async function updateStockQuantityController(req, res) {
  const { quantity } = req.body;
  if (typeof quantity !== 'number' || quantity < 0) {
    return res.status(400).json({ message: 'Valid quantity is required' });
  }
  
  const item = await service.updateStockQuantity(req.params.id, quantity, req.user.organizationId);
  res.json(item);
}




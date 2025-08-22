import { listRecords, createRecord, removeRecord, getAvailableInventory } from './service.js';

export async function list(req, res) {
  try {
    const organizationId = req.user?.organization_id || 1;
    const sales = await listRecords(organizationId);
    res.json(sales);
  } catch (error) {
    console.error('Error listing sales:', error);
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
}

export async function create(req, res) {
  try {
    const organizationId = req.user?.organization_id || 1;
    const createdBy = req.user?.id || 1;
    const created = await createRecord(req.body, organizationId, createdBy);
    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating sale:', error);
    if (error.status === 400) {
      res.status(400).json({ error: error.message });
    } else if (error.status === 404) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to create sale' });
    }
  }
}

export async function remove(req, res) {
  try {
    const organizationId = req.user?.organization_id || 1;
    await removeRecord(Number(req.params.id), organizationId);
    res.status(204).send();
  } catch (error) {
    console.error('Error removing sale:', error);
    res.status(500).json({ error: 'Failed to remove sale' });
  }
}

// New endpoint to get available inventory for sales
export async function getInventory(req, res) {
  try {
    const organizationId = req.user?.organization_id || 1;
    const inventory = await getAvailableInventory(organizationId);
    res.json(inventory);
  } catch (error) {
    console.error('Error fetching inventory for sales:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
}




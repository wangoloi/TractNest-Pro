import { listAllReceipts, createNewReceipt } from './receipts.service.js';

export async function list(req, res) {
  try {
    const organizationId = req.user?.organization_id || 1;
    const receipts = await listAllReceipts(organizationId);
    res.json(receipts);
  } catch (error) {
    console.error('Error listing receipts:', error);
    res.status(500).json({ error: 'Failed to fetch receipts' });
  }
}

export async function create(req, res) {
  try {
    const organizationId = req.user?.organization_id || 1;
    const createdBy = req.user?.id || 1;
    const created = await createNewReceipt(req.body, organizationId, createdBy);
    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating receipt:', error);
    res.status(500).json({ error: 'Failed to create receipt' });
  }
}



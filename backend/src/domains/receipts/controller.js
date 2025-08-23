import * as service from './service.js';

export async function listReceiptsController(req, res) {
  const receipts = await service.listReceipts(req.user.organizationId);
  res.json(receipts);
}

export async function getReceiptByIdController(req, res) {
  const receipt = await service.getReceiptById(parseInt(req.params.id), req.user.organizationId);
  if (!receipt) {
    return res.status(404).json({ message: 'Receipt not found' });
  }
  res.json(receipt);
}

export async function createReceiptController(req, res) {
  const receipt = await service.createReceipt(req.body, req.user.organizationId, req.user.id);
  res.status(201).json(receipt);
}

export async function updateReceiptController(req, res) {
  const receipt = await service.updateReceipt(parseInt(req.params.id), req.body, req.user.organizationId);
  if (!receipt) {
    return res.status(404).json({ message: 'Receipt not found' });
  }
  res.json(receipt);
}

export async function deleteReceiptController(req, res) {
  const success = await service.deleteReceipt(parseInt(req.params.id), req.user.organizationId);
  if (!success) {
    return res.status(404).json({ message: 'Receipt not found' });
  }
  res.status(204).send();
}



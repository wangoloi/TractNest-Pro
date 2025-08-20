import { listAllReceipts, createNewReceipt } from './receipts.service.js';

export async function list(req, res) {
  const receipts = await listAllReceipts();
  res.json(receipts);
}

export async function create(req, res) {
  const created = await createNewReceipt(req.body);
  res.status(201).json(created);
}



import { listRecords, createRecord, removeRecord } from './service.js';

export async function list(req, res) {
  const sales = await listRecords();
  res.json(sales);
}

export async function create(req, res) {
  const created = await createRecord(req.body);
  res.status(201).json(created);
}

export async function remove(req, res) {
  await removeRecord(Number(req.params.id));
  res.status(204).send();
}




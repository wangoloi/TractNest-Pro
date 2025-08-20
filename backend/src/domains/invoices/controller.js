import { listAllInvoices, createNewInvoice } from './invoices.service.js';

export async function list(req, res) {
  const invoices = await listAllInvoices();
  res.json(invoices);
}

export async function create(req, res) {
  const created = await createNewInvoice(req.body);
  res.status(201).json(created);
}



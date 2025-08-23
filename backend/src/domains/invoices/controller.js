import * as service from './service.js';

export async function listInvoicesController(req, res) {
  const filters = {
    status: req.query.status,
    payment_status: req.query.payment_status,
    customer_name: req.query.customer_name
  };
  
  const invoices = await service.listInvoices(req.user.organizationId, filters);
  res.json(invoices);
}

export async function getInvoiceByIdController(req, res) {
  const invoice = await service.getInvoiceById(req.params.id, req.user.organizationId);
  res.json(invoice);
}

export async function createInvoiceController(req, res) {
  const invoice = await service.createInvoice(req.body, req.user.organizationId, req.user.id);
  res.status(201).json(invoice);
}

export async function updateInvoiceController(req, res) {
  const invoice = await service.updateInvoice(req.params.id, req.body, req.user.organizationId);
  res.json(invoice);
}

export async function deleteInvoiceController(req, res) {
  await service.deleteInvoice(req.params.id, req.user.organizationId);
  res.status(204).send();
}

export async function updatePaymentStatusController(req, res) {
  const { payment_status } = req.body;
  
  if (!payment_status) {
    return res.status(400).json({ message: 'Payment status is required' });
  }
  
  const invoice = await service.updatePaymentStatus(req.params.id, payment_status, req.user.organizationId);
  res.json(invoice);
}

export async function getInvoiceStatsController(req, res) {
  const stats = await service.getInvoiceStats(req.user.organizationId);
  res.json(stats);
}

export async function getRecentInvoicesController(req, res) {
  const limit = parseInt(req.query.limit) || 10;
  const invoices = await service.getRecentInvoices(req.user.organizationId, limit);
  res.json(invoices);
}



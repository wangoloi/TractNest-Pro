import {
  createNewCustomer,
  getAllCustomers,
  getCustomer,
  updateCustomerData,
  removeCustomer,
  searchCustomersByName
} from './service.js';

export async function list(req, res) {
  try {
    const organizationId = req.user?.organization_id || 1;
    const customers = await getAllCustomers(organizationId);
    res.json(customers);
  } catch (error) {
    console.error('Error listing customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
}

export async function create(req, res) {
  try {
    const organizationId = req.user?.organization_id || 1;
    const createdBy = req.user?.id || 1;
    const customer = await createNewCustomer(req.body, organizationId, createdBy);
    res.status(201).json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create customer' });
    }
  }
}

export async function getById(req, res) {
  try {
    const organizationId = req.user?.organization_id || 1;
    const customer = await getCustomer(parseInt(req.params.id), organizationId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
}

export async function update(req, res) {
  try {
    const organizationId = req.user?.organization_id || 1;
    const customer = await updateCustomerData(parseInt(req.params.id), req.body, organizationId);
    res.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    if (error.message === 'Customer not found or update failed') {
      res.status(404).json({ error: 'Customer not found' });
    } else if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to update customer' });
    }
  }
}

export async function remove(req, res) {
  try {
    const organizationId = req.user?.organization_id || 1;
    await removeCustomer(parseInt(req.params.id), organizationId);
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    if (error.message === 'Customer not found or delete failed') {
      res.status(404).json({ error: 'Customer not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete customer' });
    }
  }
}

export async function search(req, res) {
  try {
    const organizationId = req.user?.organization_id || 1;
    const searchTerm = req.query.q || '';
    const customers = await searchCustomersByName(searchTerm, organizationId);
    res.json(customers);
  } catch (error) {
    console.error('Error searching customers:', error);
    res.status(500).json({ error: 'Failed to search customers' });
  }
}

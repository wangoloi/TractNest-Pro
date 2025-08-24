import express from 'express';
import { requireAdmin } from '../../middlewares/roleCheck.js';
import { adminService } from './service.js';

const adminRoutes = express.Router();

// All admin routes require authentication and admin role
adminRoutes.use(requireAdmin);

// Get all admin users
adminRoutes.get('/admins', async (req, res) => {
  try {
    const admins = await adminService.getAllAdmins();
    res.json(admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
});

// Create new admin user
adminRoutes.post('/admins', async (req, res) => {
  try {
    const adminData = req.body;
    const newAdmin = await adminService.createAdmin(adminData);
    res.status(201).json(newAdmin);
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete admin user
adminRoutes.delete('/admins/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await adminService.deleteAdmin(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get admin activities
adminRoutes.get('/activities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const activities = await adminService.getAdminActivities(id);
    res.json(activities);
  } catch (error) {
    console.error('Error fetching admin activities:', error);
    res.status(500).json({ error: 'Failed to fetch admin activities' });
  }
});

// Owner-specific endpoints for enterprise management
adminRoutes.get('/organizations', async (req, res) => {
  try {
    // Mock organizations data for now
    const organizations = [
      {
        id: 1,
        name: 'Demo Organization',
        slug: 'demo',
        domain: 'demo.tracknest.com',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Tech Solutions Inc',
        slug: 'techsolutions',
        domain: 'techsolutions.tracknest.com',
        status: 'active',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Global Enterprises',
        slug: 'globalenterprises',
        domain: 'globalenterprises.tracknest.com',
        status: 'pending',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    res.json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});

adminRoutes.get('/stats', async (req, res) => {
  try {
    // Mock enterprise stats
    const stats = {
      totalUsers: 15,
      totalRevenue: 125000,
      totalInventory: 250,
      activeOrganizations: 2,
      pendingOrganizations: 1
    };
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export { adminRoutes };

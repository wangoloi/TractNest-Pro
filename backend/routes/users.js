const express = require('express');
const { User, Business, Subscription } = require('../models');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all users (with business isolation)
router.get('/', auth, async (req, res) => {
  try {
    let users;

    if (req.user.role === 'owner') {
      // Owner can see all users
      users = await User.findAll({
        include: [
          {
            model: Business,
            as: 'business',
            attributes: ['id', 'business_id', 'name', 'type', 'status']
          },
          {
            model: Subscription,
            as: 'subscription',
            attributes: ['id', 'plan', 'status', 'amount', 'billing_cycle', 'next_payment']
          }
        ],
        attributes: { exclude: ['password'] }
      });
    } else if (req.user.role === 'admin') {
      // Admin can only see users in their business
      const business = await Business.findOne({ where: { owner_id: req.user.id } });
      if (!business) {
        return res.json([]);
      }

      users = await User.findAll({
        where: {
          id: business.owner_id // Only show the admin themselves
        },
        include: [
          {
            model: Business,
            as: 'business',
            attributes: ['id', 'business_id', 'name', 'type', 'status']
          },
          {
            model: Subscription,
            as: 'subscription',
            attributes: ['id', 'plan', 'status', 'amount', 'billing_cycle', 'next_payment']
          }
        ],
        attributes: { exclude: ['password'] }
      });
    } else {
      // Regular users can only see themselves
      users = await User.findAll({
        where: { id: req.user.id },
        include: [
          {
            model: Business,
            as: 'business',
            attributes: ['id', 'business_id', 'name', 'type', 'status']
          },
          {
            model: Subscription,
            as: 'subscription',
            attributes: ['id', 'plan', 'status', 'amount', 'billing_cycle', 'next_payment']
          }
        ],
        attributes: { exclude: ['password'] }
      });
    }

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Check permissions
    if (req.user.role !== 'owner' && req.user.id !== userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const user = await User.findByPk(userId, {
      include: [
        {
          model: Business,
          as: 'business',
          attributes: ['id', 'business_id', 'name', 'type', 'address', 'phone', 'email', 'status']
        },
        {
          model: Subscription,
          as: 'subscription',
          attributes: ['id', 'plan', 'status', 'amount', 'billing_cycle', 'next_payment', 'start_date', 'end_date']
        }
      ],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
});

// Update user
router.put('/:id', auth, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { name, email, phone, status } = req.body;

    // Check permissions
    if (req.user.role !== 'owner' && req.user.id !== userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Update user
    await user.update({
      name: name || user.name,
      email: email || user.email,
      phone: phone || user.phone,
      status: status || user.status
    });

    res.json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user.' });
  }
});

// Delete user (only owner can delete)
router.delete('/:id', auth, authorize('owner'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Prevent owner from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account.' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    await user.destroy();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user.' });
  }
});

// Block/Unblock user (only owner can do this)
router.patch('/:id/status', auth, authorize('owner'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { status, reason } = req.body;

    if (!['active', 'blocked', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    // Prevent owner from blocking themselves
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot modify your own status.' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const updateData = {
      status,
      is_blocked: status === 'blocked',
      blocked_by: status === 'blocked' ? req.user.id : null,
      blocked_at: status === 'blocked' ? new Date() : null,
      blocked_reason: status === 'blocked' ? reason : null
    };

    await user.update(updateData);

    res.json({
      message: `User ${status} successfully`,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        status: user.status,
        is_blocked: user.is_blocked
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Failed to update user status.' });
  }
});

// Create admin user with business (owner only)
router.post('/create-admin', auth, async (req, res) => {
  try {
    // Only owner can create admin users
    if (req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Only owner can create admin users.' });
    }

    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      businessName, 
      businessType, 
      businessAddress, 
      businessPhone, 
      businessEmail 
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !businessName) {
      return res.status(400).json({ error: 'Missing required fields: firstName, lastName, email, businessName' });
    }

    // Generate username and password
    const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}`;
    const password = `${firstName.toLowerCase()}@${lastName.toLowerCase()}`;

    // Check if username or email already exists
    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [{ username }, { email }]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists.' });
    }

    // Create admin user
    const admin = await User.create({
      username,
      password,
      name: `${firstName} ${lastName}`.trim(),
      email,
      phone: phone || '',
      role: 'admin',
      status: 'active',
      access_level: 'full'
    });

    // Create business for the admin
    const business = await Business.create({
      business_id: `business_${username}_${Date.now()}`,
      name: businessName,
      type: businessType || 'retail',
      address: businessAddress || '',
      phone: businessPhone || phone || '',
      email: businessEmail || email,
      owner_id: admin.id,
      status: 'active'
    });

    // Create subscription for the admin
    const subscription = await Subscription.create({
      user_id: admin.id,
      plan: 'premium',
      status: 'trial',
      amount: 0.00,
      billing_cycle: 'monthly',
      start_date: new Date(),
      next_payment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    res.status(201).json({
      message: 'Admin user created successfully',
      user: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        status: admin.status
      },
      business: {
        id: business.id,
        business_id: business.business_id,
        name: business.name,
        type: business.type
      },
      subscription: {
        id: subscription.id,
        plan: subscription.plan,
        status: subscription.status
      },
      credentials: {
        username,
        password
      }
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({ error: 'Failed to create admin user.' });
  }
});

module.exports = router;

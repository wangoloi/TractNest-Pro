const express = require('express');
const { Business, User } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all businesses (owner only)
router.get('/', auth, async (req, res) => {
  try {
    let businesses;

    if (req.user.role === 'owner') {
      businesses = await Business.findAll({
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'username', 'name', 'email']
          }
        ]
      });
    } else {
      // Admin/User can only see their own business
      businesses = await Business.findAll({
        where: { owner_id: req.user.id },
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'username', 'name', 'email']
          }
        ]
      });
    }

    res.json(businesses);
  } catch (error) {
    console.error('Get businesses error:', error);
    res.status(500).json({ error: 'Failed to fetch businesses.' });
  }
});

// Create business
router.post('/', auth, async (req, res) => {
  try {
    const { name, type, address, phone, email } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required.' });
    }

    // Check if user already has a business
    const existingBusiness = await Business.findOne({ where: { owner_id: req.user.id } });
    if (existingBusiness) {
      return res.status(400).json({ error: 'User already has a business.' });
    }

    const business = await Business.create({
      business_id: `business_${Date.now()}`,
      name,
      type,
      address,
      phone,
      email,
      owner_id: req.user.id,
      status: 'active'
    });

    res.status(201).json({
      message: 'Business created successfully',
      business
    });
  } catch (error) {
    console.error('Create business error:', error);
    res.status(500).json({ error: 'Failed to create business.' });
  }
});

// Update business
router.put('/:id', auth, async (req, res) => {
  try {
    const businessId = parseInt(req.params.id);
    const updateData = req.body;

    const business = await Business.findByPk(businessId);
    if (!business) {
      return res.status(404).json({ error: 'Business not found.' });
    }

    // Check permissions
    if (req.user.role !== 'owner' && business.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    await business.update(updateData);

    res.json({
      message: 'Business updated successfully',
      business
    });
  } catch (error) {
    console.error('Update business error:', error);
    res.status(500).json({ error: 'Failed to update business.' });
  }
});

module.exports = router;

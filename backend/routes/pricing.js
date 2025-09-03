const express = require('express');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Default pricing configuration
let pricingConfig = {
  premium: {
    monthly: 59.99,
    weekly: 19.99,
    annually: 599.99
  },
  features: {
    sales_tracking: true,
    inventory_management: true,
    customer_management: true,
    reporting: true,
    multi_user: true
  }
};

// Get pricing configuration
router.get('/', async (req, res) => {
  try {
    res.json(pricingConfig);
  } catch (error) {
    console.error('Get pricing error:', error);
    res.status(500).json({ error: 'Failed to fetch pricing.' });
  }
});

// Update pricing configuration (owner only)
router.put('/', auth, authorize('owner'), async (req, res) => {
  try {
    const { premium, features } = req.body;

    if (premium) {
      pricingConfig.premium = { ...pricingConfig.premium, ...premium };
    }

    if (features) {
      pricingConfig.features = { ...pricingConfig.features, ...features };
    }

    res.json({
      message: 'Pricing updated successfully',
      pricing: pricingConfig
    });
  } catch (error) {
    console.error('Update pricing error:', error);
    res.status(500).json({ error: 'Failed to update pricing.' });
  }
});

module.exports = router;

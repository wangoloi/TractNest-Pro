const express = require('express');
const { Payment, Subscription, User } = require('../models');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all payments (owner only)
router.get('/', auth, authorize('owner'), async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'name', 'email']
        },
        {
          model: Subscription,
          as: 'subscription',
          attributes: ['id', 'plan', 'billing_cycle']
        }
      ],
      order: [['payment_date', 'DESC']]
    });

    res.json(payments);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payments.' });
  }
});

// Get user's own payments
router.get('/my-payments', auth, async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Subscription,
          as: 'subscription',
          attributes: ['id', 'plan', 'billing_cycle']
        }
      ],
      order: [['payment_date', 'DESC']]
    });

    res.json(payments);
  } catch (error) {
    console.error('Get my payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payments.' });
  }
});

// Create payment record
router.post('/', auth, async (req, res) => {
  try {
    const { subscription_id, amount, method, description } = req.body;

    if (!subscription_id || !amount || !method) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Check if subscription exists and belongs to user
    const subscription = await Subscription.findByPk(subscription_id);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found.' });
    }

    if (req.user.role !== 'owner' && subscription.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const payment = await Payment.create({
      subscription_id,
      user_id: subscription.user_id,
      amount,
      method,
      status: 'completed',
      payment_date: new Date(),
      description
    });

    res.status(201).json({
      message: 'Payment recorded successfully',
      payment
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Failed to record payment.' });
  }
});

module.exports = router;

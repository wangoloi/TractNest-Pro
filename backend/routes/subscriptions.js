const express = require('express');
const { Subscription, User, Payment } = require('../models');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all subscriptions (owner only)
router.get('/', auth, authorize('owner'), async (req, res) => {
  try {
    const subscriptions = await Subscription.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'name', 'email', 'role']
        },
        {
          model: Payment,
          as: 'payments',
          attributes: ['id', 'amount', 'method', 'status', 'payment_date']
        }
      ]
    });

    res.json(subscriptions);
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions.' });
  }
});

// Get user's own subscription
router.get('/my-subscription', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      where: { user_id: req.user.id },
      include: [
        {
          model: Payment,
          as: 'payments',
          attributes: ['id', 'amount', 'method', 'status', 'payment_date'],
          order: [['payment_date', 'DESC']]
        }
      ]
    });

    if (!subscription) {
      return res.status(404).json({ error: 'No subscription found.' });
    }

    res.json(subscription);
  } catch (error) {
    console.error('Get my subscription error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription.' });
  }
});

// Create subscription (owner only)
router.post('/', auth, authorize('owner'), async (req, res) => {
  try {
    const { user_id, plan, amount, billing_cycle } = req.body;

    if (!user_id || !plan || !amount || !billing_cycle) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Check if user exists
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Check if user already has a subscription
    const existingSubscription = await Subscription.findOne({ where: { user_id } });
    if (existingSubscription) {
      return res.status(400).json({ error: 'User already has a subscription.' });
    }

    // Calculate next payment date
    let nextPayment = new Date();
    switch (billing_cycle) {
      case 'weekly':
        nextPayment.setDate(nextPayment.getDate() + 7);
        break;
      case 'monthly':
        nextPayment.setMonth(nextPayment.getMonth() + 1);
        break;
      case 'annually':
        nextPayment.setFullYear(nextPayment.getFullYear() + 1);
        break;
      default:
        nextPayment.setMonth(nextPayment.getMonth() + 1);
    }

    const subscription = await Subscription.create({
      user_id,
      plan,
      status: 'active',
      amount,
      billing_cycle,
      start_date: new Date(),
      next_payment: nextPayment
    });

    res.status(201).json({
      message: 'Subscription created successfully',
      subscription
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ error: 'Failed to create subscription.' });
  }
});

// Update subscription
router.put('/:id', auth, async (req, res) => {
  try {
    const subscriptionId = parseInt(req.params.id);
    const { status, amount, billing_cycle } = req.body;

    const subscription = await Subscription.findByPk(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found.' });
    }

    // Check permissions
    if (req.user.role !== 'owner' && subscription.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Update subscription
    await subscription.update({
      status: status || subscription.status,
      amount: amount || subscription.amount,
      billing_cycle: billing_cycle || subscription.billing_cycle
    });

    res.json({
      message: 'Subscription updated successfully',
      subscription
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({ error: 'Failed to update subscription.' });
  }
});

// Cancel subscription
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const subscriptionId = parseInt(req.params.id);

    const subscription = await Subscription.findByPk(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found.' });
    }

    // Check permissions
    if (req.user.role !== 'owner' && subscription.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    await subscription.update({
      status: 'cancelled',
      end_date: new Date()
    });

    res.json({
      message: 'Subscription cancelled successfully',
      subscription
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription.' });
  }
});

module.exports = router;

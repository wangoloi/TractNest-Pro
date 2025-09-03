const express = require('express');
const { Sale, Business, User } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all sales (with business isolation)
router.get('/', auth, async (req, res) => {
  try {
    let sales;

    if (req.user.role === 'owner') {
      // Owner can see all sales
      sales = await Sale.findAll({
        include: [
          {
            model: Business,
            as: 'business',
            attributes: ['id', 'business_id', 'name', 'type']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'name']
          }
        ],
        order: [['sale_date', 'DESC']]
      });
    } else {
      // Admin/User can only see their own sales
      sales = await Sale.findAll({
        where: { user_id: req.user.id },
        include: [
          {
            model: Business,
            as: 'business',
            attributes: ['id', 'business_id', 'name', 'type']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'name']
          }
        ],
        order: [['sale_date', 'DESC']]
      });
    }

    res.json(sales);
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ error: 'Failed to fetch sales.' });
  }
});

// Create new sale
router.post('/', auth, async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      product_name,
      quantity,
      unit_price,
      payment_method,
      notes
    } = req.body;

    if (!customer_name || !product_name || !quantity || !unit_price) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Get user's business
    const business = await Business.findOne({ where: { owner_id: req.user.id } });
    if (!business) {
      return res.status(400).json({ error: 'No business found for user.' });
    }

    const total_amount = quantity * unit_price;

    const sale = await Sale.create({
      business_id: business.id,
      user_id: req.user.id,
      customer_name,
      customer_email,
      customer_phone,
      product_name,
      quantity,
      unit_price,
      total_amount,
      payment_method: payment_method || 'cash',
      status: 'completed',
      sale_date: new Date(),
      notes
    });

    res.status(201).json({
      message: 'Sale created successfully',
      sale
    });
  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({ error: 'Failed to create sale.' });
  }
});

// Get sale by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const saleId = parseInt(req.params.id);

    const sale = await Sale.findByPk(saleId, {
      include: [
        {
          model: Business,
          as: 'business',
          attributes: ['id', 'business_id', 'name', 'type']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'name']
        }
      ]
    });

    if (!sale) {
      return res.status(404).json({ error: 'Sale not found.' });
    }

    // Check permissions
    if (req.user.role !== 'owner' && sale.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.json(sale);
  } catch (error) {
    console.error('Get sale error:', error);
    res.status(500).json({ error: 'Failed to fetch sale.' });
  }
});

// Update sale
router.put('/:id', auth, async (req, res) => {
  try {
    const saleId = parseInt(req.params.id);
    const updateData = req.body;

    const sale = await Sale.findByPk(saleId);
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found.' });
    }

    // Check permissions
    if (req.user.role !== 'owner' && sale.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Recalculate total if quantity or unit_price changed
    if (updateData.quantity || updateData.unit_price) {
      const newQuantity = updateData.quantity || sale.quantity;
      const newUnitPrice = updateData.unit_price || sale.unit_price;
      updateData.total_amount = newQuantity * newUnitPrice;
    }

    await sale.update(updateData);

    res.json({
      message: 'Sale updated successfully',
      sale
    });
  } catch (error) {
    console.error('Update sale error:', error);
    res.status(500).json({ error: 'Failed to update sale.' });
  }
});

// Delete sale
router.delete('/:id', auth, async (req, res) => {
  try {
    const saleId = parseInt(req.params.id);

    const sale = await Sale.findByPk(saleId);
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found.' });
    }

    // Check permissions
    if (req.user.role !== 'owner' && sale.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    await sale.destroy();

    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    console.error('Delete sale error:', error);
    res.status(500).json({ error: 'Failed to delete sale.' });
  }
});

module.exports = router;

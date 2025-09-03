const express = require('express');
const { Message, User } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user's messages
router.get('/', auth, async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: {
        [require('sequelize').Op.or]: [
          { sender_id: req.user.id },
          { recipient_id: req.user.id }
        ]
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'name']
        },
        {
          model: User,
          as: 'recipient',
          attributes: ['id', 'username', 'name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages.' });
  }
});

// Send message
router.post('/', auth, async (req, res) => {
  try {
    const { recipient_id, subject, content, message_type } = req.body;

    if (!recipient_id || !subject || !content) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Check if recipient exists
    const recipient = await User.findByPk(recipient_id);
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found.' });
    }

    const message = await Message.create({
      sender_id: req.user.id,
      recipient_id,
      subject,
      content,
      message_type: message_type || 'general',
      status: 'sent'
    });

    res.status(201).json({
      message: 'Message sent successfully',
      messageData: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message.' });
  }
});

// Mark message as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const messageId = parseInt(req.params.id);

    const message = await Message.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found.' });
    }

    // Check if user is the recipient
    if (message.recipient_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    await message.update({
      status: 'read',
      read_at: new Date()
    });

    res.json({
      message: 'Message marked as read',
      messageData: message
    });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({ error: 'Failed to mark message as read.' });
  }
});

module.exports = router;

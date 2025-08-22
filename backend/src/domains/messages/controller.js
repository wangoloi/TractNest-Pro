import {
  createNewMessage,
  getAllMessages,
  getMessage,
  updateMessage,
  removeMessage,
  getMessageStatistics
} from './service.js';

export async function list(req, res) {
  try {
    const organizationId = req.user?.organization_id || 1;
    const filters = {
      status: req.query.status,
      priority: req.query.priority,
      message_type: req.query.message_type
    };
    const messages = await getAllMessages(organizationId, filters);
    res.json(messages);
  } catch (error) {
    console.error('Error listing messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
}

export async function create(req, res) {
  try {
    const organizationId = req.user?.organization_id || 1;
    const userId = req.user?.id || 1;
    const message = await createNewMessage(req.body, organizationId, userId);
    res.status(201).json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create message' });
    }
  }
}

export async function getById(req, res) {
  try {
    const organizationId = req.user?.organization_id || 1;
    const message = await getMessage(parseInt(req.params.id), organizationId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json(message);
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ error: 'Failed to fetch message' });
  }
}

export async function update(req, res) {
  try {
    const organizationId = req.user?.organization_id || 1;
    const resolvedBy = req.user?.id || 1;
    const message = await updateMessage(parseInt(req.params.id), req.body, organizationId, resolvedBy);
    res.json(message);
  } catch (error) {
    console.error('Error updating message:', error);
    if (error.message === 'Message not found or update failed') {
      res.status(404).json({ error: 'Message not found' });
    } else if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to update message' });
    }
  }
}

export async function remove(req, res) {
  try {
    const organizationId = req.user?.organization_id || 1;
    await removeMessage(parseInt(req.params.id), organizationId);
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    if (error.message === 'Message not found or delete failed') {
      res.status(404).json({ error: 'Message not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete message' });
    }
  }
}

export async function stats(req, res) {
  try {
    const organizationId = req.user?.organization_id || 1;
    const statistics = await getMessageStatistics(organizationId);
    res.json(statistics);
  } catch (error) {
    console.error('Error fetching message statistics:', error);
    res.status(500).json({ error: 'Failed to fetch message statistics' });
  }
}

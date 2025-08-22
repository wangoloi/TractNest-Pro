import { z } from 'zod';
import {
  createMessage,
  listMessages,
  getMessageById,
  updateMessageStatus,
  deleteMessage,
  getMessageStats
} from './repository.js';

const messageSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
  customer_id: z.number().optional(),
  message_type: z.enum(['support', 'general', 'notification']).default('support'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium')
});

const updateMessageSchema = z.object({
  status: z.enum(['new', 'in_progress', 'resolved', 'closed']),
  admin_response: z.string().optional()
});

export async function createNewMessage(payload, organizationId, userId) {
  const data = messageSchema.parse(payload);
  return createMessage(data, organizationId, userId);
}

export async function getAllMessages(organizationId, filters = {}) {
  return listMessages(organizationId, filters);
}

export async function getMessage(id, organizationId) {
  return getMessageById(id, organizationId);
}

export async function updateMessage(id, payload, organizationId, resolvedBy = null) {
  const data = updateMessageSchema.parse(payload);
  const success = await updateMessageStatus(id, data, organizationId, resolvedBy);
  if (!success) {
    throw new Error('Message not found or update failed');
  }
  return getMessageById(id, organizationId);
}

export async function removeMessage(id, organizationId) {
  const success = await deleteMessage(id, organizationId);
  if (!success) {
    throw new Error('Message not found or delete failed');
  }
  return { id };
}

export async function getMessageStatistics(organizationId) {
  return getMessageStats(organizationId);
}

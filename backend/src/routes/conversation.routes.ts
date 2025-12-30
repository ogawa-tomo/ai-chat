import { Router } from 'express';
import conversationController from '../controllers/conversation.controller';

const router = Router();

/**
 * POST /api/conversations
 * Create a new conversation
 */
router.post('/', (req, res, next) =>
  conversationController.createConversation(req, res, next)
);

/**
 * GET /api/conversations
 * Get all conversations
 */
router.get('/', (req: any, res, next) =>
  conversationController.getConversations(req, res, next)
);

/**
 * GET /api/conversations/:id
 * Get a specific conversation
 */
router.get('/:id', (req, res, next) =>
  conversationController.getConversationById(req, res, next)
);

/**
 * PATCH /api/conversations/:id
 * Update conversation title
 */
router.patch('/:id', (req, res, next) =>
  conversationController.updateConversation(req, res, next)
);

/**
 * DELETE /api/conversations/:id
 * Delete a conversation
 */
router.delete('/:id', (req, res, next) =>
  conversationController.deleteConversation(req, res, next)
);

export default router;

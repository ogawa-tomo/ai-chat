import { Router } from 'express';
import chatController from '../controllers/chat.controller';

const router = Router();

/**
 * POST /api/chat/message
 * Send a message and receive streaming response
 */
router.post('/message', (req, res, next) => chatController.sendMessage(req, res, next));

export default router;

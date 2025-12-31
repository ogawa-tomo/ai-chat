import { Request, Response, NextFunction } from 'express';
import { SendMessageRequest, sendMessageSchema } from '../types/api';
import claudeService from '../services/claude.service';
import conversationService from '../services/conversation.service';
import { Role } from '@prisma/client';

export class ChatController {
  /**
   * Send a message and stream Claude's response
   * POST /api/chat/message
   */
  async sendMessage(
    req: Request<{}, {}, SendMessageRequest>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Validate request
      const { conversationId, message, model } = sendMessageSchema.parse(req.body);

      // Set up SSE headers first (before any write operations)
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Create new conversation if conversationId is null
      let finalConversationId = conversationId;
      if (!finalConversationId) {
        const conversation = await conversationService.createConversation();
        finalConversationId = conversation.id;

        // Send conversation ID to client before streaming starts
        res.write(
          `data: ${JSON.stringify({
            type: 'conversation_id',
            conversationId: finalConversationId,
          })}\n\n`
        );
      }

      // Save user message
      await conversationService.saveMessage(finalConversationId, Role.USER, message);

      // Get conversation history
      const messages = await conversationService.getMessages(finalConversationId);

      // Convert to MessageContent format
      const messageContents = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Stream response from Claude
      const assistantResponse = await claudeService.streamMessage(
        res,
        messageContents,
        model
      );

      // Save assistant response
      await conversationService.saveMessage(
        finalConversationId,
        Role.ASSISTANT,
        assistantResponse
      );
    } catch (error) {
      // If headers are already sent (SSE stream started), send error via SSE
      if (res.headersSent) {
        const errorMessage =
          error instanceof Error ? error.message : 'An unknown error occurred';
        res.write(
          `data: ${JSON.stringify({ type: 'error', message: errorMessage })}\n\n`
        );
        res.end();
        return;
      }

      // Otherwise, use normal error handling
      next(error);
    }
  }
}

export default new ChatController();

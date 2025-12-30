import { Request, Response, NextFunction } from 'express';
import {
  CreateConversationRequest,
  UpdateConversationRequest,
  GetConversationsRequest,
  createConversationSchema,
  updateConversationSchema,
  getConversationsSchema,
  ConversationResponse,
  ConversationWithMessagesResponse,
  ConversationsListResponse,
  DeleteConversationResponse,
  MessageResponse,
} from '../types/api';
import conversationService from '../services/conversation.service';

export class ConversationController {
  /**
   * Create a new conversation
   * POST /api/conversations
   */
  async createConversation(
    req: Request<{}, {}, CreateConversationRequest>,
    res: Response<ConversationResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { title } = createConversationSchema.parse(req.body);
      const conversation = await conversationService.createConversation(title);

      res.status(201).json({
        id: conversation.id,
        title: conversation.title,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all conversations
   * GET /api/conversations
   */
  async getConversations(
    req: Request<{}, {}, {}, GetConversationsRequest>,
    res: Response<ConversationsListResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { limit, offset } = getConversationsSchema.parse(req.query);
      const { conversations, total } = await conversationService.getConversations(
        limit,
        offset
      );

      res.status(200).json({
        conversations,
        total,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a specific conversation with messages
   * GET /api/conversations/:id
   */
  async getConversationById(
    req: Request<{ id: string }>,
    res: Response<ConversationWithMessagesResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const conversation = await conversationService.getConversationById(id);

      const messages: MessageResponse[] = conversation.messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt,
      }));

      res.status(200).json({
        id: conversation.id,
        title: conversation.title,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        messages,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update conversation title
   * PATCH /api/conversations/:id
   */
  async updateConversation(
    req: Request<{ id: string }, {}, UpdateConversationRequest>,
    res: Response<ConversationResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { title } = updateConversationSchema.parse(req.body);

      const conversation = await conversationService.updateConversation(id, title);

      res.status(200).json({
        id: conversation.id,
        title: conversation.title,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a conversation
   * DELETE /api/conversations/:id
   */
  async deleteConversation(
    req: Request<{ id: string }>,
    res: Response<DeleteConversationResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      await conversationService.deleteConversation(id);

      res.status(200).json({
        success: true,
        message: 'Conversation deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ConversationController();

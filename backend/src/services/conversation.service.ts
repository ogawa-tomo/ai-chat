import prisma from '../config/database';
import { Role } from '@prisma/client';
import {
  Conversation,
  Message,
  ConversationWithMessages,
  ConversationPreview,
} from '../types/models';
import { AppError } from '../middleware/errorHandler';

export class ConversationService {
  /**
   * Create a new conversation
   */
  async createConversation(title?: string | null): Promise<Conversation> {
    try {
      const conversation = await prisma.conversation.create({
        data: {
          title: title || null,
        },
      });
      return conversation;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to create conversation');
    }
  }

  /**
   * Get all conversations with preview information
   */
  async getConversations(
    limit: number = 50,
    offset: number = 0
  ): Promise<{ conversations: ConversationPreview[]; total: number }> {
    try {
      const [conversations, total] = await Promise.all([
        prisma.conversation.findMany({
          take: limit,
          skip: offset,
          orderBy: {
            updatedAt: 'desc',
          },
          include: {
            messages: {
              take: 1,
              orderBy: {
                createdAt: 'asc',
              },
              select: {
                content: true,
              },
            },
            _count: {
              select: {
                messages: true,
              },
            },
          },
        }),
        prisma.conversation.count(),
      ]);

      const conversationPreviews: ConversationPreview[] = conversations.map((conv) => ({
        id: conv.id,
        title: conv.title,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        messageCount: conv._count.messages,
        preview: conv.messages[0]?.content.substring(0, 100) || '',
      }));

      return {
        conversations: conversationPreviews,
        total,
      };
    } catch (error) {
      console.error('Failed to get conversations:', error);
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to retrieve conversations');
    }
  }

  /**
   * Get a specific conversation with all messages
   */
  async getConversationById(conversationId: string): Promise<ConversationWithMessages> {
    try {
      const conversation = await prisma.conversation.findUnique({
        where: {
          id: conversationId,
        },
        include: {
          messages: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });

      if (!conversation) {
        throw new AppError(404, 'NOT_FOUND', 'Conversation not found');
      }

      return conversation;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Failed to get conversation:', error);
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to retrieve conversation');
    }
  }

  /**
   * Update conversation title
   */
  async updateConversation(conversationId: string, title: string): Promise<Conversation> {
    try {
      const conversation = await prisma.conversation.update({
        where: {
          id: conversationId,
        },
        data: {
          title,
        },
      });

      return conversation;
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new AppError(404, 'NOT_FOUND', 'Conversation not found');
      }
      console.error('Failed to update conversation:', error);
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to update conversation');
    }
  }

  /**
   * Delete a conversation and all its messages
   */
  async deleteConversation(conversationId: string): Promise<void> {
    try {
      await prisma.conversation.delete({
        where: {
          id: conversationId,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new AppError(404, 'NOT_FOUND', 'Conversation not found');
      }
      console.error('Failed to delete conversation:', error);
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to delete conversation');
    }
  }

  /**
   * Save a message to a conversation
   */
  async saveMessage(
    conversationId: string,
    role: Role,
    content: string
  ): Promise<Message> {
    try {
      const message = await prisma.message.create({
        data: {
          conversationId,
          role,
          content,
        },
      });

      // Update conversation's updatedAt timestamp
      await prisma.conversation.update({
        where: {
          id: conversationId,
        },
        data: {
          updatedAt: new Date(),
        },
      });

      return message;
    } catch (error: any) {
      if (error.code === 'P2003') {
        throw new AppError(404, 'NOT_FOUND', 'Conversation not found');
      }
      console.error('Failed to save message:', error);
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to save message');
    }
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const messages = await prisma.message.findMany({
        where: {
          conversationId,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      return messages;
    } catch (error) {
      console.error('Failed to get messages:', error);
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to retrieve messages');
    }
  }
}

export default new ConversationService();

import { ConversationService } from '../../../src/services/conversation.service';
import { Role } from '@prisma/client';
import prisma from '../../../src/config/database';
import { AppError } from '../../../src/middleware/errorHandler';

// Mock Prisma client
jest.mock('../../../src/config/database', () => ({
  __esModule: true,
  default: {
    conversation: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    message: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
  connectDatabase: jest.fn(),
  disconnectDatabase: jest.fn(),
}));

describe('ConversationService', () => {
  let conversationService: ConversationService;

  beforeEach(() => {
    conversationService = new ConversationService();
    jest.clearAllMocks();
  });

  describe('createConversation', () => {
    it('should create a conversation with a title', async () => {
      const mockConversation = {
        id: 'conv_123',
        title: 'Test Conversation',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.conversation.create as jest.Mock).mockResolvedValue(mockConversation);

      const result = await conversationService.createConversation('Test Conversation');

      expect(result).toEqual(mockConversation);
      expect(prisma.conversation.create).toHaveBeenCalledWith({
        data: { title: 'Test Conversation' },
      });
    });

    it('should create a conversation without a title', async () => {
      const mockConversation = {
        id: 'conv_456',
        title: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.conversation.create as jest.Mock).mockResolvedValue(mockConversation);

      const result = await conversationService.createConversation();

      expect(result).toEqual(mockConversation);
      expect(prisma.conversation.create).toHaveBeenCalledWith({
        data: { title: null },
      });
    });
  });

  describe('getConversations', () => {
    it('should get conversations with preview information', async () => {
      const mockConversations = [
        {
          id: 'conv_1',
          title: 'Conversation 1',
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-02'),
          messages: [{ content: 'First message in conversation 1' }],
          _count: { messages: 5 },
        },
        {
          id: 'conv_2',
          title: null,
          createdAt: new Date('2025-01-03'),
          updatedAt: new Date('2025-01-04'),
          messages: [{ content: 'First message in conversation 2' }],
          _count: { messages: 3 },
        },
      ];

      (prisma.conversation.findMany as jest.Mock).mockResolvedValue(mockConversations);
      (prisma.conversation.count as jest.Mock).mockResolvedValue(2);

      const result = await conversationService.getConversations(50, 0);

      expect(result.total).toBe(2);
      expect(result.conversations).toHaveLength(2);
      expect(result.conversations[0]).toEqual({
        id: 'conv_1',
        title: 'Conversation 1',
        createdAt: mockConversations[0].createdAt,
        updatedAt: mockConversations[0].updatedAt,
        messageCount: 5,
        preview: 'First message in conversation 1',
      });
    });

    it('should respect limit and offset parameters', async () => {
      (prisma.conversation.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.conversation.count as jest.Mock).mockResolvedValue(100);

      await conversationService.getConversations(20, 40);

      expect(prisma.conversation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 20,
          skip: 40,
        })
      );
    });
  });

  describe('getConversationById', () => {
    it('should get a conversation with all messages', async () => {
      const mockConversation = {
        id: 'conv_123',
        title: 'Test Conversation',
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [
          {
            id: 'msg_1',
            conversationId: 'conv_123',
            role: Role.USER,
            content: 'Hello',
            createdAt: new Date(),
          },
          {
            id: 'msg_2',
            conversationId: 'conv_123',
            role: Role.ASSISTANT,
            content: 'Hi there!',
            createdAt: new Date(),
          },
        ],
      };

      (prisma.conversation.findUnique as jest.Mock).mockResolvedValue(mockConversation);

      const result = await conversationService.getConversationById('conv_123');

      expect(result).toEqual(mockConversation);
      expect(prisma.conversation.findUnique).toHaveBeenCalledWith({
        where: { id: 'conv_123' },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    });

    it('should throw error if conversation not found', async () => {
      (prisma.conversation.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        conversationService.getConversationById('nonexistent')
      ).rejects.toThrow(AppError);
    });
  });

  describe('updateConversation', () => {
    it('should update conversation title', async () => {
      const mockConversation = {
        id: 'conv_123',
        title: 'Updated Title',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.conversation.update as jest.Mock).mockResolvedValue(mockConversation);

      const result = await conversationService.updateConversation('conv_123', 'Updated Title');

      expect(result).toEqual(mockConversation);
      expect(prisma.conversation.update).toHaveBeenCalledWith({
        where: { id: 'conv_123' },
        data: { title: 'Updated Title' },
      });
    });

    it('should throw error if conversation not found', async () => {
      const mockError = { code: 'P2025' };
      (prisma.conversation.update as jest.Mock).mockRejectedValue(mockError);

      await expect(
        conversationService.updateConversation('nonexistent', 'New Title')
      ).rejects.toThrow(AppError);
    });
  });

  describe('deleteConversation', () => {
    it('should delete a conversation', async () => {
      (prisma.conversation.delete as jest.Mock).mockResolvedValue({});

      await conversationService.deleteConversation('conv_123');

      expect(prisma.conversation.delete).toHaveBeenCalledWith({
        where: { id: 'conv_123' },
      });
    });

    it('should throw error if conversation not found', async () => {
      const mockError = { code: 'P2025' };
      (prisma.conversation.delete as jest.Mock).mockRejectedValue(mockError);

      await expect(
        conversationService.deleteConversation('nonexistent')
      ).rejects.toThrow(AppError);
    });
  });

  describe('saveMessage', () => {
    it('should save a message and update conversation timestamp', async () => {
      const mockMessage = {
        id: 'msg_123',
        conversationId: 'conv_123',
        role: Role.USER,
        content: 'Test message',
        createdAt: new Date(),
      };

      (prisma.message.create as jest.Mock).mockResolvedValue(mockMessage);
      (prisma.conversation.update as jest.Mock).mockResolvedValue({});

      const result = await conversationService.saveMessage(
        'conv_123',
        Role.USER,
        'Test message'
      );

      expect(result).toEqual(mockMessage);
      expect(prisma.message.create).toHaveBeenCalledWith({
        data: {
          conversationId: 'conv_123',
          role: Role.USER,
          content: 'Test message',
        },
      });
      expect(prisma.conversation.update).toHaveBeenCalledWith({
        where: { id: 'conv_123' },
        data: { updatedAt: expect.any(Date) },
      });
    });

    it('should throw error if conversation not found', async () => {
      const mockError = { code: 'P2003' };
      (prisma.message.create as jest.Mock).mockRejectedValue(mockError);

      await expect(
        conversationService.saveMessage('nonexistent', Role.USER, 'Test')
      ).rejects.toThrow(AppError);
    });
  });

  describe('getMessages', () => {
    it('should get all messages for a conversation', async () => {
      const mockMessages = [
        {
          id: 'msg_1',
          conversationId: 'conv_123',
          role: Role.USER,
          content: 'Hello',
          createdAt: new Date('2025-01-01'),
        },
        {
          id: 'msg_2',
          conversationId: 'conv_123',
          role: Role.ASSISTANT,
          content: 'Hi there!',
          createdAt: new Date('2025-01-02'),
        },
      ];

      (prisma.message.findMany as jest.Mock).mockResolvedValue(mockMessages);

      const result = await conversationService.getMessages('conv_123');

      expect(result).toEqual(mockMessages);
      expect(prisma.message.findMany).toHaveBeenCalledWith({
        where: { conversationId: 'conv_123' },
        orderBy: { createdAt: 'asc' },
      });
    });
  });
});

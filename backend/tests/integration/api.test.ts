import request from 'supertest';
import { Role } from '@prisma/client';

// Mock dependencies before imports
jest.mock('../../src/config/database', () => ({
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

jest.mock('../../src/config/claude', () => ({
  claude: {
    messages: {
      stream: jest.fn(),
      create: jest.fn(),
    },
  },
  claudeConfig: {
    model: 'claude-3-5-sonnet-20241022',
    maxTokens: 4096,
  },
}));

// Import after mocking
import app from '../../src/app';
import prisma from '../../src/config/database';

describe('API Integration Tests', () => {
  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('POST /api/conversations', () => {
    it('should create a new conversation with title', async () => {
      const mockConversation = {
        id: 'conv_123',
        title: 'My Conversation',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.conversation.create as jest.Mock).mockResolvedValue(mockConversation);

      const response = await request(app)
        .post('/api/conversations')
        .send({ title: 'My Conversation' });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        id: 'conv_123',
        title: 'My Conversation',
      });
    });

    it('should create a new conversation without title', async () => {
      const mockConversation = {
        id: 'conv_456',
        title: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.conversation.create as jest.Mock).mockResolvedValue(mockConversation);

      const response = await request(app)
        .post('/api/conversations')
        .send({ title: null });

      expect(response.status).toBe(201);
      expect(response.body.title).toBeNull();
    });
  });

  describe('GET /api/conversations', () => {
    it('should get all conversations', async () => {
      const mockConversations = [
        {
          id: 'conv_1',
          title: 'Conversation 1',
          createdAt: new Date(),
          updatedAt: new Date(),
          messages: [{ content: 'First message' }],
          _count: { messages: 5 },
        },
      ];

      (prisma.conversation.findMany as jest.Mock).mockResolvedValue(mockConversations);
      (prisma.conversation.count as jest.Mock).mockResolvedValue(1);

      const response = await request(app).get('/api/conversations');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('conversations');
      expect(response.body).toHaveProperty('total', 1);
      expect(response.body.conversations).toHaveLength(1);
    });

    it('should respect query parameters', async () => {
      (prisma.conversation.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.conversation.count as jest.Mock).mockResolvedValue(0);

      const response = await request(app)
        .get('/api/conversations')
        .query({ limit: 10, offset: 20 });

      expect(response.status).toBe(200);
      expect(prisma.conversation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 20,
        })
      );
    });

    it('should validate query parameters', async () => {
      const response = await request(app)
        .get('/api/conversations')
        .query({ limit: -1 });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/conversations/:id', () => {
    it('should get a specific conversation', async () => {
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
        ],
      };

      (prisma.conversation.findUnique as jest.Mock).mockResolvedValue(mockConversation);

      const response = await request(app).get('/api/conversations/conv_123');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: 'conv_123',
        title: 'Test Conversation',
      });
      expect(response.body.messages).toHaveLength(1);
    });

    it('should return 404 for non-existent conversation', async () => {
      (prisma.conversation.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/api/conversations/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PATCH /api/conversations/:id', () => {
    it('should update conversation title', async () => {
      const mockConversation = {
        id: 'conv_123',
        title: 'Updated Title',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.conversation.update as jest.Mock).mockResolvedValue(mockConversation);

      const response = await request(app)
        .patch('/api/conversations/conv_123')
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated Title');
    });

    it('should validate title is not empty', async () => {
      const response = await request(app)
        .patch('/api/conversations/conv_123')
        .send({ title: '' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/conversations/:id', () => {
    it('should delete a conversation', async () => {
      (prisma.conversation.delete as jest.Mock).mockResolvedValue({});

      const response = await request(app).delete('/api/conversations/conv_123');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        message: 'Conversation deleted successfully',
      });
    });

    it('should return 404 for non-existent conversation', async () => {
      const mockError = { code: 'P2025' };
      (prisma.conversation.delete as jest.Mock).mockRejectedValue(mockError);

      const response = await request(app).delete('/api/conversations/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/api/unknown-route');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });
});

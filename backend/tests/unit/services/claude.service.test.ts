import { Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { ClaudeService } from '../../../src/services/claude.service';
import { MessageContent } from '../../../src/types/models';
import { Role } from '@prisma/client';

// Mock the Anthropic SDK
jest.mock('@anthropic-ai/sdk');
jest.mock('../../../src/config/claude', () => ({
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

describe('ClaudeService', () => {
  let claudeService: ClaudeService;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    claudeService = new ClaudeService();
    mockResponse = {
      setHeader: jest.fn(),
      write: jest.fn(),
      end: jest.fn(),
    };
  });

  describe('sendMessage', () => {
    it('should send a message and return text response', async () => {
      const mockMessages: MessageContent[] = [
        { role: Role.USER, content: 'Hello, Claude!' },
      ];

      const mockResponse = {
        id: 'msg_123',
        type: 'message' as const,
        role: 'assistant' as const,
        content: [
          {
            type: 'text' as const,
            text: 'Hello! How can I help you today?',
          },
        ],
        model: 'claude-3-5-sonnet-20241022',
        stop_reason: 'end_turn' as const,
        stop_sequence: null,
        usage: {
          input_tokens: 10,
          output_tokens: 20,
        },
      };

      const { claude } = require('../../../src/config/claude');
      (claude.messages.create as jest.Mock).mockResolvedValue(mockResponse);

      const result = await claudeService.sendMessage(mockMessages);

      expect(result).toBe('Hello! How can I help you today?');
      expect(claude.messages.create).toHaveBeenCalledWith({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [{ role: 'user', content: 'Hello, Claude!' }],
      });
    });

    it('should handle API errors properly', async () => {
      const mockMessages: MessageContent[] = [
        { role: Role.USER, content: 'Test message' },
      ];

      const mockError = new Anthropic.APIError(
        500,
        {
          error: {
            type: 'api_error',
            message: 'Internal server error',
          },
        },
        'Internal server error',
        {}
      );

      const { claude } = require('../../../src/config/claude');
      (claude.messages.create as jest.Mock).mockRejectedValue(mockError);

      await expect(claudeService.sendMessage(mockMessages)).rejects.toThrow();
    });

    it('should convert USER and ASSISTANT roles correctly', async () => {
      const mockMessages: MessageContent[] = [
        { role: Role.USER, content: 'First message' },
        { role: Role.ASSISTANT, content: 'First response' },
        { role: Role.USER, content: 'Second message' },
      ];

      const mockResponse = {
        id: 'msg_123',
        type: 'message' as const,
        role: 'assistant' as const,
        content: [{ type: 'text' as const, text: 'Second response' }],
        model: 'claude-3-5-sonnet-20241022',
        stop_reason: 'end_turn' as const,
        stop_sequence: null,
        usage: { input_tokens: 30, output_tokens: 10 },
      };

      const { claude } = require('../../../src/config/claude');
      (claude.messages.create as jest.Mock).mockResolvedValue(mockResponse);

      await claudeService.sendMessage(mockMessages);

      expect(claude.messages.create).toHaveBeenCalledWith({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [
          { role: 'user', content: 'First message' },
          { role: 'assistant', content: 'First response' },
          { role: 'user', content: 'Second message' },
        ],
      });
    });

    it('should use custom model when provided', async () => {
      const mockMessages: MessageContent[] = [
        { role: Role.USER, content: 'Test' },
      ];

      const mockResponse = {
        id: 'msg_123',
        type: 'message' as const,
        role: 'assistant' as const,
        content: [{ type: 'text' as const, text: 'Response' }],
        model: 'claude-opus-4-20250514',
        stop_reason: 'end_turn' as const,
        stop_sequence: null,
        usage: { input_tokens: 5, output_tokens: 5 },
      };

      const { claude } = require('../../../src/config/claude');
      (claude.messages.create as jest.Mock).mockResolvedValue(mockResponse);

      await claudeService.sendMessage(mockMessages, 'claude-opus-4-20250514');

      expect(claude.messages.create).toHaveBeenCalledWith({
        model: 'claude-opus-4-20250514',
        max_tokens: 4096,
        messages: [{ role: 'user', content: 'Test' }],
      });
    });
  });

  describe('streamMessage', () => {
    it('should stream messages and return full response', async () => {
      const mockMessages: MessageContent[] = [
        { role: Role.USER, content: 'Tell me a joke' },
      ];

      const mockStream = {
        on: jest.fn((event: string, handler: Function) => {
          if (event === 'text') {
            // Simulate streaming chunks
            handler('Why did the ');
            handler('chicken cross ');
            handler('the road?');
          }
          return mockStream;
        }),
        finalMessage: jest.fn().mockResolvedValue({
          id: 'msg_123',
          content: [{ type: 'text', text: 'Why did the chicken cross the road?' }],
        }),
      };

      const { claude } = require('../../../src/config/claude');
      (claude.messages.stream as jest.Mock).mockReturnValue(mockStream);

      const result = await claudeService.streamMessage(
        mockResponse as Response,
        mockMessages
      );

      expect(result).toBe('Why did the chicken cross the road?');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Connection', 'keep-alive');
      expect(mockResponse.write).toHaveBeenCalled();
      expect(mockResponse.end).toHaveBeenCalled();
    });

    it('should handle streaming errors', async () => {
      const mockMessages: MessageContent[] = [
        { role: Role.USER, content: 'Test' },
      ];

      const mockError = new Error('Stream error');
      const mockStream = {
        on: jest.fn((event: string, handler: Function) => {
          if (event === 'error') {
            handler(mockError);
          }
          return mockStream;
        }),
        finalMessage: jest.fn().mockResolvedValue({
          id: 'msg_123',
          content: [{ type: 'text', text: '' }],
        }),
      };

      const { claude } = require('../../../src/config/claude');
      (claude.messages.stream as jest.Mock).mockReturnValue(mockStream);

      await claudeService.streamMessage(mockResponse as Response, mockMessages);

      expect(mockResponse.write).toHaveBeenCalledWith(
        expect.stringContaining('"type":"error"')
      );
    });
  });
});

import { z } from 'zod';
import { Role } from '@prisma/client';

// Request schemas
export const sendMessageSchema = z.object({
  conversationId: z.string().nullable(),
  message: z.string().min(1, 'Message cannot be empty'),
  model: z.string().optional(),
});

export const createConversationSchema = z.object({
  title: z.string().nullable().optional(),
});

export const updateConversationSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty'),
});

export const getConversationsSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  offset: z.coerce.number().int().nonnegative().optional().default(0),
});

// Request types
export type SendMessageRequest = z.infer<typeof sendMessageSchema>;
export type CreateConversationRequest = z.infer<typeof createConversationSchema>;
export type UpdateConversationRequest = z.infer<typeof updateConversationSchema>;
export type GetConversationsRequest = z.infer<typeof getConversationsSchema>;

// Response types
export interface MessageResponse {
  id: string;
  role: Role;
  content: string;
  createdAt: Date;
}

export interface ConversationResponse {
  id: string;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationWithMessagesResponse extends ConversationResponse {
  messages: MessageResponse[];
}

export interface ConversationPreviewResponse extends ConversationResponse {
  messageCount: number;
  preview: string;
}

export interface ConversationsListResponse {
  conversations: ConversationPreviewResponse[];
  total: number;
}

export interface DeleteConversationResponse {
  success: boolean;
  message: string;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

import { Conversation, Message, Role } from '@prisma/client';

// Re-export Prisma types
export type { Conversation, Message, Role };

// Extended types
export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

export interface ConversationPreview extends Conversation {
  messageCount: number;
  preview: string;
}

export interface MessageContent {
  role: Role;
  content: string;
}

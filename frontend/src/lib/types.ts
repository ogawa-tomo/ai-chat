// Message role types
export type Role = "USER" | "ASSISTANT";

// Message type
export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: string;
}

// Conversation type
export interface Conversation {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}

// Conversation with preview for list display
export interface ConversationPreview {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  preview: string;
}

// API Request types
export interface SendMessageRequest {
  conversationId: string | null;
  message: string;
  model: string;
}

export interface CreateConversationRequest {
  title?: string | null;
}

export interface UpdateConversationRequest {
  title: string;
}

// API Response types
export interface ConversationResponse {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationDetailResponse {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export interface ConversationListResponse {
  conversations: ConversationPreview[];
  total: number;
}

export interface DeleteConversationResponse {
  success: boolean;
  message: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  error: ApiError;
}

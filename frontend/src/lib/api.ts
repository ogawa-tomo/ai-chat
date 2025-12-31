import type {
  SendMessageRequest,
  CreateConversationRequest,
  UpdateConversationRequest,
  ConversationResponse,
  ConversationDetailResponse,
  ConversationListResponse,
  DeleteConversationResponse,
  ApiErrorResponse,
} from "./types";

// API base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Generic fetch wrapper with error handling
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      // Try to parse error response
      try {
        const errorData: ApiErrorResponse = await response.json();
        throw new ApiError(
          errorData.error.code,
          errorData.error.message,
          errorData.error.details
        );
      } catch (e) {
        // If error response is not JSON, throw generic error
        if (e instanceof ApiError) throw e;
        throw new ApiError(
          "FETCH_ERROR",
          `HTTP error! status: ${response.status}`
        );
      }
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;

    // Network error or other fetch error
    console.error("Fetch error:", error);
    throw new ApiError(
      "NETWORK_ERROR",
      error instanceof Error ? error.message : "Network error occurred"
    );
  }
}

// Chat API functions

/**
 * Send a message and receive streaming response
 * This returns a ReadableStream for Server-Sent Events
 */
export async function sendMessage(
  request: SendMessageRequest
): Promise<ReadableStream<Uint8Array>> {
  const url = `${API_BASE_URL}/api/chat/message`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      try {
        const errorData: ApiErrorResponse = await response.json();
        throw new ApiError(
          errorData.error.code,
          errorData.error.message,
          errorData.error.details
        );
      } catch (e) {
        if (e instanceof ApiError) throw e;
        throw new ApiError(
          "FETCH_ERROR",
          `HTTP error! status: ${response.status}`
        );
      }
    }

    if (!response.body) {
      throw new ApiError("STREAM_ERROR", "Response body is null");
    }

    return response.body;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    console.error("Send message error:", error);
    throw new ApiError(
      "NETWORK_ERROR",
      error instanceof Error ? error.message : "Network error occurred"
    );
  }
}

/**
 * Create a new conversation
 */
export async function createConversation(
  request: CreateConversationRequest = {}
): Promise<ConversationResponse> {
  return fetchApi<ConversationResponse>("/api/chat/conversations", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

// Conversation API functions

/**
 * Get list of conversations
 */
export async function getConversations(
  limit = 50,
  offset = 0
): Promise<ConversationListResponse> {
  return fetchApi<ConversationListResponse>(
    `/api/conversations?limit=${limit}&offset=${offset}`
  );
}

/**
 * Get conversation detail with all messages
 */
export async function getConversation(
  id: string
): Promise<ConversationDetailResponse> {
  return fetchApi<ConversationDetailResponse>(`/api/conversations/${id}`);
}

/**
 * Update conversation title
 */
export async function updateConversation(
  id: string,
  request: UpdateConversationRequest
): Promise<ConversationResponse> {
  return fetchApi<ConversationResponse>(`/api/conversations/${id}`, {
    method: "PATCH",
    body: JSON.stringify(request),
  });
}

/**
 * Delete a conversation
 */
export async function deleteConversation(
  id: string
): Promise<DeleteConversationResponse> {
  return fetchApi<DeleteConversationResponse>(`/api/conversations/${id}`, {
    method: "DELETE",
  });
}

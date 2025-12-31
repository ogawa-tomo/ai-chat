"use client";

import { useState, useCallback, useRef } from "react";
import { sendMessage, createConversation, ApiError } from "@/lib/api";
import type { Message } from "@/lib/types";

const DEFAULT_MODEL = "claude-3-5-sonnet-20241022";

interface UseChatOptions {
  conversationId?: string | null;
  initialMessages?: Message[];
}

interface UseChatReturn {
  messages: Message[];
  conversationId: string | null;
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  sendUserMessage: (content: string) => Promise<void>;
  clearError: () => void;
  startNewConversation: () => void;
}

/**
 * Custom hook for managing chat functionality
 * Handles message sending, streaming responses, and conversation state
 */
export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { conversationId: initialConversationId = null, initialMessages = [] } = options;

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use ref to track the current streaming message
  const streamingMessageRef = useRef<string>("");

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Start a new conversation
   */
  const startNewConversation = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setError(null);
    streamingMessageRef.current = "";
  }, []);

  /**
   * Process streaming response from the API
   */
  const processStream = useCallback(
    async (stream: ReadableStream<Uint8Array>, userMessageId: string) => {
      const reader = stream.getReader();
      const decoder = new TextDecoder();

      // Create temporary assistant message
      const assistantMessage: Message = {
        id: `temp-${Date.now()}`,
        role: "ASSISTANT",
        content: "",
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      streamingMessageRef.current = "";

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);

              if (data === "[DONE]") {
                setIsStreaming(false);
                return;
              }

              try {
                const parsed = JSON.parse(data);

                if (parsed.type === "content") {
                  // Append content to streaming message
                  streamingMessageRef.current += parsed.content;

                  // Update the assistant message
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage && lastMessage.role === "ASSISTANT") {
                      lastMessage.content = streamingMessageRef.current;
                    }
                    return newMessages;
                  });
                } else if (parsed.type === "message_id") {
                  // Update message ID with real ID from server
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage && lastMessage.role === "ASSISTANT") {
                      lastMessage.id = parsed.messageId;
                    }
                    return newMessages;
                  });
                } else if (parsed.type === "conversation_id") {
                  // Set conversation ID if this is a new conversation
                  setConversationId(parsed.conversationId);
                } else if (parsed.type === "error") {
                  throw new Error(parsed.message || "Streaming error occurred");
                }
              } catch (e) {
                if (e instanceof Error && e.message !== data) {
                  console.error("Error parsing stream data:", e);
                  throw e;
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Stream processing error:", err);
        throw err;
      } finally {
        reader.releaseLock();
        setIsStreaming(false);
        streamingMessageRef.current = "";
      }
    },
    []
  );

  /**
   * Send a user message and receive streaming response
   */
  const sendUserMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) {
        return;
      }

      setIsLoading(true);
      setError(null);

      // Create user message
      const userMessage: Message = {
        id: `temp-user-${Date.now()}`,
        role: "USER",
        content: content.trim(),
        createdAt: new Date().toISOString(),
      };

      // Add user message to messages
      setMessages((prev) => [...prev, userMessage]);

      try {
        setIsStreaming(true);

        // Send message to API
        const stream = await sendMessage({
          conversationId,
          message: content.trim(),
          model: DEFAULT_MODEL,
        });

        // Process streaming response
        await processStream(stream, userMessage.id);
      } catch (err) {
        console.error("Error sending message:", err);

        if (err instanceof ApiError) {
          setError(`API Error: ${err.message}`);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }

        // Remove the user message if there was an error
        setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
        setIsStreaming(false);
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId, processStream]
  );

  return {
    messages,
    conversationId,
    isLoading,
    isStreaming,
    error,
    sendUserMessage,
    clearError,
    startNewConversation,
  };
}

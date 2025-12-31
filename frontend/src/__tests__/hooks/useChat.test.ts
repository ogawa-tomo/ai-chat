import { renderHook, act, waitFor } from "@testing-library/react";
import { useChat } from "@/hooks/useChat";
import { sendMessage, ApiError } from "@/lib/api";

// Mock the API module
jest.mock("@/lib/api", () => ({
  sendMessage: jest.fn(),
  ApiError: class ApiError extends Error {
    constructor(public code: string, message: string) {
      super(message);
      this.name = "ApiError";
    }
  },
}));

const mockSendMessage = sendMessage as jest.MockedFunction<typeof sendMessage>;

describe("useChat", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("initializes with empty messages and no conversation", () => {
    const { result } = renderHook(() => useChat());

    expect(result.current.messages).toEqual([]);
    expect(result.current.conversationId).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("initializes with provided options", () => {
    const initialMessages = [
      {
        id: "1",
        role: "USER" as const,
        content: "Hello",
        createdAt: new Date().toISOString(),
      },
    ];
    const conversationId = "conv-123";

    const { result } = renderHook(() =>
      useChat({
        conversationId,
        initialMessages,
      })
    );

    expect(result.current.messages).toEqual(initialMessages);
    expect(result.current.conversationId).toBe(conversationId);
  });

  it("clears error when clearError is called", () => {
    const { result } = renderHook(() => useChat());

    // Manually set error state by sending empty message (which should be rejected)
    act(() => {
      result.current.sendUserMessage("");
    });

    // Clear error
    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it("starts new conversation when startNewConversation is called", () => {
    const initialMessages = [
      {
        id: "1",
        role: "USER" as const,
        content: "Hello",
        createdAt: new Date().toISOString(),
      },
    ];

    const { result } = renderHook(() =>
      useChat({
        conversationId: "conv-123",
        initialMessages,
      })
    );

    // Start new conversation
    act(() => {
      result.current.startNewConversation();
    });

    expect(result.current.messages).toEqual([]);
    expect(result.current.conversationId).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("does not send empty or whitespace-only messages", async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendUserMessage("");
    });

    expect(mockSendMessage).not.toHaveBeenCalled();
    expect(result.current.messages).toEqual([]);

    await act(async () => {
      await result.current.sendUserMessage("   ");
    });

    expect(mockSendMessage).not.toHaveBeenCalled();
    expect(result.current.messages).toEqual([]);
  });

  it("adds user message when sending", async () => {
    // Mock a stream that completes immediately
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode('data: {"type":"content","content":"Hi"}\n\n')
        );
        controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    mockSendMessage.mockResolvedValue(mockStream);

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendUserMessage("Hello");
    });

    // Wait for the message to be added
    await waitFor(() => {
      expect(result.current.messages.length).toBeGreaterThan(0);
    });

    // Check that user message was added
    const userMessage = result.current.messages.find((m) => m.role === "USER");
    expect(userMessage).toBeDefined();
    expect(userMessage?.content).toBe("Hello");
  });

  it("sets loading state while sending message", async () => {
    // Mock a stream that takes some time
    const mockStream = new ReadableStream({
      start(controller) {
        setTimeout(() => {
          controller.enqueue(
            new TextEncoder().encode('data: {"type":"content","content":"Hi"}\n\n')
          );
          controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
          controller.close();
        }, 100);
      },
    });

    mockSendMessage.mockResolvedValue(mockStream);

    const { result } = renderHook(() => useChat());

    // Start sending
    act(() => {
      result.current.sendUserMessage("Hello");
    });

    // Should be loading immediately
    expect(result.current.isLoading).toBe(true);

    // Wait for completion
    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 3000 }
    );
  });

  it("handles API errors correctly", async () => {
    const error = new ApiError("NETWORK_ERROR", "Network error occurred");
    mockSendMessage.mockRejectedValue(error);

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendUserMessage("Hello");
    });

    await waitFor(() => {
      expect(result.current.error).toBe("API Error: Network error occurred");
    });

    // User message should be removed on error
    expect(result.current.messages).toEqual([]);
  });

  it("handles generic errors correctly", async () => {
    const error = new Error("Something went wrong");
    mockSendMessage.mockRejectedValue(error);

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendUserMessage("Hello");
    });

    await waitFor(() => {
      expect(result.current.error).toBe("Something went wrong");
    });
  });

  it("trims whitespace from messages before sending", async () => {
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode('data: {"type":"content","content":"Hi"}\n\n')
        );
        controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    mockSendMessage.mockResolvedValue(mockStream);

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendUserMessage("  Hello  ");
    });

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Hello",
        })
      );
    });
  });
});

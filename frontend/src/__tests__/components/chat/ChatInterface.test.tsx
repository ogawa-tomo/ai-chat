import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChatInterface from "@/components/chat/ChatInterface";

// Mock the useChat hook
jest.mock("@/hooks/useChat", () => ({
  useChat: jest.fn(),
}));

// Mock Next.js Link component
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

import { useChat } from "@/hooks/useChat";

const mockUseChat = useChat as jest.MockedFunction<typeof useChat>;

describe("ChatInterface", () => {
  const mockSendUserMessage = jest.fn();
  const mockClearError = jest.fn();
  const mockStartNewConversation = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementation
    mockUseChat.mockReturnValue({
      messages: [],
      conversationId: null,
      isLoading: false,
      isStreaming: false,
      error: null,
      sendUserMessage: mockSendUserMessage,
      clearError: mockClearError,
      startNewConversation: mockStartNewConversation,
    });
  });

  it("renders the chat interface with header", () => {
    render(<ChatInterface />);

    expect(screen.getByText("AI Chat Bot")).toBeInTheDocument();
    expect(screen.getByText("History")).toBeInTheDocument();
    expect(screen.getByText("New Chat")).toBeInTheDocument();
  });

  it("displays conversation ID when available", () => {
    mockUseChat.mockReturnValue({
      messages: [],
      conversationId: "conv-123456789",
      isLoading: false,
      isStreaming: false,
      error: null,
      sendUserMessage: mockSendUserMessage,
      clearError: mockClearError,
      startNewConversation: mockStartNewConversation,
    });

    render(<ChatInterface />);

    // Check for parts of the conversation ID separately due to text splitting
    expect(screen.getByText(/ID:/)).toBeInTheDocument();
    expect(screen.getByText(/conv-123/)).toBeInTheDocument();
  });

  it("displays error message when error exists", () => {
    mockUseChat.mockReturnValue({
      messages: [],
      conversationId: null,
      isLoading: false,
      isStreaming: false,
      error: "Failed to send message",
      sendUserMessage: mockSendUserMessage,
      clearError: mockClearError,
      startNewConversation: mockStartNewConversation,
    });

    render(<ChatInterface />);

    expect(screen.getByText("Failed to send message")).toBeInTheDocument();
  });

  it("calls clearError when error is dismissed", async () => {
    const user = userEvent.setup();

    mockUseChat.mockReturnValue({
      messages: [],
      conversationId: null,
      isLoading: false,
      isStreaming: false,
      error: "Test error",
      sendUserMessage: mockSendUserMessage,
      clearError: mockClearError,
      startNewConversation: mockStartNewConversation,
    });

    render(<ChatInterface />);

    const dismissButton = screen.getByLabelText("Dismiss error");
    await user.click(dismissButton);

    expect(mockClearError).toHaveBeenCalledTimes(1);
  });

  it("calls startNewConversation when New Chat button is clicked", async () => {
    const user = userEvent.setup();

    render(<ChatInterface />);

    const newChatButton = screen.getByText("New Chat");
    await user.click(newChatButton);

    expect(mockStartNewConversation).toHaveBeenCalledTimes(1);
  });

  it("disables New Chat button when loading or streaming", () => {
    mockUseChat.mockReturnValue({
      messages: [],
      conversationId: null,
      isLoading: true,
      isStreaming: false,
      error: null,
      sendUserMessage: mockSendUserMessage,
      clearError: mockClearError,
      startNewConversation: mockStartNewConversation,
    });

    render(<ChatInterface />);

    const newChatButton = screen.getByText("New Chat");
    expect(newChatButton).toBeDisabled();
  });

  it("sends message when user submits input", async () => {
    const user = userEvent.setup();

    render(<ChatInterface />);

    const input = screen.getByPlaceholderText(/Type your message/);
    const sendButton = screen.getByText("Send");

    await user.type(input, "Hello, AI!");
    await user.click(sendButton);

    expect(mockSendUserMessage).toHaveBeenCalledWith("Hello, AI!");
  });

  it("disables input when loading or streaming", () => {
    mockUseChat.mockReturnValue({
      messages: [],
      conversationId: null,
      isLoading: false,
      isStreaming: true,
      error: null,
      sendUserMessage: mockSendUserMessage,
      clearError: mockClearError,
      startNewConversation: mockStartNewConversation,
    });

    render(<ChatInterface />);

    const input = screen.getByPlaceholderText(/Type your message/);
    expect(input).toBeDisabled();
  });

  it("displays empty state message when no messages", () => {
    render(<ChatInterface />);

    expect(screen.getByText("No messages yet")).toBeInTheDocument();
  });

  it("displays messages when available", () => {
    mockUseChat.mockReturnValue({
      messages: [
        {
          id: "1",
          role: "USER",
          content: "Test message",
          createdAt: new Date().toISOString(),
        },
      ],
      conversationId: null,
      isLoading: false,
      isStreaming: false,
      error: null,
      sendUserMessage: mockSendUserMessage,
      clearError: mockClearError,
      startNewConversation: mockStartNewConversation,
    });

    render(<ChatInterface />);

    expect(screen.getByText("Test message")).toBeInTheDocument();
  });
});

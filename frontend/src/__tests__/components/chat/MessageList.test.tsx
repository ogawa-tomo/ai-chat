import { render, screen } from "@testing-library/react";
import MessageList from "@/components/chat/MessageList";
import type { Message } from "@/lib/types";

describe("MessageList", () => {
  const mockMessages: Message[] = [
    {
      id: "1",
      role: "USER",
      content: "Hello, AI!",
      createdAt: "2024-01-01T10:00:00Z",
    },
    {
      id: "2",
      role: "ASSISTANT",
      content: "Hello! How can I help you today?",
      createdAt: "2024-01-01T10:00:05Z",
    },
    {
      id: "3",
      role: "USER",
      content: "What is the weather like?",
      createdAt: "2024-01-01T10:01:00Z",
    },
  ];

  it("renders empty state when no messages", () => {
    render(<MessageList messages={[]} />);

    expect(screen.getByText("No messages yet")).toBeInTheDocument();
    expect(
      screen.getByText("Start a conversation by sending a message below")
    ).toBeInTheDocument();
  });

  it("renders all messages correctly", () => {
    render(<MessageList messages={mockMessages} />);

    // Check that all message contents are displayed
    expect(screen.getByText("Hello, AI!")).toBeInTheDocument();
    expect(
      screen.getByText("Hello! How can I help you today?")
    ).toBeInTheDocument();
    expect(screen.getByText("What is the weather like?")).toBeInTheDocument();
  });

  it("displays user messages with correct styling", () => {
    render(<MessageList messages={mockMessages} />);

    const textElement = screen.getByText("Hello, AI!");
    // Navigate up the DOM tree to find the message container
    // p -> div.prose -> div.bg-blue-600
    const messageContainer = textElement.parentElement?.parentElement;
    expect(messageContainer).toHaveClass("bg-blue-600", "text-white");
  });

  it("displays assistant messages with correct styling", () => {
    render(<MessageList messages={mockMessages} />);

    const textElement = screen.getByText("Hello! How can I help you today?");
    // Navigate up the DOM tree to find the message container
    // p -> div.prose -> div.bg-gray-100
    const messageContainer = textElement.parentElement?.parentElement;
    expect(messageContainer).toHaveClass("bg-gray-100", "text-gray-900");
  });

  it("shows AI avatar for assistant messages", () => {
    render(<MessageList messages={mockMessages} />);

    // There should be one AI avatar (for the assistant message)
    const aiAvatars = screen.getAllByText("AI");
    expect(aiAvatars.length).toBe(1);
  });

  it("shows user avatar for user messages", () => {
    render(<MessageList messages={mockMessages} />);

    // There should be two user avatars (for the two user messages)
    const userAvatars = screen.getAllByText("U");
    expect(userAvatars.length).toBe(2);
  });

  it("displays message timestamps", () => {
    render(<MessageList messages={mockMessages} />);

    // Check that timestamps are displayed (we don't check exact format as it depends on locale)
    const timestamps = screen.getAllByText(/\d{1,2}:\d{2}:\d{2}/);
    expect(timestamps.length).toBe(mockMessages.length);
  });

  it("renders messages in correct order", () => {
    render(<MessageList messages={mockMessages} />);

    const messages = screen.getAllByText(/Hello|What/);
    expect(messages[0]).toHaveTextContent("Hello, AI!");
    expect(messages[1]).toHaveTextContent("Hello! How can I help you today?");
    expect(messages[2]).toHaveTextContent("What is the weather like?");
  });
});

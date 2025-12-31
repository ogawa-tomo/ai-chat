"use client";

import { useChat } from "@/hooks/useChat";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function ChatInterface() {
  const {
    messages,
    conversationId,
    isLoading,
    isStreaming,
    error,
    sendUserMessage,
    clearError,
    startNewConversation,
  } = useChat();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              AI Chat Bot
            </Link>
            {conversationId && (
              <span className="text-sm text-gray-500">
                ID: {conversationId.slice(0, 8)}...
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link href="/history">
              <Button variant="secondary" size="sm">
                History
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="sm"
              onClick={startNewConversation}
              disabled={isLoading || isStreaming}
            >
              New Chat
            </Button>
          </div>
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2">
          <div className="max-w-4xl mx-auto">
            <ErrorMessage message={error} onDismiss={clearError} />
          </div>
        </div>
      )}

      {/* Messages */}
      <MessageList messages={messages} isStreaming={isStreaming} />

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <MessageInput
            onSend={sendUserMessage}
            disabled={isLoading || isStreaming}
            placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
          />
        </div>
      </div>
    </div>
  );
}

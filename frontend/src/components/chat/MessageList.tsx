"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@/lib/types";
import StreamingMessage from "./StreamingMessage";

interface MessageListProps {
  messages: Message[];
  isStreaming?: boolean;
}

export default function MessageList({
  messages,
  isStreaming = false,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium mb-2">No messages yet</p>
          <p className="text-sm">Start a conversation by sending a message below</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.map((message) => {
          const isUser = message.role === "USER";
          const isAssistant = message.role === "ASSISTANT";

          return (
            <div
              key={message.id}
              className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {isAssistant && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
                  AI
                </div>
              )}
              <div
                className={`max-w-3xl rounded-lg px-4 py-3 ${
                  isUser
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap m-0">{message.content}</p>
                </div>
                <div
                  className={`mt-2 text-xs ${
                    isUser ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  {new Date(message.createdAt).toLocaleTimeString()}
                </div>
              </div>
              {isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                  U
                </div>
              )}
            </div>
          );
        })}

        {/* Show streaming message if currently streaming */}
        {isStreaming && messages.length > 0 && messages[messages.length - 1].role === "ASSISTANT" && (
          <StreamingMessage content="" />
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

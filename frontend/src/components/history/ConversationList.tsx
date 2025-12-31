"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getConversations, deleteConversation, ApiError } from "@/lib/api";
import type { ConversationPreview } from "@/lib/types";
import Button from "@/components/ui/Button";
import Loading from "@/components/ui/Loading";
import ErrorMessage from "@/components/ui/ErrorMessage";

export default function ConversationList() {
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getConversations();
      setConversations(response.conversations);
    } catch (err) {
      console.error("Error loading conversations:", err);
      if (err instanceof ApiError) {
        setError(`Failed to load conversations: ${err.message}`);
      } else {
        setError("Failed to load conversations");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this conversation?")) {
      return;
    }

    setDeletingId(id);
    setError(null);

    try {
      await deleteConversation(id);
      setConversations((prev) => prev.filter((conv) => conv.id !== id));
    } catch (err) {
      console.error("Error deleting conversation:", err);
      if (err instanceof ApiError) {
        setError(`Failed to delete conversation: ${err.message}`);
      } else {
        setError("Failed to delete conversation");
      }
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Conversation History
            </h1>
            <Link href="/chat">
              <Button variant="primary">New Chat</Button>
            </Link>
          </div>
          <p className="text-gray-600">
            Browse and manage your previous conversations
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <ErrorMessage
            message={error}
            onDismiss={() => setError(null)}
            className="mb-6"
          />
        )}

        {/* Conversations List */}
        {conversations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-4">No conversations yet</p>
            <Link href="/chat">
              <Button variant="primary">Start Your First Chat</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Link href={`/history/${conversation.id}`}>
                      <h2 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors cursor-pointer truncate">
                        {conversation.title || "Untitled Conversation"}
                      </h2>
                    </Link>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {conversation.preview}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{conversation.messageCount} messages</span>
                      <span>•</span>
                      <span>
                        {new Date(conversation.updatedAt).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(conversation.updatedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/history/${conversation.id}`}>
                      <Button variant="secondary" size="sm">
                        View
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(conversation.id)}
                      disabled={deletingId === conversation.id}
                    >
                      {deletingId === conversation.id ? "..." : "Delete"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

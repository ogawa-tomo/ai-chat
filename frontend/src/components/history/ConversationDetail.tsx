"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getConversation,
  updateConversation,
  deleteConversation,
  ApiError,
} from "@/lib/api";
import type { ConversationDetailResponse } from "@/lib/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Loading from "@/components/ui/Loading";
import ErrorMessage from "@/components/ui/ErrorMessage";

interface ConversationDetailProps {
  conversationId: string;
}

export default function ConversationDetail({
  conversationId,
}: ConversationDetailProps) {
  const router = useRouter();
  const [conversation, setConversation] =
    useState<ConversationDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [isSavingTitle, setIsSavingTitle] = useState(false);

  useEffect(() => {
    loadConversation();
  }, [conversationId]);

  const loadConversation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getConversation(conversationId);
      setConversation(data);
      setNewTitle(data.title || "");
    } catch (err) {
      console.error("Error loading conversation:", err);
      if (err instanceof ApiError) {
        setError(`Failed to load conversation: ${err.message}`);
      } else {
        setError("Failed to load conversation");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTitle = async () => {
    if (!newTitle.trim() || !conversation) {
      return;
    }

    setIsSavingTitle(true);
    setError(null);

    try {
      const updated = await updateConversation(conversationId, {
        title: newTitle.trim(),
      });
      setConversation({
        ...conversation,
        title: updated.title,
        updatedAt: updated.updatedAt,
      });
      setIsEditingTitle(false);
    } catch (err) {
      console.error("Error updating title:", err);
      if (err instanceof ApiError) {
        setError(`Failed to update title: ${err.message}`);
      } else {
        setError("Failed to update title");
      }
    } finally {
      setIsSavingTitle(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this conversation?")) {
      return;
    }

    setError(null);

    try {
      await deleteConversation(conversationId);
      router.push("/history");
    } catch (err) {
      console.error("Error deleting conversation:", err);
      if (err instanceof ApiError) {
        setError(`Failed to delete conversation: ${err.message}`);
      } else {
        setError("Failed to delete conversation");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <ErrorMessage message="Conversation not found" />
          <Link href="/history" className="mt-4 inline-block">
            <Button variant="primary">Back to History</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/history">
              <Button variant="secondary" size="sm">
                ← Back
              </Button>
            </Link>
          </div>

          {/* Title */}
          {isEditingTitle ? (
            <div className="flex items-center gap-2 mb-4">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter conversation title"
                className="flex-1"
                autoFocus
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveTitle}
                disabled={isSavingTitle || !newTitle.trim()}
              >
                Save
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsEditingTitle(false);
                  setNewTitle(conversation.title || "");
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">
                {conversation.title || "Untitled Conversation"}
              </h1>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditingTitle(true)}
                >
                  Edit Title
                </Button>
                <Button variant="danger" size="sm" onClick={handleDelete}>
                  Delete
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>
              Created: {new Date(conversation.createdAt).toLocaleString()}
            </span>
            <span>•</span>
            <span>
              Updated: {new Date(conversation.updatedAt).toLocaleString()}
            </span>
            <span>•</span>
            <span>{conversation.messages.length} messages</span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <ErrorMessage
            message={error}
            onDismiss={() => setError(null)}
            className="mb-6"
          />
        )}

        {/* Messages */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-6">
            {conversation.messages.map((message) => {
              const isUser = message.role === "USER";

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold text-sm">
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
                      <p className="whitespace-pre-wrap m-0">
                        {message.content}
                      </p>
                    </div>
                    <div
                      className={`mt-2 text-xs ${
                        isUser ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleString()}
                    </div>
                  </div>
                  {isUser && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                      U
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

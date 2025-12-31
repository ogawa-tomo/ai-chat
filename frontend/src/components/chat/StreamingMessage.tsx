"use client";

import Loading from "@/components/ui/Loading";

interface StreamingMessageProps {
  content: string;
}

export default function StreamingMessage({ content }: StreamingMessageProps) {
  return (
    <div className="flex gap-3 max-w-3xl">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
        AI
      </div>
      <div className="flex-1 bg-gray-100 rounded-lg px-4 py-3">
        {content ? (
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{content}</p>
          </div>
        ) : (
          <Loading size="sm" />
        )}
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
          <div className="flex gap-1">
            <span className="animate-pulse">●</span>
            <span className="animate-pulse delay-100">●</span>
            <span className="animate-pulse delay-200">●</span>
          </div>
          <span>AI is typing...</span>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <main className="flex flex-col items-center gap-8 px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            AI Chat Bot
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Chat with Claude AI and save your conversation history
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Link
            href="/chat"
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold text-center hover:bg-blue-700 transition-colors"
          >
            Start Chatting
          </Link>
          <Link
            href="/history"
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg font-semibold text-center hover:bg-gray-300 transition-colors"
          >
            View History
          </Link>
        </div>
      </main>
    </div>
  );
}

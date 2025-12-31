import ConversationDetail from "@/components/history/ConversationDetail";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ConversationDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ConversationDetail conversationId={id} />;
}

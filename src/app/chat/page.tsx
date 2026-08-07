import { MessageSquare } from "lucide-react";

export default function ChatEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
      <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
      <h2 className="text-2xl font-semibold text-foreground mb-2">Your Messages</h2>
      <p className="text-center max-w-md">
        Select a conversation from the sidebar or visit a user&apos;s profile to start a new chat.
      </p>
    </div>
  );
}

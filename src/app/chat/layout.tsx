import { ReactNode } from "react";
import ChatSidebar from "./components/ChatSidebar";

export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] overflow-hidden">
      <div className="w-80 border-r border-border bg-card hidden md:block">
        <ChatSidebar />
      </div>
      <div className="flex-1 bg-background relative overflow-hidden">
        {children}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { ConversationList } from "@/modules/dashboard/ui/conversation-list";
import { ConversationView } from "@/modules/dashboard/ui/conversation-view";
import { StatsCards } from "@/modules/dashboard/ui/stats-cards";
import { MessageSquare, ArrowLeft } from "lucide-react";

export default function ConversationsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] w-full overflow-hidden">
      <StatsCards />
      <div className="flex flex-1 overflow-hidden">
        <ConversationList onSelect={setSelectedId} selectedId={selectedId} />

        {selectedId ? (
          <ConversationView conversationId={selectedId} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8 bg-transparent">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shadow-sm">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <div className="max-w-xs">
              <h3 className="font-semibold text-base text-foreground">No conversation selected</h3>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                Pick a conversation from the inbox to view the full message thread and reply.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground/60 mt-2">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Select from the inbox on the left</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

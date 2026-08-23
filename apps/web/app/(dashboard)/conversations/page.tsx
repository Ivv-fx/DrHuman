"use client";

import { useState } from "react";
import { ConversationList } from "@/modules/dashboard/ui/conversation-list";
import { ConversationView } from "@/modules/dashboard/ui/conversation-view";

export default function ConversationsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden">
      <ConversationList onSelect={setSelectedId} selectedId={selectedId} />
      
      {selectedId ? (
        <ConversationView conversationId={selectedId} />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/5">
          <p>Select a conversation from the list to view details.</p>
        </div>
      )}
    </div>
  );
}

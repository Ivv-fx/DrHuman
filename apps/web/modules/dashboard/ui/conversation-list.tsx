"use client";

import { useOrganization } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare } from "lucide-react";

interface ConversationListProps {
  onSelect: (id: string) => void;
  selectedId: string | null;
}

export function ConversationList({ onSelect, selectedId }: ConversationListProps) {
  const { organization } = useOrganization();
  const conversations = useQuery(
    api.private.conversations.getMany,
    organization?.id ? { organizationID: organization.id } : "skip"
  );

  return (
    <div className="w-80 border-r h-[calc(100vh-4rem)] overflow-y-auto bg-muted/10">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Inbox</h2>
      </div>
      <div className="flex flex-col">
        {conversations?.map((conv) => (
          <button
            key={conv._id}
            onClick={() => onSelect(conv._id)}
            className={`flex items-start gap-3 p-4 text-left border-b hover:bg-accent transition-colors ${
              selectedId === conv._id ? "bg-accent" : ""
            }`}
          >
            <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="flex justify-between items-baseline mb-1">
                <span className="font-medium truncate text-sm">Visitor</span>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                  {formatDistanceToNow(conv._creationTime, { addSuffix: true })}
                </span>
              </div>
              <div className="text-xs text-muted-foreground truncate">
                Status: <span className="capitalize">{conv.status}</span>
              </div>
            </div>
          </button>
        ))}
        {conversations?.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No conversations yet.
          </div>
        )}
      </div>
    </div>
  );
}

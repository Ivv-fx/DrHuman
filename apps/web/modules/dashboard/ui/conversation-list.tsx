"use client";

import { useOrganization } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Inbox, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConversationListProps {
  onSelect: (id: string) => void;
  selectedId: string | null;
}

const statusColors: Record<string, string> = {
  unresolved: "text-amber-500",
  resolved: "text-emerald-500",
  escalated: "text-rose-500",
};

const statusDot: Record<string, string> = {
  unresolved: "bg-amber-400",
  resolved: "bg-emerald-400",
  escalated: "bg-rose-400",
};

export function ConversationList({ onSelect, selectedId }: ConversationListProps) {
  const { organization } = useOrganization();
  const conversations = useQuery(
    api.private.conversations.getMany,
    organization?.id ? { organizationID: organization.id } : "skip"
  );

  const unresolvedCount = conversations?.filter((c) => c.status === "unresolved").length ?? 0;

  return (
    <div className="w-80 border-r border-border/60 h-[calc(100vh-3.5rem)] overflow-hidden flex flex-col bg-transparent">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/60 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Inbox className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-semibold text-sm">Inbox</h2>
          </div>
          {unresolvedCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
              {unresolvedCount}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {conversations?.length ?? 0} total conversations
        </p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {conversations?.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">No conversations yet</p>
              <p className="text-xs text-muted-foreground mt-1">They'll appear here when visitors start chatting.</p>
            </div>
          </div>
        )}

        {conversations?.map((conv) => {
          const isSelected = selectedId === conv._id;
          const statusKey = conv.status ?? "unresolved";
          return (
            <button
              key={conv._id}
              onClick={() => onSelect(conv._id)}
              className={cn(
                "w-full flex items-start gap-3 px-4 py-3.5 text-left border-b border-border/40 transition-all duration-100 group",
                isSelected
                  ? "bg-primary/8 border-l-2 border-l-primary"
                  : "hover:bg-muted/50 border-l-2 border-l-transparent"
              )}
            >
              {/* Avatar */}
              <div className={cn(
                "mt-0.5 shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors",
                isSelected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
              )}>
                <MessageSquare className="w-4 h-4" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline gap-1 mb-0.5">
                  <span className="font-semibold text-sm text-foreground truncate">Visitor</span>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                    {formatDistanceToNow(conv._creationTime, { addSuffix: true })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", statusDot[statusKey])} />
                  <span className={cn("text-xs font-medium capitalize", statusColors[statusKey])}>
                    {statusKey}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

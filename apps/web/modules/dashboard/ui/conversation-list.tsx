"use client";

import { useOrganization } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Inbox, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ConversationListSkeleton } from "./conversation-list-skeleton";

interface ConversationListProps {
  onSelect: (id: string) => void;
  selectedId: string | null;
}

type FilterStatus = "all" | "unresolved" | "pending" | "resolved";

const statusColors: Record<string, string> = {
  unresolved: "text-rose-500",
  pending: "text-amber-500",
  escalated: "text-amber-500",
  resolved: "text-emerald-500",
};

const statusDot: Record<string, string> = {
  unresolved: "bg-rose-400",
  pending: "bg-amber-400",
  escalated: "bg-amber-400",
  resolved: "bg-emerald-400",
};

const statusLabel: Record<string, string> = {
  unresolved: "Unresolved",
  pending: "Pending",
  escalated: "Pending",
  resolved: "Resolved",
};

const FILTER_TABS: { label: string; value: FilterStatus }[] = [
  { label: "All", value: "all" },
  { label: "Unresolved", value: "unresolved" },
  { label: "Pending", value: "pending" },
  { label: "Resolved", value: "resolved" },
];

export function ConversationList({ onSelect, selectedId }: ConversationListProps) {
  const { organization } = useOrganization();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");

  const conversations = useQuery(
    api.private.conversations.getMany,
    organization?.id ? { organizationID: organization.id } : "skip"
  );
  const markAsRead = useMutation(api.private.conversations.markAsRead);

  const unresolvedCount = conversations?.filter((c) => c.status === "unresolved").length ?? 0;

  const handleSelect = (id: string) => {
    onSelect(id);
    markAsRead({ conversationID: id as any }).catch(console.error);
  };

  const filtered = conversations?.filter((conv) => {
    const matchesFilter =
      filter === "all" ||
      conv.status === filter ||
      (filter === "pending" && conv.status === "escalated");
    const matchesSearch = search.trim() === "" || conv._id.includes(search.trim());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="w-80 border-r border-border/60 h-[calc(100vh-3.5rem)] overflow-hidden flex flex-col bg-transparent">
      <div className="px-5 py-4 border-b border-border/60 shrink-0 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Inbox className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-semibold text-sm">Inbox</h2>
          </div>
          {unresolvedCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
              {unresolvedCount}
            </span>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-muted/50 border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary/40 placeholder:text-muted-foreground/60"
          />
        </div>

        <div className="flex gap-1 overflow-x-auto">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={cn(
                "shrink-0 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors",
                filter === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          {conversations === undefined ? "Loading..." : `${filtered?.length ?? 0} conversations`}
        </p>
      </div>

      {conversations === undefined ? (
        <ConversationListSkeleton />
      ) : (
        <div className="flex-1 overflow-y-auto">
          {filtered?.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {search ? "No results found" : "No conversations yet"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {search ? "Try a different search term." : "They will appear here when visitors start chatting."}
                </p>
              </div>
            </div>
          )}

          {filtered?.map((conv) => {
            const isSelected = selectedId === conv._id;
            const statusKey = conv.status ?? "unresolved";
            const hasUnread = (conv.unreadCount ?? 0) > 0;
            return (
              <button
                key={conv._id}
                onClick={() => handleSelect(conv._id)}
                className={cn(
                  "w-full flex items-start gap-3 px-4 py-3.5 text-left border-b border-border/40 transition-all duration-100 group",
                  isSelected
                    ? "bg-primary/8 border-l-2 border-l-primary"
                    : "hover:bg-muted/50 border-l-2 border-l-transparent"
                )}
              >
                <div className={cn(
                  "mt-0.5 shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors",
                  isSelected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                )}>
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline gap-1 mb-0.5">
                    <span className={cn("text-sm text-foreground truncate", hasUnread ? "font-bold" : "font-semibold")}>
                      Visitor
                    </span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                      {formatDistanceToNow(conv._creationTime, { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", statusDot[statusKey])} />
                      <span className={cn("text-xs font-medium", statusColors[statusKey])}>
                        {statusLabel[statusKey] ?? statusKey}
                      </span>
                    </div>
                    {hasUnread && (
                      <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

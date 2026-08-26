"use client";

import { useQuery } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { User, Mail, Globe, Clock, MessageSquare, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface VisitorInfoPanelProps {
  conversationId: string;
  onClose: () => void;
}

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

export function VisitorInfoPanel({ conversationId, onClose }: VisitorInfoPanelProps) {
  const conversation = useQuery(api.private.conversations.getOne, {
    conversationID: conversationId as any,
  });

  const session = useQuery(
    api.contact_sessions.getOne,
    conversation?.contactSessionID
      ? { sessionID: conversation.contactSessionID }
      : "skip"
  );

  const pastConversations = useQuery(
    api.conversations.getMany,
    conversation?.contactSessionID
      ? { contactSessionID: conversation.contactSessionID }
      : "skip"
  );

  const browserInfo = session?.browserInfo as Record<string, string> | undefined;

  return (
    <div className="w-72 shrink-0 border-l border-border/60 h-full flex flex-col bg-background overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-border/60 flex items-center justify-between shrink-0">
        <span className="font-semibold text-sm">Visitor Info</span>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-md hover:bg-muted flex items-center justify-center transition-colors"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Visitor Details */}
      <div className="p-4 space-y-4">
        {/* Avatar + Name */}
        <div className="flex flex-col items-center gap-2 py-2">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div className="text-center">
            <div className="font-semibold text-sm">
              {session?.name ?? (
                <span className="inline-block w-24 h-4 bg-muted animate-pulse rounded" />
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {session?.email ?? ""}
            </div>
          </div>
        </div>

        {/* Info rows */}
        <div className="space-y-2.5 rounded-xl border border-border/60 p-3 bg-muted/30">
          {session?.email && (
            <InfoRow icon={Mail} label="Email" value={session.email} />
          )}
          {browserInfo?.timezone && (
            <InfoRow icon={Globe} label="Timezone" value={browserInfo.timezone} />
          )}
          {browserInfo?.userAgent && (
            <InfoRow
              icon={Globe}
              label="Browser"
              value={browserInfo.userAgent.split(" ").slice(-1)[0] ?? "Unknown"}
            />
          )}
          {session && (
            <InfoRow
              icon={Clock}
              label="Started"
              value={formatDistanceToNow(session._creationTime, { addSuffix: true })}
            />
          )}
        </div>

        {/* Past Conversations */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
            Past Conversations
          </p>
          <div className="space-y-1.5">
            {pastConversations === undefined && (
              <div className="space-y-1.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-9 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            )}
            {pastConversations?.map((conv) => {
              const isActive = conv._id === conversationId;
              const statusKey = conv.status ?? "unresolved";
              return (
                <div
                  key={conv._id}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg border text-xs",
                    isActive
                      ? "bg-primary/8 border-primary/20"
                      : "bg-muted/40 border-border/40"
                  )}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="flex-1 text-muted-foreground truncate">
                    {formatDistanceToNow(conv._creationTime, { addSuffix: true })}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className={cn("w-1.5 h-1.5 rounded-full", statusDot[statusKey])} />
                    <span className={cn("font-medium capitalize", statusColors[statusKey])}>
                      {statusKey === "escalated" ? "Pending" : statusKey}
                    </span>
                  </div>
                </div>
              );
            })}
            {pastConversations?.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">No past conversations</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <div className="text-[10px] text-muted-foreground font-medium">{label}</div>
        <div className="text-xs font-medium text-foreground truncate">{value}</div>
      </div>
    </div>
  );
}

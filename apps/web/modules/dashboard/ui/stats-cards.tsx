"use client";

import { useOrganization } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { AlertCircle, Clock, CheckCircle2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const CARDS = [
  {
    key: "unresolvedConversations" as const,
    label: "Unresolved",
    icon: AlertCircle,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    border: "border-rose-200/60 dark:border-rose-800/40",
  },
  {
    key: "pendingConversations" as const,
    label: "Pending",
    icon: Clock,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-200/60 dark:border-amber-800/40",
  },
  {
    key: "resolvedConversations" as const,
    label: "Resolved",
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-200/60 dark:border-emerald-800/40",
  },
  {
    key: "totalConversations" as const,
    label: "Total",
    icon: MessageSquare,
    color: "text-primary",
    bg: "bg-primary/5",
    border: "border-primary/20",
  },
];

export function StatsCards() {
  const { organization } = useOrganization();
  const metrics = useQuery(
    api.private.analytics.getDashboardMetrics,
    organization?.id ? { organizationID: organization.id } : "skip"
  );

  return (
    <div className="grid grid-cols-4 gap-3 px-5 py-4 border-b border-border/60 shrink-0">
      {CARDS.map((card) => {
        const Icon = card.icon;
        const value = metrics ? metrics[card.key] : null;
        return (
          <div
            key={card.key}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200",
              card.bg,
              card.border
            )}
          >
            <div className="p-2 rounded-lg bg-white/60 dark:bg-black/20 shadow-sm">
              <Icon className={cn("w-4 h-4", card.color)} />
            </div>
            <div>
              <div className={cn("text-2xl font-bold leading-none tabular-nums", card.color)}>
                {value === null ? (
                  <span className="inline-block w-8 h-5 bg-muted animate-pulse rounded" />
                ) : (
                  value
                )}
              </div>
              <div className="text-[11px] text-muted-foreground font-medium mt-0.5">
                {card.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

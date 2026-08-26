"use client";

import { useRef, useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, CheckCircle2, Loader2, ChevronDown, SlidersHorizontal } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { VoiceAgentButton } from "@/components/voice-agent-button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { VisitorInfoPanel } from "./visitor-info-panel";

type ConversationStatus = "unresolved" | "pending" | "resolved";

const STATUS_CONFIG: Record<ConversationStatus, { label: string; dot: string; pill: string; next: ConversationStatus }> = {
  unresolved: {
    label: "Unresolved",
    dot: "bg-rose-500",
    pill: "bg-rose-50 text-rose-600 border-rose-200/60 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40",
    next: "pending",
  },
  pending: {
    label: "Pending",
    dot: "bg-amber-500",
    pill: "bg-amber-50 text-amber-600 border-amber-200/60 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40",
    next: "resolved",
  },
  resolved: {
    label: "Resolved",
    dot: "bg-emerald-500",
    pill: "bg-emerald-50 text-emerald-600 border-emerald-200/60 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40",
    next: "unresolved",
  },
};

interface ConversationViewProps {
  conversationId: string;
}

const roleConfig = {
  user: {
    label: "Visitor",
    icon: User,
    bubble: "bg-muted text-foreground",
    align: "items-start",
    avatarBg: "bg-muted-foreground/15 text-muted-foreground",
  },
  assistant: {
    label: "AI Agent",
    icon: Bot,
    bubble: "bg-primary text-primary-foreground",
    align: "items-end",
    avatarBg: "bg-primary/15 text-primary",
  },
  system: {
    label: "System",
    icon: CheckCircle2,
    bubble: "bg-muted/60 text-muted-foreground border border-border/60 italic",
    align: "items-center",
    avatarBg: "bg-muted text-muted-foreground",
  },
};

export function ConversationView({ conversationId }: ConversationViewProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messages = useQuery(api.messages.getMany, { conversationID: conversationId as any });
  const conversation = useQuery(api.private.conversations.getOne, { conversationID: conversationId as any });
  const createMessage = useMutation(api.messages.create);
  const updateStatus = useMutation(api.private.conversations.updateStatus);
  const markAsRead = useMutation(api.private.conversations.markAsRead);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showPanel, setShowPanel] = useState(false);

  // Mark as read when opening the conversation
  useEffect(() => {
    markAsRead({ conversationID: conversationId as any }).catch(console.error);
  }, [conversationId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleStatusCycle = () => {
    const current = (conversation?.status ?? "unresolved") as ConversationStatus;
    const safeStatus = current in STATUS_CONFIG ? current : "unresolved";
    const next = STATUS_CONFIG[safeStatus].next;
    
    updateStatus({ conversationID: conversationId as any, status: next })
      .then(() => toast.success(`Status changed to ${STATUS_CONFIG[next].label}`))
      .catch((error) => {
        console.error(error);
        toast.error("Failed to change status");
      });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      await createMessage({
        conversationID: conversationId as any,
        content: message.trim(),
        role: "assistant",
      });
      setMessage("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as any);
    }
  };

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      <div className="flex flex-col flex-1 bg-background h-full overflow-hidden min-w-0">
        {/* Header */}
        <div className="shrink-0 px-6 py-3.5 border-b border-border/60 bg-background flex items-center justify-between">
          <div className="min-w-0">
            <h3 className="font-semibold text-sm truncate">Conversation</h3>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {messages === undefined
                ? "Loading..."
                : `${messages.length} message${messages.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Status pill — click to cycle through statuses */}
            {conversation && (() => {
              const statusKey = (conversation.status in STATUS_CONFIG ? conversation.status : "unresolved") as ConversationStatus;
              const cfg = STATUS_CONFIG[statusKey];
              return (
                <button
                  onClick={handleStatusCycle}
                  title="Click to change status"
                  className={cn(
                    "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-colors",
                    cfg.pill
                  )}
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
                  {cfg.label}
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>
              );
            })()}

            <div className="w-px h-4 bg-border/60 mx-1" />
            
            <button
              onClick={() => setShowPanel(!showPanel)}
              title="Toggle visitor info"
              className={cn(
                "w-8 h-8 rounded-md flex items-center justify-center transition-colors",
                showPanel ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
          {messages === undefined && (
            <div className="space-y-6 flex-1 flex flex-col justify-end pb-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={cn("flex gap-3", i % 2 !== 0 ? "justify-end" : "justify-start")}>
                  {i % 2 === 0 && <div className="w-8 h-8 rounded-full bg-muted animate-pulse shrink-0" />}
                  <div className={cn("h-16 rounded-2xl bg-muted animate-pulse", i % 2 !== 0 ? "w-[250px]" : "w-[300px]")} />
                </div>
              ))}
            </div>
          )}

          {messages?.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Bot className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">No messages yet</p>
                <p className="text-xs text-muted-foreground mt-1">Messages from this conversation will appear here.</p>
              </div>
            </div>
          )}

          {messages?.map((msg) => {
            const role = (msg.role ?? "user") as keyof typeof roleConfig;
            const config = roleConfig[role] ?? roleConfig.user;
            const Icon = config.icon;
            const isRight = role === "assistant";

            return (
              <div
                key={msg._id}
                className={cn("flex gap-2.5 w-full", isRight ? "flex-row-reverse" : "flex-row")}
              >
                {/* Avatar */}
                <div className={cn(
                  "shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5",
                  config.avatarBg
                )}>
                  <Icon className="w-3.5 h-3.5" />
                </div>

                {/* Bubble */}
                <div className={cn("flex flex-col gap-1 max-w-[72%]", isRight ? "items-end" : "items-start")}>
                  <span className="text-[10px] text-muted-foreground font-medium px-1">
                    {config.label}
                  </span>
                  <div
                    className={cn(
                      "px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed",
                      config.bubble,
                      isRight ? "rounded-tr-sm" : "rounded-tl-sm"
                    )}
                  >
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        a: ({ href, children }) => (
                          <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:opacity-80 transition-opacity">
                            {children}
                          </a>
                        ),
                        code: ({ children }) => (
                          <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-[11px] font-mono">
                            {children}
                          </code>
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                  <span className="text-[9px] text-muted-foreground/60 px-1">
                    {formatDistanceToNow(msg._creationTime, { addSuffix: true })}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} className="h-px shrink-0" />
        </div>

        {/* Composer */}
        <div className="shrink-0 p-4 border-t border-border/60 bg-background/50">
          <form onSubmit={handleSend} className="relative flex items-end gap-2 max-w-4xl mx-auto">
            <div className="relative flex-1">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your reply..."
                className="pr-12 h-11 bg-background border-border/60 focus-visible:ring-primary/20 rounded-xl"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <VoiceAgentButton 
                  conversationId={conversationId} 
                  messages={messages ?? []} 
                />
              </div>
            </div>
            <Button type="submit" size="icon" disabled={sending || !message.trim()} className="h-11 w-11 rounded-xl shrink-0">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
        </div>
      </div>

      {/* Right Panel */}
      {showPanel && (
        <VisitorInfoPanel conversationId={conversationId} onClose={() => setShowPanel(false)} />
      )}
    </div>
  );
}

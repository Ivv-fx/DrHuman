"use client";

import { useRef, useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, CheckCircle2, ArrowUpRight, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

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
  const createMessage = useMutation(api.messages.create);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    const content = message;
    setMessage("");
    setSending(true);

    try {
      await createMessage({
        conversationID: conversationId as any,
        content,
      });
    } catch (err) {
      console.error(err);
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
    <div className="flex flex-col flex-1 h-[calc(100vh-3.5rem)] bg-background overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-6 py-3.5 border-b border-border/60 bg-background flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm">Conversation</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {messages === undefined
              ? "Loading..."
              : `${messages.length} message${messages.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
        {messages === undefined && (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
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
                <div className={cn(
                  "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  isRight ? "rounded-tr-sm" : "rounded-tl-sm",
                  config.bubble
                )}>
                  <ReactMarkdown
                    className={cn(
                      "prose prose-sm max-w-none break-words",
                      isRight
                        ? "prose-invert"
                        : "dark:prose-invert"
                    )}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
                <span className="text-[10px] text-muted-foreground/60 px-1">
                  {formatDistanceToNow(msg._creationTime, { addSuffix: true })}
                </span>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-5 py-4 border-t border-border/60 bg-background">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Reply as operator…"
              className="pr-4 bg-muted/50 border-border/60 focus-visible:ring-primary/30 rounded-xl h-10 text-sm placeholder:text-muted-foreground/60"
              disabled={sending}
            />
          </div>
          <Button
            type="submit"
            disabled={!message.trim() || sending}
            size="sm"
            className="h-10 px-4 rounded-xl gap-2 font-medium shadow-sm"
          >
            {sending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            Send
          </Button>
        </form>
        <p className="text-[10px] text-muted-foreground/50 mt-2 text-center">
          Press <kbd className="font-mono bg-muted px-1 py-0.5 rounded text-[9px]">Enter</kbd> to send
        </p>
      </div>
    </div>
  );
}

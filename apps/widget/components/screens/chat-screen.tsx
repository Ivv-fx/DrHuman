"use client";

import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { useAtomValue, useSetAtom } from "jotai";
import { conversationIDAtom } from "./selection-screen";
import { screenAtom } from "@/store/widget-store";
import { useStickToBottom } from "use-stick-to-bottom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";

export function ChatScreen() {
  const conversationID = useAtomValue(conversationIDAtom);
  const setScreen = useSetAtom(screenAtom);
  const [message, setMessage] = useState("");

  const messages = useQuery(api.messages.getMany, conversationID ? { conversationID: conversationID as any } : "skip");
  const createMessage = useMutation(api.messages.create);
  const generateAIResponse = useAction(api.messages.generateAIResponse);

  const { scrollRef, contentRef } = useStickToBottom();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !conversationID) return;

    const currentMessage = message;
    setMessage("");

    try {
      await createMessage({
        conversationID: conversationID as any,
        content: currentMessage,
      });

      // Trigger AI to respond
      await generateAIResponse({
        conversationID: conversationID as any,
        message: currentMessage,
      });
    } catch (e) {
      console.error("Failed to send message:", e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* Premium Header */}
      <div className="flex items-center p-4 bg-gradient-to-r from-emerald-600 to-green-700 text-white shadow-sm z-10">
        <Button variant="ghost" size="icon" onClick={() => setScreen("selection")} className="text-white hover:bg-white/20 hover:text-white rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="ml-3 flex flex-col">
          <h3 className="font-semibold leading-tight">DrHuman AI</h3>
          <span className="text-xs text-emerald-100 opacity-90">Always online</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-slate-50/50 dark:bg-zinc-950/50">
        <div ref={contentRef} className="flex flex-col gap-4">
          {messages?.map((msg) => (
            <div
              key={msg._id}
              className={`flex w-max max-w-[85%] flex-col gap-2 rounded-2xl px-4 py-2.5 text-[15px] shadow-sm ${
                msg.role === "user"
                  ? "ml-auto bg-emerald-600 text-white rounded-br-sm"
                  : "bg-white dark:bg-zinc-900 border border-border/50 text-foreground rounded-bl-sm"
              }`}
            >
              <div className="prose prose-sm dark:prose-invert break-words">
                <ReactMarkdown>
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          {messages?.length === 0 && (
            <div className="text-center text-muted-foreground text-sm mt-10">
              No messages yet. Say hello!
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSend} className="p-3 bg-white dark:bg-zinc-950 border-t flex gap-2 items-center">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 rounded-full bg-slate-100 dark:bg-zinc-900 border-transparent focus-visible:ring-emerald-500"
        />
        <Button type="submit" size="icon" disabled={!message.trim()} className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}

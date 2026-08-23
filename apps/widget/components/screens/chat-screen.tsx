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
    <div className="flex flex-col h-full bg-background relative">
      <div className="flex items-center p-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => setScreen("selection")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h3 className="ml-2 font-semibold">Support</h3>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        <div ref={contentRef} className="flex flex-col gap-4">
          {messages?.map((msg) => (
            <div
              key={msg._id}
              className={`flex w-max max-w-[85%] flex-col gap-2 rounded-lg px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <ReactMarkdown className="prose prose-sm dark:prose-invert break-words">
                {msg.content}
              </ReactMarkdown>
            </div>
          ))}
          {messages?.length === 0 && (
            <div className="text-center text-muted-foreground text-sm mt-10">
              No messages yet. Send a message to start the conversation!
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSend} className="p-3 border-t bg-background flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={!message.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}

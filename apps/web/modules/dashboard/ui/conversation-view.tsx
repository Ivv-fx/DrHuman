"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ConversationViewProps {
  conversationId: string;
}

export function ConversationView({ conversationId }: ConversationViewProps) {
  const [message, setMessage] = useState("");
  const messages = useQuery(api.messages.getMany, { conversationID: conversationId as any });
  const createMessage = useMutation(api.messages.create);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const content = message;
    setMessage("");

    try {
      // Create message as an operator
      await createMessage({
        conversationID: conversationId as any,
        content,
      });
      
      // In a real app we'd also mark the message as coming from a human to stop the AI
      // from processing it, and we would also hit a private mutation to create human messages.
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] flex-1 bg-background relative">
      <div className="p-4 border-b flex items-center justify-between shadow-sm">
        <h3 className="font-semibold">Conversation Details</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {messages?.map((msg) => (
          <div
            key={msg._id}
            className={`flex w-max max-w-[75%] flex-col gap-2 rounded-xl px-4 py-3 text-sm ${
              msg.role === "user"
                ? "bg-muted" // User messages on the left in dashboard
                : "ml-auto bg-primary text-primary-foreground" // Operator/AI messages on the right
            }`}
          >
            <div className="text-[10px] font-semibold opacity-70 mb-1 uppercase tracking-wider">
              {msg.role}
            </div>
            <ReactMarkdown className="prose prose-sm dark:prose-invert break-words">
              {msg.content}
            </ReactMarkdown>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t bg-background flex gap-3">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Reply as an operator..."
          className="flex-1"
        />
        <Button type="submit" disabled={!message.trim()}>
          <Send className="w-4 h-4 mr-2" />
          Send
        </Button>
      </form>
    </div>
  );
}

"use client";

import { useQuery } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { useAtomValue, useSetAtom } from "jotai";
import { sessionIDAtom, screenAtom } from "@/store/widget-store";
import { conversationIDAtom } from "./selection-screen";

import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowRight, MessageSquarePlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function InboxScreen() {
  const sessionID = useAtomValue(sessionIDAtom);
  const setScreen = useSetAtom(screenAtom);
  const setConversationId = useSetAtom(conversationIDAtom);

  const conversations = useQuery(api.conversations.getMany, sessionID ? { contactSessionID: sessionID as any } : "skip");

  const handleOpenConversation = (id: string) => {
    setConversationId(id);
    setScreen("chat");
  };

  return (
    <div className="flex flex-col h-full bg-background relative">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-lg">Your Messages</h3>
        <Button size="sm" onClick={() => setScreen("selection")}>
          <MessageSquarePlus className="w-4 h-4 mr-2" />
          New
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {conversations?.map((conv) => (
          <button
            key={conv._id}
            onClick={() => handleOpenConversation(conv._id)}
            className="flex items-center gap-3 p-3 text-left rounded-lg border bg-card hover:bg-accent transition-colors"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium truncate">Support Team</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(conv._creationTime, { addSuffix: true })}
                </span>
              </div>
              <div className="text-sm text-muted-foreground truncate">
                Status: {conv.status}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </button>
        ))}

        {conversations?.length === 0 && (
          <div className="text-center text-muted-foreground text-sm mt-10">
            No previous conversations found.
          </div>
        )}
      </div>
    </div>
  );
}

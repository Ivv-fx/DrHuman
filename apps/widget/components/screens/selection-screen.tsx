"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { useMutation } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { organizationIDAtom, sessionIDAtom, screenAtom } from "@/store/widget-store";
import { atom } from "jotai";

import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";
import { useState } from "react";

export const conversationIDAtom = atom<string | null>(null);

export function SelectionScreen() {
  const organizationID = useAtomValue(organizationIDAtom);
  const sessionID = useAtomValue(sessionIDAtom);
  const setScreen = useSetAtom(screenAtom);
  const setConversationId = useSetAtom(conversationIDAtom);

  const createConversation = useMutation(api.conversations.create);
  const [isCreating, setIsCreating] = useState(false);

  const handleStartConversation = async () => {
    if (!organizationID || !sessionID) return;
    
    setIsCreating(true);
    try {
      const convId = await createConversation({
        organizationID,
        contactSessionID: sessionID as any,
      });
      
      setConversationId(convId);
      setScreen("chat");
    } catch (e) {
      console.error("Failed to start conversation:", e);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background p-6">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <h2 className="text-xl font-semibold mb-2">How can we help?</h2>
        <p className="text-sm text-muted-foreground mb-8">
          Send us a message and our AI assistant will help you right away.
        </p>

        <Button 
          size="lg" 
          className="w-full" 
          onClick={handleStartConversation}
          disabled={isCreating}
        >
          <MessageSquarePlus className="w-5 h-5 mr-2" />
          {isCreating ? "Starting..." : "Send us a message"}
        </Button>
      </div>
    </div>
  );
}

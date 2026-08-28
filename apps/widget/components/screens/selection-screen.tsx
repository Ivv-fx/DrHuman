"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { useMutation, useQuery } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import {
  organizationIDAtom, sessionIDAtom, screenAtom,
  voiceProviderAtom, voiceAgentIdAtom, dograhBaseUrlAtom,
  systemPromptAtom, businessNameAtom, geminiModelAtom,
} from "@/store/widget-store";
import { atom } from "jotai";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus, Phone, Settings } from "lucide-react";

export const conversationIDAtom = atom<string | null>(null);

export function SelectionScreen() {
  const organizationID    = useAtomValue(organizationIDAtom);
  const sessionID         = useAtomValue(sessionIDAtom);
  const setScreen         = useSetAtom(screenAtom);
  const setConversationId = useSetAtom(conversationIDAtom);

  const setVoiceProvider  = useSetAtom(voiceProviderAtom);
  const setVoiceAgentId   = useSetAtom(voiceAgentIdAtom);
  const setDograhBase     = useSetAtom(dograhBaseUrlAtom);
  const setSystemPrompt   = useSetAtom(systemPromptAtom);
  const setBusinessName   = useSetAtom(businessNameAtom);
  const setGeminiModel    = useSetAtom(geminiModelAtom);

  const createConversation = useMutation(api.conversations.create);
  const [isCreating, setIsCreating] = useState(false);

  const orgSettings = useQuery(
    api.organizations.getSettings,
    organizationID ? { organizationID } : "skip"
  );

  useEffect(() => {
    if (!orgSettings) return;
    setVoiceProvider(orgSettings.voiceProvider as any);
    setBusinessName(orgSettings.businessName ?? null);
    setSystemPrompt(orgSettings.systemPrompt ?? null);
    if (orgSettings.voiceProvider === "vapi")    setVoiceAgentId(orgSettings.vapiAssistantId ?? null);
    if (orgSettings.voiceProvider === "dograh") { setVoiceAgentId(orgSettings.dograhAgentId ?? null); setDograhBase(orgSettings.dograhBaseUrl ?? null); }
    if (orgSettings.voiceProvider === "gemini")  setGeminiModel(orgSettings.geminiModel ?? "gemini-2.0-flash-live-001");
  }, [orgSettings, setVoiceProvider, setVoiceAgentId, setDograhBase, setSystemPrompt, setBusinessName, setGeminiModel]);

  const handleStartConversation = async () => {
    if (!organizationID || !sessionID) return;
    setIsCreating(true);
    try {
      const convId = await createConversation({ organizationID, contactSessionID: sessionID as any });
      setConversationId(convId);
      setScreen("chat");
    } catch (e) { console.error(e); }
    finally { setIsCreating(false); }
  };

  const voiceEnabled = orgSettings?.voiceProvider && orgSettings.voiceProvider !== "disabled";
  const providerLabel = orgSettings?.voiceProvider === "vapi" ? "Vapi" : orgSettings?.voiceProvider === "gemini" ? "Gemini" : "Dograh";

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      <button
        onClick={() => setScreen("settings")}
        className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground/30 hover:text-muted-foreground/70 hover:bg-muted/50 transition-all duration-200"
        title="Voice settings (admin)"
      >
        <Settings className="w-4 h-4" />
      </button>

      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-700 pointer-events-none opacity-20" />

      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 relative z-10">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full shadow-lg flex items-center justify-center mb-6">
          <MessageSquarePlus className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">
          {orgSettings?.businessName ? `${orgSettings.businessName}` : "How can we help?"}
        </h2>
        <p className="text-sm text-muted-foreground mb-8 max-w-[250px]">
          {voiceEnabled
            ? "Chat or start a voice call — we're here to help."
            : "Send us a message and our AI assistant will help you right away."}
        </p>

        <Button size="lg" className="w-full rounded-full shadow-lg hover:shadow-xl transition-all mb-3"
          onClick={handleStartConversation} disabled={isCreating}>
          <MessageSquarePlus className="w-4 h-4 mr-2" />
          {isCreating ? "Starting…" : "Start Chat"}
        </Button>

        {voiceEnabled && (
          <Button size="lg" variant="outline"
            className="w-full rounded-full shadow-md hover:shadow-lg transition-all border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:border-emerald-400"
            onClick={() => setScreen("voice")}>
            <Phone className="w-4 h-4 mr-2 text-emerald-600" />
            Talk to AI
            <span className="ml-auto text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wide">
              {providerLabel}
            </span>
          </Button>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { useMutation, useQuery } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { screenAtom, organizationIDAtom } from "@/store/widget-store";
import type { VoiceProvider } from "@/store/widget-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

type SaveState = "idle" | "saving" | "saved" | "error";

export function VoiceSettingsScreen() {
  const setScreen      = useSetAtom(screenAtom);
  const organizationID = useAtomValue(organizationIDAtom);

  const orgSettings    = useQuery(api.organizations.getSettings, organizationID ? { organizationID } : "skip");
  const upsertSettings = useMutation(api.organizations.upsertSettings);

  const [provider,        setProvider]       = useState<VoiceProvider>("disabled");
  const [businessName,    setBusinessName]   = useState("");
  const [businessContext, setBusinessContext] = useState("");
  const [vapiAssistantId, setVapiAssistantId] = useState("");
  const [geminiModel,     setGeminiModel]    = useState("gemini-2.0-flash-live-001");
  const [saveState,       setSaveState]      = useState<SaveState>("idle");

  useEffect(() => {
    if (!orgSettings) return;
    setProvider(orgSettings.voiceProvider as VoiceProvider);
    setBusinessName(orgSettings.businessName ?? "");
    setBusinessContext(orgSettings.businessContext ?? "");
    setVapiAssistantId(orgSettings.vapiAssistantId ?? "");
    setGeminiModel(orgSettings.geminiModel ?? "gemini-2.0-flash-live-001");
  }, [orgSettings]);

  const handleSave = async () => {
    if (!organizationID) return;
    setSaveState("saving");
    try {
      await upsertSettings({
        organizationID,
        voiceProvider:   provider,
        businessName:    businessName    || undefined,
        businessContext: businessContext || undefined,
        vapiAssistantId: provider === "vapi"   ? vapiAssistantId : undefined,
        geminiModel:     provider === "gemini" ? geminiModel     : undefined,
      });
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch {
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 2500);
    }
  };

  const providers: { value: VoiceProvider; label: string }[] = [
    { value: "disabled", label: "Off"         },
    { value: "gemini",   label: "Gemini Live"  },
    { value: "vapi",     label: "Vapi"         },
  ];

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b">
        <Button variant="ghost" size="icon" onClick={() => setScreen("selection")} className="rounded-full w-8 h-8">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-semibold">Voice Settings</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">

        {/* Business info */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-muted-foreground">Business name</label>
          <Input
            placeholder="e.g. TechCorp"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="rounded-lg text-sm"
          />
          <label className="text-xs text-muted-foreground mt-1">
            What do you do? <span className="text-emerald-500">(keeps AI on-topic)</span>
          </label>
          <textarea
            placeholder="e.g. We provide CRM software and handle billing and onboarding support."
            value={businessContext}
            onChange={(e) => setBusinessContext(e.target.value)}
            rows={2}
            className="w-full text-sm rounded-lg border border-input bg-background px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-muted-foreground/50"
          />
        </div>

        <div className="h-px bg-border" />

        {/* Provider pills */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-muted-foreground">Voice provider</label>
          <div className="flex gap-2">
            {providers.map((p) => (
              <button
                key={p.value}
                onClick={() => setProvider(p.value)}
                className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all ${
                  provider === p.value
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                    : "border-border text-muted-foreground hover:border-emerald-300 hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Provider-specific fields */}
        {provider === "gemini" && (
          <div className="flex flex-col gap-2">
            <label className="text-xs text-muted-foreground">Model</label>
            <select
              value={geminiModel}
              onChange={(e) => setGeminiModel(e.target.value)}
              className="w-full text-sm rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="gemini-2.0-flash-live-001">Flash (Fast)</option>
              <option value="gemini-2.5-flash-preview-native-audio-dialog">Flash 2.5 (Better)</option>
            </select>
          </div>
        )}

        {provider === "vapi" && (
          <div className="flex flex-col gap-2">
            <label className="text-xs text-muted-foreground">Assistant ID</label>
            <Input
              placeholder="3f4e1c2a-..."
              value={vapiAssistantId}
              onChange={(e) => setVapiAssistantId(e.target.value)}
              className="rounded-lg text-sm font-mono"
            />
          </div>
        )}

      </div>

      {/* Save */}
      <div className="p-4 border-t">
        <Button onClick={handleSave} disabled={saveState === "saving"} className="w-full rounded-full"
          variant={saveState === "error" ? "destructive" : "default"}>
          {saveState === "saving" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {saveState === "saved"  && <CheckCircle2 className="w-4 h-4 mr-2" />}
          {saveState === "error"  && <AlertCircle className="w-4 h-4 mr-2" />}
          {saveState === "idle" ? "Save" : saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved!" : "Error"}
        </Button>
      </div>
    </div>
  );
}

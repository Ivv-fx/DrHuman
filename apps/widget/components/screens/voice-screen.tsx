"use client";

import { useEffect, useCallback } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { useMutation, useQuery } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import {
  screenAtom,
  sessionIDAtom,
  organizationIDAtom,
  voiceCallStateAtom,
  voiceTranscriptAtom,
  voiceProviderAtom,
} from "@/store/widget-store";
import { useVoiceProvider } from "@/hooks/use-voice-provider";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mic, MicOff, PhoneOff } from "lucide-react";

export function VoiceScreen() {
  const setScreen       = useSetAtom(screenAtom);
  const organizationID  = useAtomValue(organizationIDAtom);
  const sessionID       = useAtomValue(sessionIDAtom);
  const setCallState    = useSetAtom(voiceCallStateAtom);
  const setTranscriptAtom = useSetAtom(voiceTranscriptAtom);
  const provider        = useAtomValue(voiceProviderAtom);

  const logCall = useMutation(api.calls.logFromClient);
  const session = useQuery(api.contact_sessions.getOne, sessionID ? { sessionID: sessionID as any } : "skip");

  const {
    isConnecting,
    isConnected,
    transcript,
    startCall,
    endCall,
    agentId,
  } = useVoiceProvider();

  // Sync transcript into global atom (for parent components if needed)
  useEffect(() => {
    setTranscriptAtom(transcript);
  }, [transcript, setTranscriptAtom]);

  // Sync call state into global atom
  useEffect(() => {
    if (isConnecting) setCallState("connecting");
    else if (isConnected) setCallState("active");
    else setCallState("idle");
  }, [isConnecting, isConnected, setCallState]);

  // Auto-start call when data is ready
  useEffect(() => {
    if (!agentId) return;
    if (sessionID && session === undefined) return; // wait for query to load
    const metadata: Record<string, string> = {};
    if (organizationID) metadata.organizationID = organizationID;
    if (sessionID) metadata.contactSessionID = sessionID;
    if (session?.name) metadata.userName = session.name;

    startCall(agentId, metadata);

    if (organizationID) {
      logCall({
        organizationID,
        contactSessionID: sessionID as any ?? undefined,
        provider: provider === "vapi" ? "vapi" : "dograh",
        status: "started",
      }).catch(console.error);
    }

    // Cleanup: end call if user navigates away
    return () => {
      endCall();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, sessionID, agentId]);

  const handleEndCall = useCallback(() => {
    endCall();

    if (organizationID) {
      logCall({
        organizationID,
        contactSessionID: sessionID as any ?? undefined,
        provider: provider === "vapi" ? "vapi" : "dograh",
        status: "ended",
        transcript,
      }).catch(console.error);
    }

    setCallState("ended");
    setScreen("selection");
  }, [endCall, organizationID, sessionID, provider, transcript, logCall, setCallState, setScreen]);

  const providerLabel = provider === "vapi" ? "Vapi" : "Dograh AI";
  const providerColor = provider === "vapi" ? "from-violet-500 to-purple-600" : "from-emerald-500 to-green-600";

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">

      {/* Background radial glow — pulses when connected */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none ${
          isConnected ? "opacity-20" : "opacity-0"
        }`}
        style={{
          background: provider === "vapi"
            ? "radial-gradient(circle at 50% 40%, #7c3aed 0%, transparent 70%)"
            : "radial-gradient(circle at 50% 40%, #059669 0%, transparent 70%)",
        }}
      />

      {/* Header */}
      <div className={`flex items-center p-4 bg-gradient-to-r ${providerColor} text-white shadow-sm z-10`}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => { endCall(); setScreen("selection"); }}
          className="text-white hover:bg-white/20 hover:text-white rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="ml-3 flex flex-col">
          <h3 className="font-semibold leading-tight">AI Voice Call</h3>
          <span className="text-xs opacity-80">Powered by {providerLabel}</span>
        </div>

        {/* Provider badge */}
        <span className="ml-auto text-[10px] font-semibold bg-white/20 rounded-full px-2 py-0.5 uppercase tracking-wider">
          {providerLabel}
        </span>
      </div>

      {/* Main call area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 relative z-10">

        {/* Animated waveform rings */}
        <div className="relative flex items-center justify-center w-32 h-32">
          {/* Outer pulse rings — only visible when connected */}
          {isConnected && (
            <>
              <span
                className={`absolute inset-0 rounded-full bg-gradient-to-br ${providerColor} opacity-20 animate-ping`}
                style={{ animationDuration: "2s" }}
              />
              <span
                className={`absolute inset-2 rounded-full bg-gradient-to-br ${providerColor} opacity-20 animate-ping`}
                style={{ animationDuration: "2.4s", animationDelay: "0.3s" }}
              />
              <span
                className={`absolute inset-4 rounded-full bg-gradient-to-br ${providerColor} opacity-20 animate-ping`}
                style={{ animationDuration: "2.8s", animationDelay: "0.6s" }}
              />
            </>
          )}

          {/* Center icon button */}
          <div
            className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-2xl bg-gradient-to-br ${providerColor} transition-transform duration-300 ${
              isConnected ? "scale-110" : "scale-100"
            }`}
          >
            {isConnecting ? (
              <div className="w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isConnected ? (
              <Mic className="w-8 h-8 text-white" />
            ) : (
              <MicOff className="w-8 h-8 text-white opacity-60" />
            )}
          </div>
        </div>

        {/* Status text */}
        <div className="text-center">
          <p className="text-base font-semibold tracking-tight">
            {isConnecting
              ? "Connecting…"
              : isConnected
              ? "Listening…"
              : "Call ended"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {isConnecting
              ? "Setting up your voice session"
              : isConnected
              ? "Speak naturally, the AI is ready"
              : "Your call has ended"}
          </p>
        </div>

        {/* Live transcript */}
        {transcript.trim().length > 0 && (
          <div className="w-full max-h-32 overflow-y-auto rounded-xl bg-muted/50 border border-border/40 px-4 py-3 text-sm text-muted-foreground leading-relaxed">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1">
              Transcript
            </p>
            <p className="whitespace-pre-wrap">{transcript.trim()}</p>
          </div>
        )}
      </div>

      {/* End call button */}
      <div className="p-6 flex justify-center z-10">
        <Button
          onClick={handleEndCall}
          disabled={!isConnected && !isConnecting}
          variant="destructive"
          size="lg"
          className="w-16 h-16 rounded-full shadow-xl hover:scale-105 transition-transform flex items-center justify-center"
        >
          <PhoneOff className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}


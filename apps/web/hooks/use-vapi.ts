import { useState, useEffect, useCallback } from "react";
import Vapi from "@vapi-ai/web";
import { useMutation } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import type { Id } from "@repo/backend/convex/_generated/dataModel";

export function useVapi(conversationId?: string, chatHistory: any[] = []) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const createMessage = useMutation(api.messages.create);

  const [vapi] = useState(() => new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || ""));

  const playChime = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn("AudioContext not supported or blocked");
    }
  };

  useEffect(() => {
    const onCallStart = () => {
      setIsConnecting(false);
      setIsConnected(true);
      setError(null);
    };

    const onCallEnd = () => {
      setIsConnecting(false);
      setIsConnected(false);
      setIsSpeaking(false);
    };

    const onSpeechStart = () => {
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      setIsSpeaking(false);
    };

    const onMessage = (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        if (conversationId) {
          createMessage({
            conversationID: conversationId as Id<"conversations">,
            content: message.transcript,
            role: message.role, // "user" or "assistant"
          }).catch(console.error);
        }
      }
    };

    const onError = (e: any) => {
      console.error("Vapi Error:", e);
      setError(e?.message || "An error occurred");
      setIsConnecting(false);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("message", onMessage);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("message", onMessage);
      vapi.off("error", onError);
      vapi.stop();
    };
  }, [vapi, conversationId, createMessage]);

  const toggleCall = useCallback(async () => {
    if (isConnected) {
      vapi.stop();
    } else {
      setIsConnecting(true);
      setError(null);
      playChime();
      
      try {
        const vapiMessages: any[] = [
          {
            role: "system",
            content: `You are a helpful, professional, and friendly AI voice assistant for DrHuman AI. Keep your answers concise and conversational. ${conversationId ? "You are speaking directly in the context of an existing conversation thread." : ""}`,
          },
          ...chatHistory.map((m) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: String(m.content),
          })),
        ];

        const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
        
        if (assistantId) {
          await vapi.start(assistantId, {
            model: { messages: vapiMessages } as any
          });
        } else {
          await vapi.start({
            name: "DrHuman AI Assistant",
            model: {
              provider: "openai",
              model: "gpt-4",
              messages: vapiMessages,
            },
          });
        }
      } catch (e: any) {
        console.error(e);
        setError(e?.message || "Failed to start call");
        setIsConnecting(false);
      }
    }
  }, [isConnected, vapi, conversationId, chatHistory]);

  return {
    isConnecting,
    isConnected,
    isSpeaking,
    error,
    toggleCall,
  };
}


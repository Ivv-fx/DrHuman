import { useEffect, useState, useCallback } from "react";
import Vapi from "@vapi-ai/web";
import type { VoiceHookResult } from "./use-dograh";

const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "dummy-key");

export function useVapi(): VoiceHookResult {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected,  setIsConnected]  = useState(false);
  const [transcript,   setTranscript]   = useState("");

  useEffect(() => {
    vapi.on("call-start", () => {
      setIsConnecting(false);
      setIsConnected(true);
    });

    vapi.on("call-end", () => {
      setIsConnecting(false);
      setIsConnected(false);
      setTranscript("");
    });

    vapi.on("message", (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        setTranscript((prev) => prev + " " + message.text);
      }
    });

    vapi.on("error", (error: any) => {
      console.error("[Vapi] Error:", error);
      setIsConnecting(false);
      setIsConnected(false);
    });

    return () => {
      vapi.removeAllListeners();
    };
  }, []);

  const startCall = useCallback(async (
    assistantId: string,
    metadata: Record<string, string> = {}
  ) => {
    setIsConnecting(true);
    setTranscript("");
    try {
      // Pass metadata so Vapi sends it back in webhook payloads
      await vapi.start(assistantId, { metadata });
    } catch (error) {
      console.error("[Vapi] Failed to start call:", error);
      setIsConnecting(false);
    }
  }, []);

  const endCall = useCallback(() => {
    vapi.stop();
  }, []);

  return { isConnecting, isConnected, transcript, startCall, endCall };
}

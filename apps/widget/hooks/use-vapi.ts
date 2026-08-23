import { useEffect, useState, useCallback } from "react";
import Vapi from "@vapi-ai/web";

const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "dummy-key");

export function useVapi() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [transcript, setTranscript] = useState("");

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

    vapi.on("message", (message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        setTranscript((prev) => prev + " " + message.text);
      }
    });

    vapi.on("error", (error) => {
      console.error(error);
      setIsConnecting(false);
      setIsConnected(false);
    });

    return () => {
      vapi.removeAllListeners();
    };
  }, []);

  const startCall = useCallback(async (assistantId: string) => {
    setIsConnecting(true);
    try {
      await vapi.start(assistantId);
    } catch (error) {
      console.error("Failed to start call", error);
      setIsConnecting(false);
    }
  }, []);

  const endCall = useCallback(() => {
    vapi.stop();
  }, []);

  return {
    isConnecting,
    isConnected,
    transcript,
    startCall,
    endCall,
  };
}

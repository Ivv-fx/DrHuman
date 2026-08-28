/**
 * use-dograh.ts
 *
 * Dograh AI voice provider hook for VivekAI widget.
 *
 * Dograh uses a WebRTC-based approach similar to Vapi.
 * This hook returns the same interface as use-vapi.ts so
 * use-voice-provider.ts can swap them transparently.
 *
 * Setup:
 *  1. Deploy Dograh on your DigitalOcean VPS (see Dograh HQ docs)
 *  2. Set voiceProvider = "dograh" in your org_settings
 *  3. Set dograhBaseUrl = "http://your-vps-ip:3000" and dograhAgentId in org_settings
 *
 * When Dograh publishes an official JS/WebRTC SDK, replace the
 * fetch-based signalling below with their SDK calls.
 */
import { useEffect, useRef, useState, useCallback } from "react";

export interface VoiceHookResult {
  isConnecting:  boolean;
  isConnected:   boolean;
  transcript:    string;
  startCall:     (agentId: string, metadata?: Record<string, string>) => Promise<void>;
  endCall:       () => void;
}

export function useDograh(baseUrl: string | null): VoiceHookResult {
  const [isConnecting,  setIsConnecting]  = useState(false);
  const [isConnected,   setIsConnected]   = useState(false);
  const [transcript,    setTranscript]    = useState("");

  // WebSocket for real-time transcript streaming from Dograh
  const wsRef    = useRef<WebSocket | null>(null);
  // MediaStream (user microphone)
  const streamRef = useRef<MediaStream | null>(null);
  // Dograh session ID for terminating the call
  const sessionIdRef = useRef<string | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    sessionIdRef.current = null;
  };

  const startCall = useCallback(async (
    agentId: string,
    metadata: Record<string, string> = {}
  ) => {
    if (!baseUrl) {
      console.error("[Dograh] baseUrl is not configured.");
      return;
    }

    setIsConnecting(true);
    setTranscript("");

    try {
      // Step 1: Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Step 2: Create a Dograh session via REST
      const sessionRes = await fetch(`${baseUrl}/api/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, metadata }),
      });

      if (!sessionRes.ok) {
        throw new Error(`Dograh session creation failed: ${sessionRes.status}`);
      }

      const { sessionId, wsUrl } = await sessionRes.json();
      sessionIdRef.current = sessionId;

      // Step 3: Connect WebSocket for transcript streaming
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnecting(false);
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          // Dograh streams transcript events: { type: "transcript", text: "...", final: true }
          if (msg.type === "transcript" && msg.final) {
            setTranscript((prev) => prev + " " + msg.text);
          }
          // Call ended from server side
          if (msg.type === "call.ended") {
            setIsConnected(false);
            cleanup();
          }
        } catch {
          // Non-JSON messages (e.g. ping frames) — ignore
        }
      };

      ws.onerror = (err) => {
        console.error("[Dograh] WebSocket error:", err);
        setIsConnecting(false);
        setIsConnected(false);
        cleanup();
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
      };

      // Step 4: Stream mic audio to Dograh via WebSocket binary frames
      // Dograh expects raw PCM or Opus; for now we send audio blobs via MediaRecorder
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      recorder.ondataavailable = (e) => {
        if (ws.readyState === WebSocket.OPEN && e.data.size > 0) {
          ws.send(e.data);
        }
      };
      recorder.start(100); // send chunks every 100ms

    } catch (error) {
      console.error("[Dograh] Failed to start call:", error);
      setIsConnecting(false);
      cleanup();
    }
  }, [baseUrl]);

  const endCall = useCallback(() => {
    if (sessionIdRef.current && baseUrl) {
      // Notify Dograh server to terminate the session gracefully
      fetch(`${baseUrl}/api/sessions/${sessionIdRef.current}/end`, {
        method: "POST",
      }).catch(console.error);
    }
    setIsConnected(false);
    setIsConnecting(false);
    cleanup();
  }, [baseUrl]);

  return { isConnecting, isConnected, transcript, startCall, endCall };
}

/**
 * use-gemini-live.ts
 *
 * Google Gemini Live API voice hook for VivekAI widget.
 *
 * HOW IT WORKS:
 *  1. Widget calls /api/gemini-token (Next.js route) to get a short-lived token
 *  2. Opens a WebSocket directly to Gemini Live using that token
 *  3. Streams microphone audio as base64 PCM chunks
 *  4. Gemini streams back audio + transcript in real time
 *  5. Web Audio API plays Gemini's voice response
 *
 * TOPIC LOCKING:
 *  The systemPrompt passed here is injected as the Gemini system instruction.
 *  It explicitly tells the model to ONLY discuss the business topic and politely
 *  refuse anything off-topic.
 *
 * NO VPS NEEDED — calls go directly browser ↔ Google.
 */
import { useEffect, useRef, useState, useCallback } from "react";
import type { VoiceHookResult } from "./use-dograh";

const GEMINI_WS_URL = "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent";

interface UseGeminiLiveOptions {
  model?:        string;
  systemPrompt?: string | null;
  businessName?: string | null;
}

/**
 * Builds a topic-locked system prompt from business context.
 * Used when the admin hasn't written a custom prompt.
 */
function buildSystemPrompt(businessName: string | null, context: string | null): string {
  const name = businessName || "this business";
  const ctx  = context    || "customer support";

  return `You are a friendly, professional AI voice assistant for ${name}.

Your job: ${ctx}

STRICT RULES — follow these without exception:
1. ONLY answer questions directly related to ${name} and its services/products.
2. If a customer asks about ANYTHING outside your business scope (sports, politics, personal advice, other companies, general knowledge, coding help, etc.), politely say:
   "I'm only able to help with questions about ${name}. Is there anything about our services I can assist you with?"
3. Never pretend to be a general AI assistant or ChatGPT.
4. Keep responses concise and conversational — this is a voice call, not a text chat.
5. Be warm, helpful, and professional at all times.
6. If you don't know the answer to a business-related question, say so honestly and offer to connect them with a human agent.`;
}

export function useGeminiLive(options: UseGeminiLiveOptions = {}): VoiceHookResult {
  const { model = "gemini-2.0-flash-live-001", systemPrompt, businessName } = options;

  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected,  setIsConnected]  = useState(false);
  const [transcript,   setTranscript]   = useState("");

  const wsRef           = useRef<WebSocket | null>(null);
  const mediaRecRef     = useRef<MediaRecorder | null>(null);
  const streamRef       = useRef<MediaStream | null>(null);
  const audioCtxRef     = useRef<AudioContext | null>(null);
  const audioQueueRef   = useRef<AudioBuffer[]>([]);
  const isPlayingRef    = useRef(false);

  useEffect(() => { return () => cleanup(); }, []);

  const cleanup = () => {
    mediaRecRef.current?.stop();
    wsRef.current?.close();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close();
    wsRef.current    = null;
    mediaRecRef.current = null;
    streamRef.current   = null;
    audioCtxRef.current = null;
    audioQueueRef.current = [];
    isPlayingRef.current  = false;
  };

  // Play audio chunks from Gemini response queue
  const playNextChunk = useCallback(() => {
    if (!audioCtxRef.current || audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      return;
    }
    isPlayingRef.current = true;
    const buf = audioQueueRef.current.shift()!;
    const src = audioCtxRef.current.createBufferSource();
    src.buffer = buf;
    src.connect(audioCtxRef.current.destination);
    src.onended = playNextChunk;
    src.start();
  }, []);

  const startCall = useCallback(async (
    _agentId: string,                          // unused for Gemini (no agent ID concept)
    metadata: Record<string, string> = {}
  ) => {
    setIsConnecting(true);
    setTranscript("");

    try {
      // Step 1: Get ephemeral token from our secure Next.js route
      const tokenRes = await fetch("/api/gemini-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model }),
      });

      if (!tokenRes.ok) throw new Error("Failed to get Gemini token");
      const { token } = await tokenRes.json();

      // Step 2: Get mic access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true },
      });
      streamRef.current = stream;

      // Step 3: Set up Audio Context for playing Gemini's voice
      audioCtxRef.current = new AudioContext({ sampleRate: 24000 });

      // Step 4: Open WebSocket to Gemini Live
      const ws = new WebSocket(`${GEMINI_WS_URL}?ephemeralToken=${token}`);
      wsRef.current = ws;

      ws.onopen = () => {
        // Send setup with system instruction (topic lock)
        let prompt = systemPrompt || buildSystemPrompt(businessName ?? metadata.businessName ?? null, null); if (metadata.userName) prompt += "\n\nIMPORTANT: You are talking to " + metadata.userName + ". Be polite and use their name naturally.";

        ws.send(JSON.stringify({
          setup: {
            model: `models/${model}`,
            system_instruction: {
              parts: [{ text: prompt }],
            },
            generation_config: {
              response_modalities: ["AUDIO"],
              speech_config: {
                voice_config: {
                  prebuilt_voice_config: { voice_name: "Aoede" }, // natural female voice
                },
              },
            },
          },
        }));

        setIsConnecting(false);
        setIsConnected(true);

        // Step 5: Start sending mic audio as base64 PCM
        const recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
        mediaRecRef.current = recorder;

        recorder.ondataavailable = async (e) => {
          if (ws.readyState !== WebSocket.OPEN || e.data.size === 0) return;
          // Convert blob to base64
          const buf   = await e.data.arrayBuffer();
          const b64   = btoa(String.fromCharCode(...new Uint8Array(buf)));
          ws.send(JSON.stringify({
            realtime_input: {
              media_chunks: [{ mime_type: "audio/webm;codecs=opus", data: b64 }],
            },
          }));
        };
        recorder.start(200); // 200ms chunks
      };

      ws.onmessage = async (event) => {
        let msg: any;
        try { msg = JSON.parse(event.data); } catch { return; }

        // Handle transcript
        const parts = msg?.serverContent?.modelTurn?.parts ?? [];
        for (const part of parts) {
          // Text transcript
          if (part.text) {
            setTranscript((prev) => prev + " " + part.text);
          }
          // Audio response — decode and queue for playback
          if (part.inlineData?.mimeType?.startsWith("audio/") && part.inlineData.data) {
            try {
              const raw  = atob(part.inlineData.data);
              const pcm  = new Uint8Array(raw.length).map((_, i) => raw.charCodeAt(i));
              const decoded = await audioCtxRef.current!.decodeAudioData(pcm.buffer);
              audioQueueRef.current.push(decoded);
              if (!isPlayingRef.current) playNextChunk();
            } catch { /* ignore decode errors */ }
          }
        }
      };

      ws.onerror = (e) => {
        console.error("[GeminiLive] WebSocket error:", e);
        setIsConnecting(false);
        setIsConnected(false);
        cleanup();
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
      };

    } catch (err) {
      console.error("[GeminiLive] Failed to start:", err);
      setIsConnecting(false);
      cleanup();
    }
  }, [model, systemPrompt, businessName, playNextChunk]);

  const endCall = useCallback(() => {
    setIsConnected(false);
    setIsConnecting(false);
    cleanup();
  }, []);

  return { isConnecting, isConnected, transcript, startCall, endCall };
}



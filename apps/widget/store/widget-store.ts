import { atom } from "jotai";

export type ScreenState = "loading" | "error" | "out" | "selection" | "chat" | "voice" | "settings";

export type VoiceProvider  = "disabled" | "vapi" | "dograh" | "gemini";
export type VoiceCallState = "idle" | "connecting" | "active" | "ended" | "failed";

export const screenAtom         = atom<ScreenState>("loading");
export const sessionIDAtom      = atom<string | null>(null);
export const organizationIDAtom = atom<string | null>(null);
export const isOpenAtom         = atom<boolean>(false);

// Voice Provider State
export const voiceProviderAtom   = atom<VoiceProvider>("disabled");
export const voiceAgentIdAtom    = atom<string | null>(null);
export const dograhBaseUrlAtom   = atom<string | null>(null);
export const voiceCallStateAtom  = atom<VoiceCallState>("idle");
export const voiceTranscriptAtom = atom<string>("");

// Business / System Prompt State (used for topic-locking)
export const businessNameAtom    = atom<string | null>(null);
export const systemPromptAtom    = atom<string | null>(null);

// Gemini model (default: flash live)
export const geminiModelAtom     = atom<string>("gemini-2.0-flash-live-001");

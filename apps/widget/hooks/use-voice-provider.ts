/**
 * use-voice-provider.ts
 *
 * Unified voice provider abstraction — swaps between Vapi, Dograh, Gemini Live
 * transparently. VoiceScreen only uses this hook and never imports providers directly.
 */
import { useAtomValue } from "jotai";
import {
  voiceProviderAtom,
  voiceAgentIdAtom,
  dograhBaseUrlAtom,
  systemPromptAtom,
  businessNameAtom,
  geminiModelAtom,
} from "@/store/widget-store";
import { useVapi }        from "./use-vapi";
import { useDograh }      from "./use-dograh";
import { useGeminiLive }  from "./use-gemini-live";

export function useVoiceProvider() {
  const provider     = useAtomValue(voiceProviderAtom);
  const agentId      = useAtomValue(voiceAgentIdAtom);
  const dograhBase   = useAtomValue(dograhBaseUrlAtom);
  const systemPrompt = useAtomValue(systemPromptAtom);
  const businessName = useAtomValue(businessNameAtom);
  const geminiModel  = useAtomValue(geminiModelAtom);

  const vapi   = useVapi();
  const dograh = useDograh(dograhBase);
  const gemini = useGeminiLive({ model: geminiModel, systemPrompt, businessName });

  const active =
    provider === "vapi"   ? vapi   :
    provider === "dograh" ? dograh :
    provider === "gemini" ? gemini :
    vapi; // fallback

  return { ...active, provider, agentId };
}

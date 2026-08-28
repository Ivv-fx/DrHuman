"use client";

import { useAtomValue } from "jotai";
import { screenAtom } from "@/store/widget-store";
import { LoadingScreen } from "./screens/loading-screen";
import { ErrorScreen } from "./screens/error-screen";
import { OutScreen } from "./screens/out-screen";
import { SelectionScreen } from "./screens/selection-screen";
import { ChatScreen } from "./screens/chat-screen";
import { VoiceScreen } from "./screens/voice-screen";
import { VoiceSettingsScreen } from "./screens/voice-settings-screen";

export function WidgetRouter() {
  const screen = useAtomValue(screenAtom);

  switch (screen) {
    case "loading":
      return <LoadingScreen />;
    case "error":
      return <ErrorScreen />;
    case "out":
      return <OutScreen />;
    case "selection":
      return <SelectionScreen />;
    case "chat":
      return <ChatScreen />;
    case "voice":
      return <VoiceScreen />;
    case "settings":
      return <VoiceSettingsScreen />;
    default:
      return null;
  }
}

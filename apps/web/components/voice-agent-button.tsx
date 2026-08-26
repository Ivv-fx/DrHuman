"use client";

import { useVapi } from "@/hooks/use-vapi";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function VoiceAgentButton({ conversationId, messages = [] }: { conversationId?: string, messages?: any[] }) {
  const { isConnecting, isConnected, isSpeaking, error, toggleCall } = useVapi(conversationId, messages);

  return (
    <div className="flex items-center gap-2 relative">
      {error && (
        <div className="absolute bottom-full right-0 mb-2 bg-destructive/10 text-destructive px-3 py-1.5 rounded-md text-xs font-medium border border-destructive/20 shadow-sm backdrop-blur-sm whitespace-nowrap">
          {error}
        </div>
      )}
      
      <Button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          toggleCall();
        }}
        disabled={isConnecting}
        size="icon"
        className={cn(
          "w-10 h-10 rounded-xl transition-all duration-300 relative overflow-hidden group shadow-sm",
          isConnected 
            ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
            : "bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
        )}
      >
        {isConnecting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isConnected ? (
          <Square className="w-4 h-4 fill-current" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
        
        {/* Pulse effect when speaking */}
        {isSpeaking && (
          <span className="absolute inset-0 rounded-xl animate-ping bg-white/30" />
        )}
      </Button>
    </div>
  );
}

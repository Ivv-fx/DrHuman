"use client";

import { useVapi } from "@/hooks/use-vapi";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Page() {
  const { isConnecting, isConnected, transcript, startCall, endCall } = useVapi();
  const [assistantId, setAssistantId] = useState("");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-4 bg-muted/20">
      <h1 className="text-2xl font-bold">Vapi Voice Agent Test</h1>
      
      <div className="flex flex-col gap-2 w-full max-w-sm">
        <label className="text-sm font-medium">Assistant ID</label>
        <input 
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={assistantId}
          onChange={(e) => setAssistantId(e.target.value)}
          placeholder="Paste Assistant ID here..."
        />
      </div>

      <div className="flex gap-4 mt-4">
        {!isConnected ? (
          <Button 
            onClick={() => startCall(assistantId)} 
            disabled={isConnecting || !assistantId}
          >
            {isConnecting ? "Connecting..." : "Start Call"}
          </Button>
        ) : (
          <Button 
            variant="destructive" 
            onClick={endCall}
          >
            End Call
          </Button>
        )}
      </div>

      <div className="w-full max-w-lg mt-8 p-4 rounded-lg border bg-card min-h-32 text-sm">
        <p className="font-semibold mb-2">Transcript:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">
          {transcript || "Waiting for speech..."}
        </p>
      </div>
    </div>
  );
}

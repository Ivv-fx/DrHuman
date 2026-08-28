"use client";

import { useAtom, useSetAtom } from "jotai";
import { useEffect } from "react";
import { organizationIDAtom, screenAtom, isOpenAtom } from "@/store/widget-store";
import { WidgetRouter } from "./widget-router";
import { useMutation } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WidgetViewProps {
  organizationID: string | null;
}

export function WidgetView({ organizationID }: WidgetViewProps) {
  const setOrgId = useSetAtom(organizationIDAtom);
  const setScreen = useSetAtom(screenAtom);
  const [isOpen, setIsOpen] = useAtom(isOpenAtom);

  const recordEvent = useMutation(api.telemetry.recordEvent);

  useEffect(() => {
    if (organizationID) {
      setOrgId(organizationID);
      recordEvent({ organizationID, event: "widget_load" }).catch(console.error);
    } else {
      setScreen("error");
    }
  }, [organizationID, setOrgId, recordEvent, setScreen]);

  return (
    <div className="fixed bottom-4 right-4 z-[999999] flex flex-col items-end gap-4 font-sans">
      <div 
        className={`transition-all duration-300 ease-in-out origin-bottom-right transform ${
          isOpen ? "scale-100 opacity-100 pointer-events-auto" : "scale-95 opacity-0 pointer-events-none"
        } w-[360px] h-[600px] max-h-[80vh] bg-background border border-border/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col bg-background/95 backdrop-blur-md`}
      >
        <WidgetRouter />
      </div>

      <Button 
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className="w-14 h-14 rounded-full shadow-xl hover:scale-105 transition-transform bg-primary text-primary-foreground flex items-center justify-center"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </Button>
    </div>
  );
}

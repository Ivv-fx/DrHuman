"use client";

import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { organizationIDAtom } from "@/store/widget-store";
import { WidgetRouter } from "./widget-router";
import { useMutation } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";

interface WidgetViewProps {
  organizationID: string | null;
}

export function WidgetView({ organizationID }: WidgetViewProps) {
  const setOrgId = useSetAtom(organizationIDAtom);

  const recordEvent = useMutation(api.telemetry.recordEvent);

  useEffect(() => {
    if (organizationID) {
      setOrgId(organizationID);
      recordEvent({ organizationID, event: "widget_load" }).catch(console.error);
    }
  }, [organizationID, setOrgId, recordEvent]);

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden border">
      <WidgetRouter />
    </div>
  );
}

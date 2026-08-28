"use client";

import { useEffect, useState } from "react";
import { useAction } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { useAtom, useAtomValue } from "jotai";
import { organizationIDAtom, screenAtom } from "@/store/widget-store";
import { Loader2 } from "lucide-react";

export function LoadingScreen() {
  const organizationID = useAtomValue(organizationIDAtom);
  const [, setScreen] = useAtom(screenAtom);
  const validateOrg = useAction(api.organizations.validate);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkSetup() {
      if (!organizationID) {
        return;
      }

      try {
        const isValid = await validateOrg({ organizationID });
        if (isValid && mounted) {
          // Temporarily go to "out" screen (onboarding form)
          // Later we will check localStorage for an existing session
          setScreen("out");
        } else if (mounted) {
          setScreen("error");
        }
      } catch (e) {
        if (mounted) setScreen("error");
      }
    }

    checkSetup();

    return () => {
      mounted = false;
    };
  }, [organizationID, validateOrg, setScreen]);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      <p className="mt-4 text-sm text-muted-foreground">Initializing...</p>
    </div>
  );
}

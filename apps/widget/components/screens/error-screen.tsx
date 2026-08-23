"use client";

import { AlertCircle } from "lucide-react";

export function ErrorScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
      <AlertCircle className="w-10 h-10 text-destructive mb-4" />
      <h3 className="font-semibold text-lg">Unable to load widget</h3>
      <p className="text-sm text-muted-foreground mt-2">
        This widget has not been configured properly or the organization ID is invalid.
      </p>
    </div>
  );
}

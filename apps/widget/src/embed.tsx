import React from "react";
import { createRoot } from "react-dom/client";
import { WidgetView } from "../components/widget-view";
import { JotaiProvider } from "../providers/jotai-provider";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import "../app/globals.css";

declare global {
  interface Window {
    DrHumanWidgetConfig?: {
      orgId: string;
    };
  }
}

// Get config from global window object (preferred for async loading) or script tag
const globalConfig = window.DrHumanWidgetConfig;
const scriptTag = document.currentScript as HTMLScriptElement;
const orgId = globalConfig?.orgId || scriptTag?.getAttribute("data-org-id");

if (!orgId) {
  console.error("DrHuman Widget: Missing Organization ID. Please provide it via window.DrHumanWidgetConfig.orgId or data-org-id attribute on the script tag.");
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const App = () => {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <JotaiProvider>
          <WidgetView organizationID={orgId || ""} />
        </JotaiProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
};

const initWidget = () => {
  // Create root div if it doesn't exist
  let rootDiv = document.getElementById("drhuman-widget-root");
  if (!rootDiv) {
    rootDiv = document.createElement("div");
    rootDiv.id = "drhuman-widget-root";
    
    if (!document.body) {
      console.error("DrHuman Widget: document.body is not available to mount the widget.");
      return;
    }
    document.body.appendChild(rootDiv);
  }

  const root = createRoot(rootDiv);
  root.render(<App />);
};

// Wait for DOM to be ready to avoid crashing if script is placed in <head>
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initWidget);
} else {
  initWidget();
}

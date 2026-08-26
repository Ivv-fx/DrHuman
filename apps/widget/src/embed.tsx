import React from "react";
import { createRoot } from "react-dom/client";
import { WidgetView } from "../components/widget-view";
import { JotaiProvider } from "../providers/jotai-provider";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import "../app/globals.css";

// The script tag loading this file should have data-org-id attribute
const scriptTag = document.currentScript as HTMLScriptElement;
const orgId = scriptTag?.getAttribute("data-org-id");

if (!orgId) {
  console.error("DrHuman Widget: Missing data-org-id attribute on script tag");
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

// Create root div if it doesn't exist
let rootDiv = document.getElementById("drhuman-widget-root");
if (!rootDiv) {
  rootDiv = document.createElement("div");
  rootDiv.id = "drhuman-widget-root";
  document.body.appendChild(rootDiv);
}

const root = createRoot(rootDiv);
root.render(<App />);

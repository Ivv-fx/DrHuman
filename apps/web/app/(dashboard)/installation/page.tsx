"use client";

import { useOrganization } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useState } from "react";

export default function InstallationPage() {
  const { organization } = useOrganization();
  const [copied, setCopied] = useState(false);

  // In production, this would be your actual hosted domain
  const widgetUrl = "http://localhost:3002/widget.js";

  const scriptTag = `<script src="${widgetUrl}" data-org-id="${organization?.id}" defer></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptTag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold mb-2">Installation</h1>
        <p className="text-muted-foreground">
          Copy and paste this code snippet into the <code className="bg-muted px-1 py-0.5 rounded">&lt;head&gt;</code> of your website to install the Echo support widget.
        </p>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="p-4 bg-muted/30 border-b flex items-center justify-between">
          <h2 className="font-medium text-sm">Widget Embed Code</h2>
          <Button variant="outline" size="sm" onClick={handleCopy} disabled={!organization?.id}>
            <Copy className="w-4 h-4 mr-2" />
            {copied ? "Copied!" : "Copy Code"}
          </Button>
        </div>
        <div className="p-6 bg-zinc-950 text-zinc-50 overflow-x-auto">
          <pre>
            <code>{organization?.id ? scriptTag : "Please select an organization first."}</code>
          </pre>
        </div>
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 p-4 rounded-xl text-sm border border-blue-100 dark:border-blue-900">
        <strong>Note:</strong> The widget will only appear if the organization ID is valid. Make sure you don't modify the <code>data-org-id</code> attribute.
      </div>
    </div>
  );
}

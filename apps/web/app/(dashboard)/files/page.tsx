"use client";

import { useState } from "react";
import { useOrganization } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { FileText, Upload } from "lucide-react";

export default function FilesPage() {
  const { organization } = useOrganization();
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveFile = useMutation(api.files.saveFile);
  const files = useQuery(api.files.getMany, organization?.id ? { organizationID: organization.id } : "skip");

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !organization?.id) return;

    setIsUploading(true);
    try {
      // Step 1: Get a short-lived upload URL
      const postUrl = await generateUploadUrl();

      // Step 2: POST the file to the URL
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();

      // Step 3: Save the newly allocated storage id to the database
      await saveFile({
        storageId,
        organizationID: organization.id,
        name: file.name,
      });

      setFile(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Knowledge Base</h1>
        <p className="text-muted-foreground">
          Upload text documents to train your AI support agent. The AI will read these files to answer customer questions.
        </p>
      </div>

      <div className="bg-card border rounded-xl p-6">
        <h2 className="font-semibold mb-4">Upload New Document</h2>
        <form onSubmit={handleUpload} className="flex gap-4 items-center">
          <input 
            type="file" 
            accept=".txt,.md,.csv" 
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="flex-1"
          />
          <Button type="submit" disabled={!file || isUploading}>
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? "Uploading..." : "Upload File"}
          </Button>
        </form>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-semibold">Uploaded Documents</h2>
        <div className="grid gap-3">
          {files?.map((f) => (
            <div key={f._id} className="flex items-center gap-4 p-4 border rounded-xl bg-card">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-medium">{f.name}</div>
                <div className="text-sm text-muted-foreground">Status: <span className="capitalize">{f.status}</span></div>
              </div>
            </div>
          ))}
          {files?.length === 0 && (
            <div className="text-muted-foreground text-sm text-center p-8 border rounded-xl border-dashed">
              No files uploaded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

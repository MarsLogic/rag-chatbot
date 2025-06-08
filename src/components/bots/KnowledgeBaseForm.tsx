// src/components/bots/KnowledgeBaseForm.tsx

"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Loader2, UploadCloud } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/server/api/routers/_app";

// Use the recommended `inferRouterOutputs` to get the correct type for our bot object
type Bot = inferRouterOutputs<AppRouter>["bot"]["byId"];

interface KnowledgeBaseFormProps {
  bot: Bot;
}

export function KnowledgeBaseForm({ bot }: KnowledgeBaseFormProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  // We no longer need the tRPC mutations for upload
  // const getUploadUrlMutation = api.bot.getUploadPresignedUrl.useMutation();
  // const confirmUploadMutation = api.bot.confirmUpload.useMutation();

  const onDrop = async (acceptedFiles: File[]) => {
    if (!acceptedFiles || acceptedFiles.length === 0 || !bot) return;
    const file = acceptedFiles[0];
    
    setIsUploading(true);
    
    try {
      // The new endpoint needs the botId and filename as query parameters
      const uploadUrl = `/api/upload?filename=${encodeURIComponent(file.name)}&botId=${bot.id}`;

      // Upload the file directly to our new API route.
      // The route will handle streaming the file to Vercel Blob.
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!response.ok) {
        throw new Error('Upload failed.');
      }
      
      // The API route now returns the newly created document record on success
      const newDocument = await response.json();

      toast({
        title: "Upload Successful",
        description: `"${newDocument.fileName}" has been added to the knowledge base.`,
      });
      
      // Here you can add logic to refresh the list of documents
      // e.g., using a router.refresh() or a query invalidation if using tanstack-query

    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Could not upload the file. Please check the file type and size, and try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    // Let's expand the accepted file types according to our PRD
    accept: { 
      'application/pdf': ['.pdf'], 
      'text/plain': ['.txt'],
      'text/markdown': ['.md', '.markdown'],
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Knowledge Base</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          {...getRootProps()}
          className={`flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed
            ${isDragActive ? "border-primary bg-primary/10" : "border-muted-foreground/30"}`}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center">
              <UploadCloud className="h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">
                <span className="font-semibold text-primary">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">PDF, TXT, DOCX, JSON, or CSV (Max 10MB)</p>
            </div>
          )}
        </div>
        {/* We will list the uploaded files here in a later step */}
      </CardContent>
    </Card>
  );
}
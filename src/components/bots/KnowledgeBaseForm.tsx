// src/components/bots/KnowledgeBaseForm.tsx

"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Loader2, UploadCloud } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/trpc/client";
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

  // New tRPC mutation to create the document record AFTER upload
  const createDocumentMutation = api.bot.createDocument.useMutation({
    onSuccess: (newDocument) => {
      toast({
        title: "Upload Successful",
        description: `"${newDocument.fileName}" has been added to the knowledge base.`,
      });
      // We can add logic to refresh the file list here later
    },
    onError: (error) => {
      console.error("Error creating document record:", error);
      toast({
        title: "Database Error",
        description: "Could not save the document record. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onDrop = async (acceptedFiles: File[]) => {
    if (!acceptedFiles || acceptedFiles.length === 0 || !bot) return;
    const file = acceptedFiles[0];
    
    setIsUploading(true);
    
    try {
      // Step 1: Upload the file to Vercel Blob via our dedicated API route
      // We no longer need to pass the botId here for security reasons.
      const uploadResponse = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload to Vercel Blob failed.');
      }

      // The API route now returns the Vercel Blob result
      const blob = await uploadResponse.json();

      // Step 2: Call the tRPC mutation to save the document metadata to our database
      await createDocumentMutation.mutateAsync({
        botId: bot.id,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        storagePath: blob.url, // The URL returned by our upload API
      });

    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: "Could not upload the file. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
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
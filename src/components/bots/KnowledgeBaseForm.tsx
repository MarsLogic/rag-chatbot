// src/components/bots/KnowledgeBaseForm.tsx

"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Loader2, UploadCloud } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/trpc/client";
// FIX: Import the official type helper from tRPC
import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/server/api/routers/_app";

// FIX: Use the recommended `inferRouterOutputs` to get the correct type for our bot object
type Bot = inferRouterOutputs<AppRouter>["bot"]["byId"];

interface KnowledgeBaseFormProps {
  bot: Bot;
}

export function KnowledgeBaseForm({ bot }: KnowledgeBaseFormProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const getUploadUrlMutation = api.bot.getUploadPresignedUrl.useMutation();
  const confirmUploadMutation = api.bot.confirmUpload.useMutation();

  const onDrop = async (acceptedFiles: File[]) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    
    setIsUploading(true);
    
    try {
      // 1. Get the secure upload URL from our backend
      const { uploadUrl, documentId } = await getUploadUrlMutation.mutateAsync({
        botId: bot.id,
        fileName: file.name,
        fileType: file.type,
      });

      // 2. Upload the file directly to the secure URL (this will be R2 in the future)
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      // 3. Confirm the upload with our backend
      await confirmUploadMutation.mutateAsync({
        botId: bot.id,
        documentId: documentId,
        fileSize: file.size,
      });
      
      toast({
        title: "Upload Successful",
        description: `"${file.name}" has been uploaded.`,
      });

    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Could not upload the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'] },
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
              <p className="text-xs text-muted-foreground">PDF or TXT (Max 10MB)</p>
            </div>
          )}
        </div>
        {/* We will list the uploaded files here in a later step */}
      </CardContent>
    </Card>
  );
}
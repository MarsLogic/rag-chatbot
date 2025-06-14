// src/components/bots/KnowledgeBaseForm.tsx

"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Loader2, UploadCloud, FileText, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/trpc/client";
import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/server/api/routers/_app";
import type { PutBlobResult } from '@vercel/blob';
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useInngestEventListener } from "@/hooks/use-inngest-event-listener";

// --- TYPE DEFINITIONS ---
type Bot = inferRouterOutputs<AppRouter>["bot"]["byId"];
type Document = inferRouterOutputs<AppRouter>["bot"]["listDocuments"][number];

interface KnowledgeBaseFormProps {
  bot: Bot;
}

function formatBytes(bytes: number | null, decimals = 2) {
  if (bytes === null || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function KnowledgeBaseForm({ bot }: KnowledgeBaseFormProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const utils = api.useUtils();

  const { data: documents, isLoading: isLoadingDocuments } = api.bot.listDocuments.useQuery(
    { botId: bot.id },
    {
      refetchInterval: (query) => {
        const currentDocs = query.state.data as Document[] | undefined;
        const isProcessing = currentDocs?.some(
          (doc) => doc.status === 'PROCESSING' || doc.status === 'UPLOADED'
        );
        return isProcessing ? 3000 : false;
      },
      refetchOnWindowFocus: true,
    }
  );

  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useInngestEventListener('app/document.processed', () => {
        utils.bot.listDocuments.invalidate({ botId: bot.id });
      }
    );
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useInngestEventListener('app/document.failed', () => {
        utils.bot.listDocuments.invalidate({ botId: bot.id });
      }
    );
  }

  const createDocumentMutation = api.bot.createDocument.useMutation({
    onSuccess: (newDocument) => {
      toast({
        title: "Upload Successful",
        description: `"${newDocument.fileName}" is now being processed.`,
      });
      utils.bot.listDocuments.invalidate({ botId: bot.id });
    },
    onError: (error) => {
      console.error("Error creating document record:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Could not save the document record. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsUploading(false);
    }
  });

  const deleteDocumentMutation = api.bot.deleteDocument.useMutation({
    onSuccess: () => {
        toast({ title: "Document Deleted", description: "The source has been removed." });
        utils.bot.listDocuments.invalidate({ botId: bot.id });
    },
    onError: (error) => {
        console.error("Error deleting document:", error);
        toast({
            title: "Delete Failed",
            description: "Could not delete the document. Please try again.",
            variant: "destructive",
        });
    },
    onSettled: () => {
        setDeletingId(null);
    }
  });

  const handleDelete = (documentId: string) => {
    if (window.confirm("Are you sure you want to permanently delete this document?")) {
      setDeletingId(documentId);
      deleteDocumentMutation.mutate({ documentId });
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (!acceptedFiles || acceptedFiles.length === 0 || !bot) return;
    const file = acceptedFiles[0];
    
    setIsUploading(true);

    try {
      const uploadResponse = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file,
      });

      if (!uploadResponse.ok) {
          const errorBody = await uploadResponse.text();
          throw new Error(errorBody || "Could not reach the upload server.");
      }
      
      const blob = (await uploadResponse.json()) as PutBlobResult;

      createDocumentMutation.mutate({
          botId: bot.id,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          storagePath: blob.url,
      });
    } catch (error) {
        toast({
            title: "Upload Failed",
            description: error instanceof Error ? error.message : "An unknown error occurred.",
            variant: "destructive",
        });
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

  const getBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'PROCESSED': return 'default';
        case 'FAILED': return 'destructive';
        case 'PROCESSING': return 'secondary';
        case 'UPLOADED': return 'outline';
        default: return 'secondary';
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Knowledge Base</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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

        <div>
          <h3 className="mb-4 text-lg font-medium">Uploaded Sources</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>File Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* SYNTAX FIX: The ternary structure is simplified to remove extra parentheses */}
                {(isLoadingDocuments && !documents) ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      <Loader2 className="mx-auto my-4 h-6 w-6 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : (documents && documents.length > 0) ? (
                  documents.map((doc: Document) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </TableCell>
                      <TableCell className="font-medium">{doc.fileName}</TableCell>
                      <TableCell className="text-muted-foreground">{doc.fileType}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={getBadgeVariant(doc.status)}>
                            {doc.status}
                          </Badge>
                          {(doc.status === 'PROCESSING' || doc.status === 'UPLOADED') && (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatBytes(doc.fileSize)}</TableCell>
                      <TableCell>{new Date(doc.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(doc.id)}
                          disabled={deletingId === doc.id}
                        >
                          {deletingId === doc.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No documents uploaded yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
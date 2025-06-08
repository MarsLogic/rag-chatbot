// src/app/(main)/chatbots/[botId]/settings/page.tsx

"use client";

import { api } from "@/lib/trpc/client";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettingsForm } from "@/components/bots/GeneralSettingsForm";
// FIX: Import the new KnowledgeBaseForm component
import { KnowledgeBaseForm } from "@/components/bots/KnowledgeBaseForm";

export default function BotSettingsPage({
  params,
}: {
  params: { botId: string };
}) {
  const { data: bot, isLoading, error } = api.bot.byId.useQuery({
    id: params.botId,
  });

  if (isLoading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center p-8">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !bot) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error?.message || "Bot not found."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Manage: {bot.name}
          </h2>
          <p className="text-muted-foreground">
            Configure your chatbot's settings, knowledge base, and appearance.
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          {/* FIX: Remove the 'disabled' prop to make the tab clickable */}
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          <TabsTrigger value="prompts" disabled>Prompts</TabsTrigger>
          <TabsTrigger value="appearance" disabled>Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <GeneralSettingsForm bot={bot} />
        </TabsContent>
        
        {/* FIX: Add the new TabsContent block to render our form */}
        <TabsContent value="knowledge" className="space-y-4">
          <KnowledgeBaseForm bot={bot} />
        </TabsContent>

      </Tabs>
    </div>
  );
}
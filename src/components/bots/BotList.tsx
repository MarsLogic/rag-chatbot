// src/components/bots/BotList.tsx

"use client";

import { api } from "@/lib/trpc/client";
import { Loader2, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CreateBotDialog } from "./CreateBotDialog";
// FIX: Import the official type helper from tRPC
import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/server/api/routers/_app";

// FIX: Use the recommended `inferRouterOutputs` to get the correct type for our bot list
type BotListOutput = inferRouterOutputs<AppRouter>["bot"]["list"];

export function BotList() {
  const { data: bots, isLoading } = api.bot.list.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!bots || bots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted bg-background p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <MessageSquare className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold">You have no chatbots yet</h3>
        <p className="text-sm text-muted-foreground">
          Get started by creating your first chatbot.
        </p>
        <CreateBotDialog />
      </div>
    );
  }

  // FIX: Explicitly type the `bots` array before mapping to resolve type errors
  const botList: BotListOutput = bots;

  return (
    <div className="grid gap-4">
      {botList.map((bot) => (
        <Card key={bot.id} className="flex items-center justify-between p-4">
          <div>
            <h4 className="font-semibold">{bot.name}</h4>
            <p className="text-sm text-muted-foreground">
              {bot.description || "No description provided."}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
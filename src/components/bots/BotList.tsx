// src/components/bots/BotList.tsx

"use client";

import { api } from "@/lib/trpc/client";
// FIX: Added Link for navigation and a new icon
import Link from "next/link";
import { Loader2, MessageSquare, MessageCircle, Settings } from "lucide-react"; 
import { Card } from "@/components/ui/card";
import { CreateBotDialog } from "./CreateBotDialog";
import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/server/api/routers/_app";
import { Button } from "@/components/ui/button";

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

  const botList: BotListOutput = bots;

  return (
    <div className="grid gap-4">
      {botList.map((bot) => (
        <Card key={bot.id} className="flex items-center justify-between p-4">
          <div className="flex-1">
            <h4 className="font-semibold">{bot.name}</h4>
            <p className="text-sm text-muted-foreground truncate max-w-md">
              {bot.description || "No description provided."}
            </p>
          </div>
          {/* FIX: Added a container for action buttons */}
          <div className="flex items-center gap-2">
            <Link href={`/chatbots/${bot.id}/chat`} passHref>
              <Button variant="outline" size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat
              </Button>
            </Link>
            <Link href={`/chatbots/${bot.id}/settings`} passHref>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
}
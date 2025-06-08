// src/app/(main)/dashboard/page.tsx
"use client"; // This is the most important line! It changes how the page is built.

import { useSession } from "next-auth/react";
import { CreateBotDialog } from "@/components/bots/CreateBotDialog";
import { BotList } from "@/components/bots/BotList";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  // We now use the `useSession` hook to get session data on the client-side.
  const { data: session, status } = useSession();

  // Handle the loading state while the session is being fetched from the browser.
  if (status === "loading") {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Handle the case where the user is not authenticated.
  if (status === "unauthenticated" || !session?.user?.name) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p className="text-muted-foreground">
          You must be signed in to view this page.
        </p>
      </div>
    );
  }

  // Once authenticated and loaded, render the dashboard.
  const userName = session.user.name;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {userName}!
          </h1>
          <p className="text-muted-foreground">
            Here's a quick overview of your chatbot empire.
          </p>
        </div>
        <CreateBotDialog />
      </div>

      <div className="mt-8">
        <BotList />
      </div>
    </div>
  );
}
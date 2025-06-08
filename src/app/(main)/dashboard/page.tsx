// src/app/(main)/dashboard/page.tsx

import { auth } from "@/server/auth";
// FIX: Using a direct relative path to bypass any alias resolution issues.
import { CreateBotDialog } from "../../../components/bots/CreateBotDialog";
import { BotList } from "../../../components/bots/BotList";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.name) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p>You must be signed in to view this page.</p>
      </div>
    );
  }

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
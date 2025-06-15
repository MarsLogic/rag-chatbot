// src/app/(main)/chatbots/[botId]/chat/page.tsx

"use client";

import { useChat } from "ai/react";
// THE DEFINITIVE FIX: Using the correct import path verified from BotList.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, SendHorizonal, User } from "lucide-react";
import { cn } from "@/lib/utils";

// The props for our page will include the botId from the URL
interface ChatPageProps {
  params: {
    botId: string;
  };
}

export default function ChatPage({ params }: ChatPageProps) {
  const { botId } = params;

  // Use the Vercel AI SDK's useChat hook
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    // Tell the hook where our streaming API is located
    api: "/api/chat", 
    // Pass the botId in the body of every request
    body: {
      botId: botId,
    },
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]"> {/* Full height minus nav */}
      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length > 0 ? (
          messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex gap-4",
                m.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {/* Avatar for Assistant */}
              {m.role === "assistant" && (
                <Avatar className="h-8 w-8">
                  <AvatarImage />
                  <AvatarFallback><Bot size={20} /></AvatarFallback>
                </Avatar>
              )}

              {/* Message Bubble */}
              <div
                className={cn(
                  "rounded-lg p-3 max-w-lg",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>

              {/* Avatar for User */}
              {m.role === "user" && (
                <Avatar className="h-8 w-8">
                  <AvatarImage />
                  <AvatarFallback><User size={20} /></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask your bot a question..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input}>
            {isLoading ? "Thinking..." : <SendHorizonal size={20} />}
          </Button>
        </form>
      </div>
    </div>
  );
}
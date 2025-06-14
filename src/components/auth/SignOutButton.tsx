// src/components/auth/SignOutButton.tsx

"use client"; // 1. This marks the component as a Client Component

// 2. We now import the client-side `signOut` function from next-auth/react
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    // 3. We have removed the <form> wrapper
    <Button
      // 4. We use a simple onClick handler now
      onClick={() => signOut({ callbackUrl: "/login" })}
      variant="ghost"
      className="w-full justify-start gap-3 px-3 text-gray-700"
    >
      <LogOut className="h-4 w-4" />
      <span>Sign Out</span>
    </Button>
  );
}
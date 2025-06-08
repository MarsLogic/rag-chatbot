// src/components/auth/SignOutButton.tsx
import { signOutUser } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <form action={signOutUser} className="w-full">
      <Button
        type="submit"
        variant="ghost"
        className="w-full justify-start gap-3 px-3 text-gray-700"
      >
        <LogOut className="h-4 w-4" />
        <span>Sign Out</span>
      </Button>
    </form>
  );
}